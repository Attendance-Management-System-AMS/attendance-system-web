import api from '@/shared/api/client'

export interface MonthlyAttendanceExportParams {
  year: number
  month: number
  departmentId?: number | string | null
  employeeId?: number | string | null
  includeDetails?: boolean
}

export const reportApi = {
  exportMonthlyAttendance: (params: MonthlyAttendanceExportParams) =>
    api.get<Blob>('/reports/monthly-attendance/export', {
      params,
      responseType: 'blob',
    }),
}
