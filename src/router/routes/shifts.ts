import type { RouteRecordRaw } from 'vue-router'

export default [
    {
        path: '/shifts',
        name: 'shifts',
        component: () => import('@/views/shifts/ShiftsView.vue'),
        meta: { title: 'Chức vụ' },
    },
] as RouteRecordRaw[]
