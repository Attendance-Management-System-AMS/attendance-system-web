// src/composables/useDepartments.ts
import { departmentApi } from '@/services/department.service';
import type { Department } from '@/types/department';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export function useDepartments() {
    const queryClient = useQueryClient()

    // Query danh sách
    const departmentsQuery = useQuery<Department[]>({
        queryKey: ['departments'],
        queryFn: async () => {
            const response = await departmentApi.getAll()
            const result = response.data?.result as Department[] | { content?: Department[] } | undefined
            if (Array.isArray(result)) return result
            if (result && Array.isArray(result.content)) return result.content
            return []
        },
        staleTime: 1000 * 60 * 3, // 3 phút
        gcTime: 1000 * 60 * 10,   // giữ cache 10 phút
    })

    // Mutation tạo
    const createDepartment = useMutation({
        mutationFn: (data: { name: string; description: string }) =>
            departmentApi.create(data).then(res => res.data.result),

        onMutate: async (newDept) => {
            await queryClient.cancelQueries({ queryKey: ['departments'] })
            const previous = queryClient.getQueryData<Department[]>(['departments'])

            queryClient.setQueryData<Department[]>(['departments'], old => [
                ...(old || []),
                {
                    ...newDept,
                    id: `optimistic-${Date.now()}`,
                    manager: 'Chưa chỉ định',
                    employeeCount: 0,
                    defaultShift: 'Chưa cấu hình',
                    status: 'active' as const,
                    location: '—',
                } as Department,
            ])

            return { previous }
        },

        onError: (_err, _newDept, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['departments'], context.previous)
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] })
        },
    })

    // Mutation xóa
    const deleteDepartment = useMutation({
        mutationFn: (id: string) => departmentApi.delete(id),

        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['departments'] })
            const previous = queryClient.getQueryData<Department[]>(['departments'])

            queryClient.setQueryData<Department[]>(['departments'], old =>
                (old || []).filter(d => d.id !== id)
            )

            return { previous }
        },

        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['departments'], context.previous)
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] })
        },
    })

    // Mutation cập nhật
    const updateDepartment = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) =>
            departmentApi.update(id, data).then((res) => res.data.result),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] })
        },
    })

    return {
        departmentsQuery,
        createDepartment,
        deleteDepartment,
        updateDepartment,
    }
}