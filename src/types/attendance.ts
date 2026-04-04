import type { Employee } from './employee'
export type AttendanceStatus = 'Có mặt' | 'Đi muộn' | 'Nghỉ phép' | 'Vắng mặt'

export interface Attendance {
  id: string
  employee?: Employee
  checkIn: string
  checkOut: string
  status: AttendanceStatus
}
