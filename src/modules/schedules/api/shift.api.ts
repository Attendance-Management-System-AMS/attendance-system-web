import api from '@/shared/api/client'
import type { ApiResponse, Page } from '@/shared/types/api'
import type { CreateShift, Shift } from '@/modules/schedules/types/shift.types'

export const shiftApi = {
  getAll: () => api.get<ApiResponse<Page<Shift> | Shift[]>>('/attendance/shifts'),
  getById: (id: string | number) => api.get<ApiResponse<Shift>>(`/attendance/shifts/${id}`),
  create: (data: CreateShift) => api.post<ApiResponse<Shift>>('/attendance/shifts', data),
  update: (id: string | number, data: Partial<CreateShift>) => api.put<ApiResponse<Shift>>(`/attendance/shifts/${id}`, data),
  delete: (id: string | number) => api.delete<ApiResponse<void>>(`/attendance/shifts/${id}`),
}
