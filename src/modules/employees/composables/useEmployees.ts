import { employeeApi } from '@/modules/employees/api/employee.api';
import type { Employee, CreateEmployee, UpdateEmployee, FaceDescriptorRequest } from '@/modules/employees/types/employee.types';
import type { Page } from '@/shared/types/api';
import { queryKeys } from '@/shared/lib/queryKeys'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue, computed } from 'vue'

export interface UseEmployeesParams {
  page?: MaybeRefOrGetter<number>;
  size?: MaybeRefOrGetter<number>;
  sort?: MaybeRefOrGetter<string>;
  sortDir?: MaybeRefOrGetter<string>;
  keyword?: MaybeRefOrGetter<string>;
  departmentId?: MaybeRefOrGetter<number | string | undefined>;
  positionId?: MaybeRefOrGetter<number | string | undefined>;
  status?: MaybeRefOrGetter<string | undefined>;
}

export function useEmployees(params?: UseEmployeesParams) {
  const queryClient = useQueryClient()

  // Query danh sách
  const employeesQuery = useQuery<Page<Employee>>({
    queryKey: computed(() => [
      ...queryKeys.employees.all(),
      {
        keyword: toValue(params?.keyword),
        page: toValue(params?.page),
        size: toValue(params?.size),
        sort: toValue(params?.sort),
        sortDir: toValue(params?.sortDir),
        departmentId: toValue(params?.departmentId),
        positionId: toValue(params?.positionId),
        status: toValue(params?.status),
      }
    ]),
    queryFn: async () => {
      try {
        const response = await employeeApi.getAll({
          keyword: toValue(params?.keyword),
          page: toValue(params?.page),
          size: toValue(params?.size),
          sort: toValue(params?.sort),
          sortDir: toValue(params?.sortDir),
          departmentId: toValue(params?.departmentId),
          positionId: toValue(params?.positionId),
          status: toValue(params?.status),
        })
        return response.data?.result
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
