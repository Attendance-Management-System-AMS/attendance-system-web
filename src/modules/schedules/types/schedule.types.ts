export interface Schedule {
  id: number;
  employeeId: number;
  shiftId: number;
  employeeName?: string;
  shiftName?: string;
  startTime?: string;
  endTime?: string;
  date?: string;
  dayOfWeek?: number;
  isActive?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSchedule {
  employeeId: number;
  shiftId: number;
  dayOfWeek: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  force?: boolean;
}

export interface UpdateScheduleRequest {
  shiftId?: number;
  effectiveFrom?: string;
  force?: boolean;
  effectiveTo?: string | null;
  isActive?: boolean;
}

export interface ScheduleTemplateItem {
  id?: number;
  dayOfWeek: number;
  shiftId: number;
  shift?: { id: number };
}

export interface ScheduleTemplate {
  id: number;
  name: string;
  description?: string;
  items: ScheduleTemplateItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateScheduleTemplate {
  name: string;
  description?: string;
  items: ScheduleTemplateItem[];
}

export interface ApplyTemplateRequest {
  employeeIds: number[];
  templateId: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  force?: boolean;
}

export interface BulkAssignRequest {
  employeeIds: number[];
  shiftId: number;
  daysOfWeek: number[];
  effectiveFrom: string;
  effectiveTo?: string | null;
  force?: boolean;
}

export interface EmployeeScheduleResponse {
  id: number;
  employeeId: number;
  shiftId: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
}
