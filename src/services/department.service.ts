import api from '@/lib/api';
import type { Department } from '@/types/department';
import type { ApiResponse, Page } from '@/types/api';

export const departmentApi = {
  getAll: () => api.get<ApiResponse<Page<Department>>>('/departments'),
  getById: (id: string | number) => api.get<ApiResponse<Department>>(`/departments/${id}`),
  create: (data: { name: string; description: string }) => api.post<ApiResponse<Department>>('/departments', data),
  update: (id: string | number, data: Partial<Department>) => api.put<ApiResponse<Department>>(`/departments/${id}`, data),
  delete: (id: string | number) => api.delete<ApiResponse<void>>(`/departments/${id}`),
}
