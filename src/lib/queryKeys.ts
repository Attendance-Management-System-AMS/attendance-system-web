/**
 * Query keys dùng chung cho TanStack Query — tránh typo và invalidate lệch.
 * Giữ nguyên tuple cũ (vd. `employee` vs `employees`) để không đổi hành vi cache.
 */
export const queryKeys = {
  employees: {
    all: () => ['employees'] as const,
    detail: (id: number) => ['employee', id] as const,
  },
  departments: {
    all: () => ['departments'] as const,
    detail: (id: number | string) => ['department', id] as const,
  },
  positions: {
    all: () => ['positions'] as const,
    detail: (id: number | string) => ['position', id] as const,
  },
  shifts: {
    all: () => ['attendance-shifts'] as const,
    detail: (id: number | string) => ['attendance-shift', id] as const,
  },
  holidays: {
    all: () => ['attendance-holidays'] as const,
    detail: (id: number | string) => ['attendance-holiday', id] as const,
  },
  leaves: {
    all: () => ['leaves'] as const,
  },
  attendance: {
    today: () => ['attendance', 'today'] as const,
  },
  schedules: {
    all: () => ['schedules'] as const,
    byEmployee: (employeeId: string | number) => ['schedules', 'employee', employeeId] as const,
  },
} as const
