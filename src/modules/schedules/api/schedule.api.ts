import api from '@/shared/api/client'
import type { ApiResponse, Page } from '@/shared/types/api'
import type { Schedule, CreateSchedule, ApplyTemplateRequest, BulkAssignRequest } from '@/modules/schedules/types/schedule.types'

export const scheduleApi = {
  getByEmployee: (employeeId: string | number) =>
    api.get<ApiResponse<Schedule[]>>(`/attendance/schedules/employee/${employeeId}`),
  search: (params: Record<string, unknown>) =>
    api.get<ApiResponse<Page<Schedule>>>('/attendance/schedules', { params }),
  create: (data: CreateSchedule) => api.post<ApiResponse<Schedule>>('/attendance/schedules', data),
  bulkAssign: (data: BulkAssignRequest) => api.post<ApiResponse<void>>('/attendance/schedules/bulk', data),
  applyTemplate: (data: ApplyTemplateRequest) => api.post<ApiResponse<void>>('/attendance/schedules/apply-template', data),
  delete: (id: string | number) => api.delete<ApiResponse<void>>(`/attendance/schedules/${id}`),
}
