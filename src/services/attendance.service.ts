import api from '@/lib/api';
import type { Attendance } from '@/types/attendance';
import type { ApiResponse, Page } from '@/types/api';

export interface AttendanceResponse {
  employeeName?: string;
  message: string;
}

export const attendanceApi = {
  getAll: () => api.get<ApiResponse<Page<Attendance>>>('/attendance'),
  checkIn: (descriptor: number[]) =>
    api.post<ApiResponse<AttendanceResponse>>('/attendance/check-in', { descriptor }).then(res => res.data),
};
