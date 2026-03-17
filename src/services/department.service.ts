import api from '@/lib/api';
import type { Department } from '@/types/department';

export const departmentApi = {
    getAll: () => api.get<Department[]>('/departments'),
    getById: (id: string) => api.get<Department>(`/departments/${id}`),
    create: (data: { name: string; description: string }) => api.post<Department>('/departments', data),
    update: (id: string, data: Partial<Department>) => api.put<Department>(`/departments/${id}`, data),
    delete: (id: string) => api.delete(`/departments/${id}`),
}