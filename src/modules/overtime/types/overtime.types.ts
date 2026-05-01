export type OvertimeStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface OvertimeRequest {
  id: number
  employeeId: number
  employeeFullName?: string | null
  employeeCode?: string | null
  departmentName?: string | null
  positionName?: string | null
  workDate: string
  startTime: string
  endTime: string
  requestedMinutes: number
  reason?: string | null
  status: OvertimeStatus | string
  approvedById?: number | null
  approvedByName?: string | null
  approvedAt?: string | null
  approvalNote?: string | null
  hasAttendance?: boolean | null
  attendanceStatus?: string | null
  actualOvertimeMinutes?: number | null
  approvedOvertimeMinutes?: number | null
  payableOvertimeMinutes?: number | null
  attendanceOvertimeStatus?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CreateOvertimeRequest {
  employeeId?: number | string | null
  workDate: string
  startTime: string
  endTime: string
  reason?: string | null
}

export interface OvertimeQueryParams {
  page?: number
  size?: number
  sort?: string
  sortDir?: string
  keyword?: string
  employeeId?: number | string
  status?: string
  fromDate?: string
  toDate?: string
}
