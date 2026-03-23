export type LeaveStatus = 'pending' | 'approved' | 'rejected' | string

export interface LeaveRequest {
  id: string | number
  employeeId?: string | number
  employeeName: string
  employeeCode?: string
  departmentName?: string
  reason: string
  leaveType?: string
  startDate: string
  endDate: string
  days?: number
  status: LeaveStatus
}

export interface CreateLeaveRequest {
  employeeId: string | number
  reason: string
  leaveType?: string
  startDate: string
  endDate: string
}
