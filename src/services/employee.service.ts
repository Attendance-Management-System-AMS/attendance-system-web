import api from '@/lib/api';
import type { Employee, CreateEmployee, UpdateEmployee } from '@/types/employee';
import type { ApiResponse, Page } from '@/types/api';

export const employeeApi = {
  getAll: () => api.get<ApiResponse<Page<Employee>>>('/employees'),
  getById: (id: number) => api.get<ApiResponse<Employee>>(`/employees/${id}`),
  create: (data: CreateEmployee) => api.post<ApiResponse<Employee>>('/employees', data),
  update: (id: number, data: UpdateEmployee) => api.put<ApiResponse<Employee>>(`/employees/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/employees/${id}`),
}
