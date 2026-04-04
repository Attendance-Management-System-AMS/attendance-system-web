export interface Schedule {
  id: number;
  employeeId: number;
  shiftId: number;
  // Một số API trả lịch theo ngày cụ thể
  date?: string;
  // Một số API trả lịch định kỳ theo thứ + ngày hiệu lực
  dayOfWeek?: number;
  isActive?: boolean;
  effectiveFrom?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSchedule {
  employeeId: number;
  shiftId: number;
  dayOfWeek: number;
  isActive: boolean;
  effectiveFrom: string; // ISO date string
}
