import api from '@/lib/api';
import type { Employee, CreateEmployee, UpdateEmployee } from '@/types/employee';
import type { ApiResponse, Page } from '@/types/api';

const services = "/hr"

export const employeeApi = {
  getAll: () => api.get<ApiResponse<Page<Employee>>>(`${services}/employees`),
  getById: (id: number) => api.get<ApiResponse<Employee>>(`${services}/employees/${id}`),
  create: (data: CreateEmployee) => api.post<ApiResponse<Employee>>(`${services}/employees`, data),
  update: (id: number, data: UpdateEmployee) => api.put<ApiResponse<Employee>>(`${services}/employees/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<void>>(`${services}/employees/${id}`),
}
