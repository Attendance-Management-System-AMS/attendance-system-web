import api from '@/lib/api'
import type { Attendance } from '@/types/attendance'
import type { ApiResponse, Page } from '@/types/api'

export interface AttendanceTodayApiRecord {
  id: number
  employeeId: number
  checkInTime: string
  checkOutTime: string | null
  workDate: string
  status: string
  createdAt: string
}

export interface AttendanceCheckInResult {
  id?: number
  employeeId?: number
  checkInTime?: string
  checkOutTime?: string
  workDate?: string
  status?: string
  createdAt?: string
}

export const attendanceApi = {
  getAll: () => api.get<ApiResponse<Page<Attendance>>>('/attendance'),
  getToday: (date?: string) =>
    api.get<ApiResponse<AttendanceTodayApiRecord[]>>('/attendance/today', {
      params: date ? { date } : undefined,
    }),
  checkInByFace: (descriptor: number[]) =>
    api
      .post<ApiResponse<AttendanceCheckInResult>>('/attendance/check-in-by-face', { descriptor })
      .then((res) => res.data),
}
