import api from '@/lib/api'
import type { ApiResponse, Page } from '@/types/api'
import type { CreateLeaveRequest, LeaveRequest } from '@/types/leave'

export const leaveApi = {
  getAll: () => api.get<ApiResponse<Page<LeaveRequest>>>('/leaves'),
  getById: (id: string | number) => api.get<ApiResponse<LeaveRequest>>(`/leaves/${id}`),
  create: (data: CreateLeaveRequest) => api.post<ApiResponse<LeaveRequest>>('/leaves', data),
  update: (id: string | number, data: Partial<CreateLeaveRequest>) =>
    api.put<ApiResponse<LeaveRequest>>(`/leaves/${id}`, data),
  approve: (id: string | number) => api.post<ApiResponse<LeaveRequest>>(`/leaves/${id}/approve`),
  reject: (id: string | number) => api.post<ApiResponse<LeaveRequest>>(`/leaves/${id}/reject`),
  delete: (id: string | number) => api.delete<ApiResponse<void>>(`/leaves/${id}`),
}
