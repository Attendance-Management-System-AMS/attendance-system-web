export interface Schedule {
  id: number;
  employeeId: number;
  shiftId: number;
  date?: string;
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
  effectiveFrom: string;
}

export interface ScheduleTemplateItem {
  id?: number;
  dayOfWeek: number;
  shiftId: number;
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
}

export interface BulkAssignRequest {
  employeeIds: number[];
  shiftId: number;
  daysOfWeek: number[];
  effectiveFrom: string;
}
