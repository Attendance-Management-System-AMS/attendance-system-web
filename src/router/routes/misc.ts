import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      hideLayout: true,
      title: 'Đăng nhập',
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/profile/ProfileView.vue'),
    meta: { title: 'Hồ sơ cá nhân' },
  },
  {
    path: '/schedule',
    name: 'schedule',
    component: () => import('@/views/schedule/ScheduleView.vue'),
    meta: { title: 'Lịch làm việc', roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
  },
  {
    path: '/schedule/assignments',
    name: 'schedule-assignments',
    component: () => import('@/views/schedule/ScheduleAssignmentsView.vue'),
    meta: { title: 'Phân công lịch làm việc', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
  },
  {
    path: '/schedule/templates',
    name: 'schedule-templates',
    component: () => import('@/views/schedule/ScheduleTemplatesView.vue'),
    meta: { title: 'Mẫu lịch làm việc', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
  },
  {
    path: '/export',
    name: 'export',
    component: () => import('@/views/export/ExportView.vue'),
    meta: { title: 'Xuất báo cáo', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/settings/SettingsView.vue'),
    meta: { title: 'Cài đặt', roles: ['ROLE_ADMIN'] },
  },
  {
    path: '/permissions',
    name: 'permissions',
    component: () => import('@/views/permissions/PermissionsView.vue'),
    meta: { title: 'Phân quyền', roles: ['ROLE_ADMIN'] },
  },
  {
    path: '/kiosk',
    name: 'kiosk',
    component: () => import('@/components/attendance/AttendanceKiosk.vue'),
    meta: {
      hideLayout: true,
      title: 'Kiosk Chấm công',
    },
  },
  // Employee Portal
  {
    path: '/my/dashboard',
    name: 'my-dashboard',
    component: () => import('@/views/employee-portal/MyDashboardView.vue'),
    meta: { title: 'Bảng tin của tôi', roles: ['ROLE_EMPLOYEE', 'ROLE_ADMIN'] },
  },

  {
    path: '/my/attendance',
    name: 'my-attendance',
    component: () => import('@/views/employee-portal/MyAttendanceView.vue'),
    meta: { title: 'Bảng công của tôi', roles: ['ROLE_EMPLOYEE', 'ROLE_ADMIN'] },
  },
  {
    path: '/my/requests',
    name: 'my-requests',
    component: () => import('@/views/employee-portal/MyRequestsView.vue'),
    meta: { title: 'Đơn từ của tôi', roles: ['ROLE_EMPLOYEE', 'ROLE_ADMIN'] },
  },
] as RouteRecordRaw[]
