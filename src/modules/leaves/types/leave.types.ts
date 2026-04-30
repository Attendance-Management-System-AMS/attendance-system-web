import type { LeaveType } from './leave-type.types'

export type { LeaveType } from './leave-type.types'

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | string
export interface LeaveRequest {
  id: string | number
  employeeId?: string | number
  employeeName: string
  employeeCode?: string
  departmentName?: string
  positionName?: string
  reason: string
  leaveType?: LeaveType | string
  leaveTypeName?: string
  leaveTypeCode?: string
  totalDays?: number
  /** Backend mới */
  fromDate?: string
  toDate?: string
  /** Tương thích cũ */
  startDate?: string
  endDate?: string
  days?: number
  status: LeaveStatus
  approvedByName?: string
  createdAt?: string
  correctedCheckIn?: string | null
  correctedCheckOut?: string | null
}

export interface CreateLeaveRequest {
  employeeId: string | number
  leaveTypeCode: string
  fromDate: string
  toDate: string
  reason: string
  correctedCheckIn?: string | null
  correctedCheckOut?: string | null
}

export type CreateMyLeaveRequest = Omit<CreateLeaveRequest, 'employeeId'>
