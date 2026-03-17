import api from '@/lib/api';
import type { Attendance } from '@/types/attendance';

export interface AttendanceResponse {
  employeeName?: string;
  message: string;
}

export const attendanceApi = {
  getAll: () => api.get<Attendance[]>('/attendance'),
  checkIn: (descriptor: number[]) =>
    api.post<AttendanceResponse>('/attendance/check-in', { descriptor }).then(res => res.data),
};
