export interface Employee {
  id: string
  name: string
  role: string
  department: string
  avatarUrl?: string
}

export type AttendanceStatus = 'Có mặt' | 'Đi muộn' | 'Nghỉ phép'

export interface Attendance {
  id: string
  employee: Employee
  checkIn: string
  checkOut: string
  status: AttendanceStatus
}
