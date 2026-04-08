import { departmentApi } from '@/services/department.service';
import type { Department } from '@/types/department';
import type { Page } from '@/types/api';
import { queryKeys } from '@/lib/queryKeys'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue, computed } from 'vue'

export interface UseDepartmentsParams {
    page?: MaybeRefOrGetter<number>;
    size?: MaybeRefOrGetter<number>;
    sort?: MaybeRefOrGetter<string>;
    sortDir?: MaybeRefOrGetter<string>;
    keyword?: MaybeRefOrGetter<string>;
}

export function useDepartments(params?: UseDepartmentsParams) {
    const queryClient = useQueryClient()

    // Query danh sách
    const departmentsQuery = useQuery<Page<Department>>({
        queryKey: computed(() => [
            ...queryKeys.departments.all(),
            {
                keyword: toValue(params?.keyword),
                page: toValue(params?.page),
                size: toValue(params?.size),
                sort: toValue(params?.sort),
                sortDir: toValue(params?.sortDir),
            }
        ]),
        queryFn: async () => {
            const response = await departmentApi.getAll({
                keyword: toValue(params?.keyword),
                page: toValue(params?.page),
                size: toValue(params?.size),
                sort: toValue(params?.sort),
                sortDir: toValue(params?.sortDir),
            })
            return response.data?.result
        },
        staleTime: 1000 * 60 * 3, // 3 phút
        gcTime: 1000 * 60 * 10,   // giữ cache 10 phút
    })

    // Mutation tạo
    const createDepartment = useMutation({
        mutationFn: (data: { name: string; description: string }) =>
            departmentApi.create(data).then(res => res.data.result),

        onMutate: async (newDept) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.departments.all() })
            const previous = queryClient.getQueryData<Department[]>(queryKeys.departments.all())

            queryClient.setQueryData<Department[]>(queryKeys.departments.all(), old => [
                ...(old || []),
                {
                    ...newDept,
                    id: `optimistic-${Date.now()}`,
                    manager: 'Chưa chỉ định',
                    totalEmployees: 0,
                    status: 'ACTIVE' as const,
                } as Department,
            ])

            return { previous }
        },

        onError: (_err, _newDept, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.departments.all(), context.previous)
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.all() })
        },
    })

    // Mutation xóa
    const deleteDepartment = useMutation({
        mutationFn: (id: string) => departmentApi.delete(id),

        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.departments.all() })
            const previous = queryClient.getQueryData<Department[]>(queryKeys.departments.all())

            queryClient.setQueryData<Department[]>(queryKeys.departments.all(), old =>
                (old || []).filter(d => String(d.id) !== String(id))
            )

            return { previous }
        },

        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.departments.all(), context.previous)
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.all() })
        },
    })

    // Mutation cập nhật
    const updateDepartment = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) =>
            departmentApi.update(id, data).then((res) => res.data.result),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.all() })
        },
    })

    return {
        departmentsQuery,
        createDepartment,
        deleteDepartment,
        updateDepartment,
    }
}
