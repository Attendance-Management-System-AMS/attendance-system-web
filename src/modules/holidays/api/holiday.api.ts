import api from '@/shared/api/client'
import type { ApiResponse, Page } from '@/shared/types/api'
import type { CreateHoliday, Holiday } from '@/modules/holidays/types/holiday.types'

export const holidayApi = {
  getAll: () => api.get<ApiResponse<Page<Holiday> | Holiday[]>>('/attendance/holidays'),
  getById: (id: string | number) => api.get<ApiResponse<Holiday>>(`/attendance/holidays/${id}`),
  create: (data: CreateHoliday) => api.post<ApiResponse<Holiday>>('/attendance/holidays', data),
  update: (id: string | number, data: Partial<CreateHoliday>) => api.put<ApiResponse<Holiday>>(`/attendance/holidays/${id}`, data),
  delete: (id: string | number) => api.delete<ApiResponse<void>>(`/attendance/holidays/${id}`),
}
