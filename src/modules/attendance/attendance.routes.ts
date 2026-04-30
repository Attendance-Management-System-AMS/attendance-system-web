import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/attendance/employees/:id/monthly',
    name: 'attendance-employee-monthly',
    component: () => import('@/modules/attendance/pages/EmployeeMonthlyAttendanceView.vue'),
    meta: {
      title: 'Bảng công nhân viên',
      roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'],
    },
  },
  {
    path: '/attendance',
    name: 'attendance',
    component: () => import('@/modules/attendance/pages/AttendanceView.vue'),
    meta: { title: 'Chấm công hôm nay', roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
  },
] as RouteRecordRaw[]
