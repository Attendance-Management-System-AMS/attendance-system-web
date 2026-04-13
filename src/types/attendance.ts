import type { Employee } from './employee'
export type AttendanceStatus =
  | 'Chưa chấm công'
  | 'Có mặt'
  | 'Đi muộn'
  | 'Về sớm'
  | 'Muộn + về sớm'
  | 'Nghỉ phép'
  | 'Ngày lễ'
  | 'Vắng mặt'
  | 'Thiếu checkout'

export interface Attendance {
  id: string | number
  employeeId?: number
  employee?: Employee
  checkIn?: string
  checkInTime?: string
  check_in_time?: string
  checkOut?: string | null
  checkOutTime?: string | null
  check_out_time?: string | null
  workDate: string
  shiftName?: string
  status: string
  lateMinutes?: number
  earlyLeaveMinutes?: number
  workedMinutes?: number
  expectedMinutes?: number
  isRecorded?: boolean
}
