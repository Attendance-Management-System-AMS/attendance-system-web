import api from '@/lib/api';
import type { Department } from '@/types/department';
import type { ApiResponse, Page } from '@/types/api';

const services = "/hr"

export const departmentApi = {
  getAll: () => api.get<ApiResponse<Page<Department>>>(`${services}/departments`),
  getById: (id: string | number) => api.get<ApiResponse<Department>>(`${services}/departments/${id}`),
  create: (data: { name: string; description: string }) => api.post<ApiResponse<Department>>(`${services}/departments`, data),
  update: (id: string | number, data: Partial<Department>) => api.put<ApiResponse<Department>>(`${services}/departments/${id}`, data),
  delete: (id: string | number) => api.delete<ApiResponse<void>>(`${services}/departments/${id}`),
}
