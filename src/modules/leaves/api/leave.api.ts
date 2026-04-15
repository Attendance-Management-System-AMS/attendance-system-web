import api from '@/shared/api/client'
import type { ApiResponse, Page } from '@/shared/types/api'
import type { CreateLeaveRequest, CreateMyLeaveRequest, LeaveRequest, LeaveType } from '@/modules/leaves/types/leave.types'

function buildCreateLeaveBody(data: CreateLeaveRequest): Record<string, unknown> {
  return {
    employeeId: data.employeeId,
    leaveTypeCode: data.leaveTypeCode.trim(),
    fromDate: data.fromDate,
    toDate: data.toDate,
    reason: data.reason,
  }
}

export const leaveApi = {
  getAll: () => api.get<ApiResponse<Page<LeaveRequest>>>('/leaves'),
  getTypes: () => api.get<ApiResponse<LeaveType[]>>('/leaves/types'),
  getById: (id: string | number) => api.get<ApiResponse<LeaveRequest>>(`/leaves/${id}`),
  getByEmployee: (employeeId: string | number) =>
    api.get<ApiResponse<Page<LeaveRequest>>>('/leaves', { params: { employeeId } }),
  create: (data: CreateLeaveRequest) =>
    api.post<ApiResponse<LeaveRequest>>('/leaves', buildCreateLeaveBody(data)),
  approve: (id: string | number) => api.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/approve`),
  reject: (id: string | number) => api.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/reject`),
  delete: (id: string | number) => api.delete<ApiResponse<void>>(`/leaves/${id}`),

  // Các API dành cho cá nhân (/me)
  getMyLeaves: (params?: { status?: string }) =>
    api.get<ApiResponse<Page<LeaveRequest>>>('/leaves/me', { params }),
  createMe: (data: CreateMyLeaveRequest) => api.post<ApiResponse<LeaveRequest>>('/leaves/me', data),
}
