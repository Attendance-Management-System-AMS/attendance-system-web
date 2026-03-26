import type { RouteRecordRaw } from 'vue-router'

export default [
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
        meta: { title: 'Lịch làm việc' },
    },
    {
        path: '/export',
        name: 'export',
        component: () => import('@/views/export/ExportView.vue'),
        meta: { title: 'Xuất báo cáo' },
    },
    {
        path: '/settings',
        name: 'settings',
        component: () => import('@/views/settings/SettingsView.vue'),
        meta: { title: 'Cài đặt' },
    },
    {
        path: '/permissions',
        name: 'permissions',
        component: () => import('@/views/permissions/PermissionsView.vue'),
        meta: { title: 'Phân quyền' },
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
] as RouteRecordRaw[]
