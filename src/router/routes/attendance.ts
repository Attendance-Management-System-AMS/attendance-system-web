import type { RouteRecordRaw } from 'vue-router'

export default [
    {
        path: '/attendance',
        name: 'attendance',
        component: () => import('@/views/attendance/AttendanceView.vue'),
        meta: { title: 'Chấm công hôm nay' },
    },
] as RouteRecordRaw[]
