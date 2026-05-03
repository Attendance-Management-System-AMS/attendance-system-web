import api from '@/shared/api/client'

export interface MonthlyAttendanceExportParams {
  year: number
  month: number
  departmentId?: number | string | null
  employeeId?: number | string | null
  includeDetails?: boolean
}

export interface AnnualAttendanceSummaryItem {
  month: number
  label: string
  workDays: number
  lateDays: number
  earlyLeaveDays: number
  absentDays: number
  leaveDays: number
  holidayDays: number
  missingCheckoutDays: number
  incompleteDays: number
  workedMinutes: number
  overtimeMinutes: number
}

export interface EmployeeAttendanceSummary {
  employeeId: number
  employeeCode: string | null
  fullName: string | null
  departmentName: string | null
  positionName: string | null
  workDays: number
  lateDays: number
  earlyLeaveDays: number
  absentDays: number
  leaveDays: number
  holidayDays: number
  missingCheckoutDays: number
  incompleteDays: number
  workedMinutes: number
  overtimeMinutes: number
  months: AnnualAttendanceSummaryItem[]
}

export interface AnnualAttendanceSummary {
  year: number
  fromDate: string
  toDate: string
  departmentId?: number | null
  employeeId?: number | null
  totalEmployees: number
  workDays: number
  lateDays: number
  earlyLeaveDays: number
  absentDays: number
  leaveDays: number
  holidayDays: number
  missingCheckoutDays: number
  incompleteDays: number
  workedMinutes: number
  overtimeMinutes: number
  months: AnnualAttendanceSummaryItem[]
  employees: EmployeeAttendanceSummary[]
}

export interface OvertimeMonthlySummaryItem {
  month: number
  label: string
  requestCount: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  cancelledRequests: number
  requestedMinutes: number
  approvedMinutes: number
  actualMinutes: number
  payableMinutes: number
}

export interface EmployeeOvertimeSummary {
  employeeId: number
  employeeCode: string | null
  fullName: string | null
  departmentName: string | null
  positionName: string | null
  requestCount: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  cancelledRequests: number
  requestedMinutes: number
  approvedMinutes: number
  actualMinutes: number
  payableMinutes: number
}

export interface OvertimeSummary {
  year: number
  fromDate: string
  toDate: string
  departmentId?: number | null
  employeeId?: number | null
  totalEmployees: number
  requestCount: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  cancelledRequests: number
  requestedMinutes: number
  approvedMinutes: number
  actualMinutes: number
  payableMinutes: number
  months: OvertimeMonthlySummaryItem[]
  employees: EmployeeOvertimeSummary[]
}

export interface AnnualReportParams {
  year: number
  departmentId?: number | string | null
  employeeId?: number | string | null
}

export const reportApi = {
  exportMonthlyAttendance: (params: MonthlyAttendanceExportParams) =>
    api.get<Blob>('/reports/monthly-attendance/export', {
      params,
      responseType: 'blob',
    }),
  exportAnnualAttendance: (params: AnnualReportParams) =>
    api.get<Blob>('/reports/annual-attendance/export', {
      params,
      responseType: 'blob',
    }),
  exportOvertimeSummary: (params: AnnualReportParams) =>
    api.get<Blob>('/reports/overtime/export', {
      params,
      responseType: 'blob',
    }),
  getAnnualAttendanceSummary: (params: AnnualReportParams) =>
    api.get('/reports/attendance/annual-summary', { params }),
  getOvertimeSummary: (params: AnnualReportParams) =>
    api.get('/reports/overtime-summary', { params }),
}
