import api from '@/lib/api'
import type { ApiResponse, Page } from '@/types/api'
import type { CreateLeaveRequest, LeaveRequest, LeaveType } from '@/types/leave'

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
    api.get<ApiResponse<Page<LeaveRequest>>>(`/leaves/employee/${employeeId}`),
  create: (data: CreateLeaveRequest) =>
    api.post<ApiResponse<LeaveRequest>>('/leaves', buildCreateLeaveBody(data)),
  update: (id: string | number, data: Partial<CreateLeaveRequest>) =>
    api.put<ApiResponse<LeaveRequest>>(`/leaves/${id}`, data),
  approve: (id: string | number) => api.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/approve`),
  reject: (id: string | number) => api.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/reject`),
  delete: (id: string | number) => api.delete<ApiResponse<void>>(`/leaves/${id}`),
}
