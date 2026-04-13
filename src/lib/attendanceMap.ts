import type { Attendance, AttendanceStatus } from '@/types/attendance'
import type { Employee } from '@/types/employee'
import type { AttendanceTodayApiRecord } from '@/services/attendance.service'

/** Giá trị status từ attendance-service (enum chuỗi). */
const API_STATUS_TO_UI: Record<string, AttendanceStatus> = {
  UNRECORDED: 'Chưa chấm công',
  NOT_CHECKED_IN: 'Chưa chấm công',
  PRESENT: 'Có mặt',
  LATE: 'Đi muộn',
  LATE_ARRIVAL: 'Đi muộn',
  ABSENT: 'Vắng mặt',
  LEAVE: 'Nghỉ phép',
  ON_LEAVE: 'Nghỉ phép',
  SICK_LEAVE: 'Nghỉ phép',
  HOLIDAY: 'Ngày lễ',
  EARLY_LEAVE: 'Về sớm',
  LATE_AND_EARLY_LEAVE: 'Muộn + về sớm',
  MISSING_CHECKOUT: 'Thiếu checkout',
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
    employeeId: row.employeeId,
    employee: byEmployeeId.get(row.employeeId) ?? {
      id: row.employeeId,
      employeeCode: row.employeeSnapshotCode ?? '',
      fullName: row.employeeFullName ?? '',
      gender: '',
      email: '',
      departmentId: null,
      departmentName: row.employeeSnapshotDepartmentName ?? null,
      positionId: null,
      positionName: row.employeeSnapshotPositionName ?? null,
      managerId: null,
      managerName: null,
      status: '',
      biometricHash: null,
      joinDate: '',
      createdAt: '',
    },
    checkIn: formatAttendanceClock(row.checkInTime),
    checkOut: formatAttendanceClock(row.checkOutTime),
    checkInTime: row.checkInTime,
    checkOutTime: row.checkOutTime,
    workDate: row.workDate,
    status: mapAttendanceStatusFromApi(row.status),
    lateMinutes: row.lateMinutes ?? undefined,
    earlyLeaveMinutes: row.earlyLeaveMinutes ?? undefined,
    workedMinutes: row.workedMinutes ?? undefined,
    expectedMinutes: row.expectedMinutes ?? undefined,
    isRecorded: true,
  }))
}

export function createUnrecordedTodayAttendance(employee: Employee, workDate: string): Attendance {
  return {
    id: `pending-${employee.id}-${workDate}`,
    employeeId: employee.id,
    employee,
    checkIn: '—',
    checkOut: '—',
    checkInTime: undefined,
    checkOutTime: undefined,
    workDate,
    status: 'Chưa chấm công',
    isRecorded: false,
  }
}
