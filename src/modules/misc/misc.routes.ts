import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/pages/LoginView.vue'),
    meta: {
      hideLayout: true,
      title: 'Đăng nhập',
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/modules/profile/pages/ProfileView.vue'),
    meta: { title: 'Hồ sơ cá nhân' },
  },
  {
    path: '/schedule',
    name: 'schedule',
    component: () => import('@/modules/schedules/pages/ScheduleView.vue'),
    meta: { title: 'Lịch làm việc', roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
  },
  {
    path: '/schedule/assignments',
    name: 'schedule-assignments',
    component: () => import('@/modules/schedules/pages/ScheduleAssignmentsView.vue'),
    meta: { title: 'Phân công lịch làm việc', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
  },
  {
    path: '/schedule/templates',
    name: 'schedule-templates',
    component: () => import('@/modules/schedules/pages/ScheduleTemplatesView.vue'),
    meta: { title: 'Mẫu lịch làm việc', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
  },

  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/modules/settings/pages/SettingsView.vue'),
    meta: { title: 'Cài đặt', roles: ['ROLE_ADMIN'] },
  },
  {
    path: '/permissions',
    name: 'permissions',
    component: () => import('@/modules/permissions/pages/PermissionsView.vue'),
    meta: { title: 'Phân quyền', roles: ['ROLE_ADMIN'] },
  },
  {
    path: '/kiosk',
    name: 'kiosk',
    component: () => import('@/modules/attendance/components/AttendanceKiosk.vue'),
    meta: {
      hideLayout: true,
      public: true,
      title: 'Máy chấm công',
    },
  },
  {
    path: '/my/dashboard',
    name: 'my-dashboard',
    component: () => import('@/modules/employee-portal/pages/MyDashboardView.vue'),
    meta: { title: 'Bảng tin của tôi', roles: ['ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_ADMIN'] },
  },
  {
    path: '/my/attendance',
    name: 'my-attendance',
    component: () => import('@/modules/employee-portal/pages/MyAttendanceView.vue'),
    meta: { title: 'Bảng công của tôi', roles: ['ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_ADMIN'] },
  },
  {
    path: '/my/schedule',
    name: 'my-schedule',
    component: () => import('@/modules/employee-portal/pages/MyScheduleView.vue'),
    meta: { title: 'Lịch làm việc của tôi', roles: ['ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_ADMIN'] },
  },
  {
    path: '/my/requests',
    name: 'my-requests',
    component: () => import('@/modules/employee-portal/pages/MyRequestsView.vue'),
    meta: { title: 'Đơn từ của tôi', roles: ['ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_ADMIN'] },
  },
] as RouteRecordRaw[]
