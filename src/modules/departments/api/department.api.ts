import api from '@/shared/api/client';
import type { Department } from '@/modules/departments/types/department.types';
import type { ApiResponse, Page } from '@/shared/types/api';

export interface DeptQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  sortDir?: string;
  keyword?: string;
}

export const departmentApi = {
  getAll: (params?: DeptQueryParams) => api.get<ApiResponse<Page<Department>>>('/departments', { params }),
  getById: (id: string | number) => api.get<ApiResponse<Department>>(`/departments/${id}`),
  create: (data: { name: string; description: string }) => api.post<ApiResponse<Department>>('/departments', data),
  update: (id: string | number, data: Partial<Department>) => api.put<ApiResponse<Department>>(`/departments/${id}`, data),
  delete: (id: string | number) => api.delete<ApiResponse<void>>(`/departments/${id}`),
}
