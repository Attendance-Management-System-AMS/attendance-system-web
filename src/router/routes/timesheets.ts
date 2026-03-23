import type { RouteRecordRaw } from 'vue-router'

export default [
    {
        path: '/timesheets',
        name: 'timesheets',
        component: () => import('@/views/timesheets/TimesheetsView.vue'),
        meta: { title: 'Nghỉ phép' },
    },
] as RouteRecordRaw[]
