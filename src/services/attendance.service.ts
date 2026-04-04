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

/** Snapshot nhân viên kèm response check-in (backend điền khi check-in bằng mặt). */
export interface AttendanceEmployeeBrief {
  fullName: string
  employeeCode: string
  departmentName: string | null
  positionName: string | null
}

export interface AttendanceCheckInResult {
  id?: number
  employeeId?: number
  checkInTime?: string
  checkOutTime?: string
  workDate?: string
  status?: string
  createdAt?: string
  /** Có khi backend trả kèm (check-in bằng mặt) — tránh gọi thêm GET /employees. */
  employee?: AttendanceEmployeeBrief | null
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
  checkIn: (employeeId: number) =>
    api.post<ApiResponse<AttendanceCheckInResult>>(`/attendance/check-in/${employeeId}`),
  checkOut: (employeeId: number) =>
    api.post<ApiResponse<AttendanceCheckInResult>>(`/attendance/check-out/${employeeId}`),
}
