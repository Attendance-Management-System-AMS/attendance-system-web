import type { RouteRecordRaw } from 'vue-router'

export default [
    {
        path: '/reports',
        name: 'reports',
        component: () => import('@/views/reports/ReportsView.vue'),
        meta: { title: 'Báo cáo & Phân tích' },
    },
] as RouteRecordRaw[]
