import api from '@/lib/api'
import type { ApiResponse, Page } from '@/types/api'
import type { CreateShift, Shift } from '@/types/shift'

export const shiftApi = {
  getAll: () => api.get<ApiResponse<Page<Shift> | Shift[]>>('/attendance/shifts'),
  getById: (id: string | number) => api.get<ApiResponse<Shift>>(`/attendance/shifts/${id}`),
  create: (data: CreateShift) => api.post<ApiResponse<Shift>>('/attendance/shifts', data),
  update: (id: string | number, data: Partial<CreateShift>) => api.put<ApiResponse<Shift>>(`/attendance/shifts/${id}`, data),
  delete: (id: string | number) => api.delete<ApiResponse<void>>(`/attendance/shifts/${id}`),
}

