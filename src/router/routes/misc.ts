import type { RouteRecordRaw } from 'vue-router'

export default [
    {
        path: '/schedule',
        name: 'schedule',
        component: () => import('@/views/placeholder/PlaceholderView.vue'),
        meta: { title: 'Lịch làm việc' },
    },
    {
        path: '/export',
        name: 'export',
        component: () => import('@/views/placeholder/PlaceholderView.vue'),
        meta: { title: 'Xuất báo cáo' },
    },
    {
        path: '/settings',
        name: 'settings',
        component: () => import('@/views/placeholder/PlaceholderView.vue'),
        meta: { title: 'Cài đặt' },
    },
    {
        path: '/permissions',
        name: 'permissions',
        component: () => import('@/views/placeholder/PlaceholderView.vue'),
        meta: { title: 'Phân quyền' },
    },
    {
        path: '/kiosk',
        name: 'kiosk',
        component: () => import('@/components/AttendanceKiosk.vue'),
        meta: {
            hideLayout: true,
            title: 'Kiosk Chấm công',
        },
    },
] as RouteRecordRaw[]
