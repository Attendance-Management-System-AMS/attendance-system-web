import { employeeApi } from '@/services/employee.service';
import type { Employee, CreateEmployee, UpdateEmployee } from '@/types/employee';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export function useEmployees() {
  const queryClient = useQueryClient()

  // Query danh sách
  const employeesQuery = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      try {
        const response = await employeeApi.getAll()
        // console.log('Employees API Response:', response.data)

        // Bóc tách mảng
        if (response.data && response.data.success && response.data.result) {
          return response.data.result.content || []
        }
        return []
      } catch (err) {
        console.error('Failed to fetch employees:', err)
        throw err
      }
    },
    staleTime: 1000 * 60 * 3, // 3 phút
    gcTime: 1000 * 60 * 10,   // giữ cache 10 phút
  })

  // Mutation tạo
  const createEmployee = useMutation({
    mutationFn: (data: CreateEmployee) =>
      employeeApi.create(data).then(res => res.data.result),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })

  // Mutation cập nhật
  const updateEmployee = useMutation({
    mutationFn: ({ id, data }: { id: number, data: UpdateEmployee }) =>
      employeeApi.update(id, data).then(res => res.data.result),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })

  // Mutation xóa
  const deleteEmployee = useMutation({
    mutationFn: (id: number) => employeeApi.delete(id),

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
