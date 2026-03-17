import { employeeApi } from '@/services/employee.service';
import type { Employee } from '@/types/employee';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export function useEmployees() {
    const queryClient = useQueryClient()

    // Query danh sách
    const employeesQuery = useQuery<Employee[]>({
        queryKey: ['employees'],
        queryFn: async () => (await employeeApi.getAll()).data,
        staleTime: 1000 * 60 * 3, // 3 phút
        gcTime: 1000 * 60 * 10,   // giữ cache 10 phút
    })

    // Mutation tạo
    const createEmployee = useMutation({
        mutationFn: (data: { name: string; role: string; department: string }) =>
            employeeApi.create(data).then(res => res.data),

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] })
        },
    })

    // Mutation cập nhật
    const updateEmployee = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Employee> }) =>
            employeeApi.update(id, data).then(res => res.data),

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] })
        },
    })

    // Mutation xóa
    const deleteEmployee = useMutation({
        mutationFn: (id: string) => employeeApi.delete(id),

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] })
        },
    })

    return {
        employeesQuery,
        createEmployee,
        updateEmployee,
        deleteEmployee,
    }
}
