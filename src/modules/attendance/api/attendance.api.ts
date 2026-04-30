import api from '@/shared/api/client'
import type { Attendance } from '@/modules/attendance/types/attendance.types'
import type { ApiResponse, Page } from '@/shared/types/api'
import type { EmployeeScheduleResponse } from '@/modules/schedules/types/schedule.types'

export interface AttendanceTodayApiRecord {
  id: number
  employeeId: number
  checkInTime: string
  checkOutTime: string | null
  workDate: string
  status: string
  lateMinutes?: number | null
  earlyLeaveMinutes?: number | null
  workedMinutes?: number | null
  expectedMinutes?: number | null
  createdAt: string
  employeeFullName?: string | null
  employeeSnapshotCode?: string | null
  employeeSnapshotDepartmentName?: string | null
  employeeSnapshotPositionName?: string | null
}

export interface AttendanceTodayFilters {
  date?: string
  search?: string
  department?: string
  status?: string
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
  lateMinutes?: number | null
  earlyLeaveMinutes?: number | null
  workedMinutes?: number | null
  expectedMinutes?: number | null
  createdAt?: string
  /** Có khi backend trả kèm (check-in bằng mặt) — tránh gọi thêm GET /employees. */
  employee?: AttendanceEmployeeBrief | null
  employeeFullName?: string | null
  employeeSnapshotCode?: string | null
  employeeSnapshotDepartmentName?: string | null
  employeeSnapshotPositionName?: string | null
}

export interface KioskSessionResult {
  token: string
  tokenType: string
  deviceId: string
  expiresIn: number
  expiresAt: string
}

export interface KioskScanAuth {
  deviceId: string
  sessionToken: string
  nonce: string
  timestamp: number
}

export interface MyAttendanceFilters {
  fromDate?: string
  toDate?: string
  status?: 'PRESENT' | 'LATE' | 'EARLY_LEAVE' | 'ABSENT'
  page?: number
  size?: number
}

function formatLocalDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const attendanceApi = {
  getToday: (filters?: AttendanceTodayFilters) =>
    api.get<ApiResponse<Page<AttendanceTodayApiRecord>>>('/attendance', {
      params: {
        ...filters,
        date: filters?.date ?? formatLocalDate(),
      },
    }),
  // Các API dành cho cá nhân (/me)
  getMyHistory: (params?: MyAttendanceFilters) =>
    api.get<ApiResponse<Page<Attendance>>>('/attendance/me', { params }),
  getTodayMe: () => api.get<ApiResponse<Attendance | null>>('/attendance/today/me'),
  getMySchedules: () => api.get<ApiResponse<EmployeeScheduleResponse[]>>('/attendance/schedules/me'),
  createKioskSession: (deviceId: string) =>
    api.post<ApiResponse<KioskSessionResult>>(
      '/attendance/kiosk/session',
      {},
      {
        headers: {
          'X-Kiosk-Device-Id': deviceId,
        },
      },
    ).then((res) => res.data),

  scanByFace: (descriptor: number[], kioskAuth: KioskScanAuth) =>
    api
      .post<ApiResponse<AttendanceCheckInResult>>(
        '/attendance/scan-by-face',
        { descriptor },
        {
          headers: {
            'X-Kiosk-Session': kioskAuth.sessionToken,
            'X-Kiosk-Device-Id': kioskAuth.deviceId,
            'X-Kiosk-Nonce': kioskAuth.nonce,
            'X-Kiosk-Timestamp': String(kioskAuth.timestamp),
          },
        },
      )
      .then((res) => res.data),
  checkIn: (employeeId: number) =>
    api.post<ApiResponse<AttendanceCheckInResult>>(`/attendance/check-in/${employeeId}`),
  checkOut: (employeeId: number) =>
    api.post<ApiResponse<AttendanceCheckInResult>>(`/attendance/check-out/${employeeId}`),
  search: (params: Record<string, unknown>) =>
    api.get<ApiResponse<Page<Attendance>>>('/attendance', { params }),
  delete: (id: string | number) => api.delete<ApiResponse<void>>(`/attendance/${id}`),
}
