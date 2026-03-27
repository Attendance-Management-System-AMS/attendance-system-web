import api from '@/lib/api';
import type { Attendance } from '@/types/attendance';
import type { ApiResponse, Page } from '@/types/api';

export interface AttendanceResponse {
  employeeName?: string;
  message: string;
}

export const attendanceApi = {
  getAll: () => api.get<ApiResponse<Page<Attendance>>>('/attendance'),
  getToday: (date?: string) =>
    api.get<ApiResponse<Attendance[]>>('/attendance/today', {
      params: date ? { date } : undefined,
    }),
  checkIn: (descriptor: number[]) =>
    api.post<ApiResponse<AttendanceResponse>>('/attendance/check-in', { descriptor }).then(res => res.data),
};
