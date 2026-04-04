import api from '@/lib/api'
import type { ApiResponse, Page } from '@/types/api'
import type { Schedule, CreateSchedule } from '@/types/schedule'

export const scheduleApi = {
  getAll: () => api.get<ApiResponse<Page<Schedule> | Schedule[]>>('/attendance/schedules'),
  getByEmployee: (employeeId: string | number) =>
    api.get<ApiResponse<Page<Schedule> | Schedule[]>>(`/attendance/schedules/employee/${employeeId}`),
  search: (params: Record<string, any>) =>
    api.get<ApiResponse<Page<Schedule> | Schedule[]>>('/attendance/schedules/search', { params }),
  create: (data: CreateSchedule) => api.post<ApiResponse<Schedule>>('/attendance/schedules', data),
  delete: (id: string | number) => api.delete<ApiResponse<void>>(`/attendance/schedules/${id}`),
}
