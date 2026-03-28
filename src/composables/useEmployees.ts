import { employeeApi } from '@/services/employee.service';
import type { Employee, CreateEmployee, UpdateEmployee, FaceDescriptorRequest } from '@/types/employee';
import { queryKeys } from '@/lib/queryKeys'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export function useEmployees() {
  const queryClient = useQueryClient()

  // Query danh sách
  const employeesQuery = useQuery<Employee[]>({
    queryKey: queryKeys.employees.all(),
    queryFn: async () => {
      try {
        const response = await employeeApi.getAll()
        const result = response.data?.result as Employee[] | { content?: Employee[] } | undefined

        if (Array.isArray(result)) return result
        if (result && Array.isArray(result.content)) return result.content
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
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all() })
    },
  })

  // Mutation cập nhật
  const updateEmployee = useMutation({
    mutationFn: ({ id, data }: { id: number, data: UpdateEmployee }) =>
      employeeApi.update(id, data).then(res => res.data.result),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all() })
    },
  })

  // Mutation xóa
  const deleteEmployee = useMutation({
    mutationFn: (id: number) => employeeApi.delete(id),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all() })
    },
  })

  const registerFaceDescriptor = useMutation({
    mutationFn: ({ id, body }: { id: number; body: FaceDescriptorRequest }) =>
      employeeApi.registerFaceDescriptor(id, body).then((res) => res.data.result),
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all() })
      if (vars?.id != null) {
        queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(vars.id) })
      }
    },
  })

  return {
    employeesQuery,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    registerFaceDescriptor,
  }
}
