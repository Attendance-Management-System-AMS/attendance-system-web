export interface AttendanceResponse {
  employeeName?: string;
  message: string;
}

export const attendanceService = {
  async checkIn(descriptor: number[]): Promise<AttendanceResponse> {
    const res = await fetch('/api/attendance/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descriptor })
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Lỗi nhận diện hệ thống');
    }
    
    return res.json();
  }
};
