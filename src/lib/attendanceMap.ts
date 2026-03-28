import type { Attendance, AttendanceStatus } from '@/types/attendance'
import type { Employee } from '@/types/employee'
import type { AttendanceTodayApiRecord } from '@/services/attendance.service'

/** Giá trị status từ attendance-service (enum chuỗi). */
const API_STATUS_TO_UI: Record<string, AttendanceStatus> = {
  PRESENT: 'Có mặt',
  LATE: 'Đi muộn',
  LATE_ARRIVAL: 'Đi muộn',
  ABSENT: 'Nghỉ phép',
  LEAVE: 'Nghỉ phép',
  ON_LEAVE: 'Nghỉ phép',
  SICK_LEAVE: 'Nghỉ phép',
}

export function mapAttendanceStatusFromApi(raw: string | undefined | null): AttendanceStatus {
  const key = String(raw ?? '').trim().toUpperCase()
  return API_STATUS_TO_UI[key] ?? 'Có mặt'
}

export function formatAttendanceClock(iso: string | null | undefined): string {
  if (iso == null || iso === '') return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

/** Ghép bản ghi /attendance/today với Employee đã tải (theo employeeId). */
export function mergeTodayAttendance(
  rows: AttendanceTodayApiRecord[],
  byEmployeeId: Map<number, Employee>,
): Attendance[] {
  return rows.map((row) => ({
    id: String(row.id),
    employee: byEmployeeId.get(row.employeeId),
    checkIn: formatAttendanceClock(row.checkInTime),
    checkOut: formatAttendanceClock(row.checkOutTime),
    status: mapAttendanceStatusFromApi(row.status),
  }))
}
