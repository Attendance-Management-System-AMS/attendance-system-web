import type { LeaveType } from "./leave-type"

export type { LeaveType } from './leave-type'

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | string
export interface LeaveRequest {
  id: string | number
  employeeId?: string | number
  employeeName: string
  employeeCode?: string
  departmentName?: string
  reason: string
  leaveType?: LeaveType | string
  /** Backend mới */
  fromDate?: string
  toDate?: string
  /** Tương thích cũ */
  startDate?: string
  endDate?: string
  days?: number
  status: LeaveStatus
}

/** Khớp body POST /leaves từ backend */
export interface CreateLeaveRequest {
  employeeId: string | number
  leaveTypeCode: string
  fromDate: string
  toDate: string
  reason: string
}
