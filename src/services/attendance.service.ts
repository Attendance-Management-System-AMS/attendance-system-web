import api from '@/lib/api';
import type { Attendance } from '@/types/attendance';
import type { ApiResponse, Page } from '@/types/api';

/** Payload trả về từ attendance-service (check-in / check-in-by-face) */
export interface AttendanceCheckInResult {
  id?: number
  employeeId?: number
  checkInTime?: string
  checkOutTime?: string
  workDate?: string
  status?: string
  createdAt?: string
}

export const attendanceApi = {
  getAll: () => api.get<ApiResponse<Page<Attendance>>>('/attendance'),
  getToday: (date?: string) =>
    api.get<ApiResponse<Attendance[]>>('/attendance/today', {
      params: date ? { date } : undefined,
    }),
  /** Descriptor 128 phần tử (face-api.js) — HR so khớp rồi ghi nhận check-in */
  checkInByFace: (descriptor: number[]) =>
    api
      .post<ApiResponse<AttendanceCheckInResult>>('/attendance/check-in-by-face', { descriptor })
      .then((res) => res.data),
};
