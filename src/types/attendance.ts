import type { Employee } from './employee'
export type AttendanceStatus = 'Có mặt' | 'Đi muộn' | 'Nghỉ phép' | 'Vắng mặt'

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
}
