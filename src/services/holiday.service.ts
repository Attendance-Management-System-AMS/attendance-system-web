import api from '@/lib/api'
import type { ApiResponse, Page } from '@/types/api'
import type { CreateHoliday, Holiday } from '@/types/holiday'

export const holidayApi = {
  getAll: () => api.get<ApiResponse<Page<Holiday> | Holiday[]>>('/attendance/holidays'),
  getById: (id: string | number) => api.get<ApiResponse<Holiday>>(`/attendance/holidays/${id}`),
  create: (data: CreateHoliday) => api.post<ApiResponse<Holiday>>('/attendance/holidays', data),
  update: (id: string | number, data: Partial<CreateHoliday>) => api.put<ApiResponse<Holiday>>(`/attendance/holidays/${id}`, data),
  search: (params: Record<string, unknown>) =>
    api.get<ApiResponse<Page<Holiday>>>('/attendance/holidays/search', { params }),
  delete: (id: string | number) => api.delete<ApiResponse<void>>(`/attendance/holidays/${id}`),
}

