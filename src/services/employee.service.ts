import api from '@/lib/api';
import type { Employee } from '@/types/employee';

export const employeeApi = {
    getAll: () => api.get<Employee[]>('/employees'),
    getById: (id: string) => api.get<Employee>(`/employees/${id}`),
    create: (data: { name: string; role: string; department: string }) => api.post<Employee>('/employees', data),
    update: (id: string, data: Partial<Employee>) => api.put<Employee>(`/employees/${id}`, data),
    delete: (id: string) => api.delete(`/employees/${id}`),
}