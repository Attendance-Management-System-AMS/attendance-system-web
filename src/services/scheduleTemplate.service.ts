import api from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { ScheduleTemplate, CreateScheduleTemplate } from '@/types/schedule'

export const scheduleTemplateApi = {
  getAll: () => api.get<ApiResponse<ScheduleTemplate[]>>('/attendance/schedule-templates'),
  getById: (id: number | string) => api.get<ApiResponse<ScheduleTemplate>>(`/attendance/schedule-templates/${id}`),
  create: (data: CreateScheduleTemplate) => api.post<ApiResponse<ScheduleTemplate>>('/attendance/schedule-templates', data),
  update: (id: number | string, data: CreateScheduleTemplate) => api.put<ApiResponse<ScheduleTemplate>>(`/attendance/schedule-templates/${id}`, data),
  delete: (id: number | string) => api.delete<ApiResponse<void>>(`/attendance/schedule-templates/${id}`),
}
