import type { RouteRecordRaw } from 'vue-router'

export default [
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: 'Dashboard' },
    },
] as RouteRecordRaw[]
