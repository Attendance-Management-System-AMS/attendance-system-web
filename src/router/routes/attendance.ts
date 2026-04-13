import type { RouteRecordRaw } from 'vue-router'

export default [
    {
        path: '/attendance',
        name: 'attendance',
        component: () => import('@/views/attendance/AttendanceView.vue'),
        meta: { title: 'Chấm công hôm nay', roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
    },
] as RouteRecordRaw[]
