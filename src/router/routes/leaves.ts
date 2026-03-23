import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/leaves',
    name: 'leaves',
    component: () => import('@/views/timesheets/TimesheetsView.vue'),
    meta: { title: 'Nghỉ phép' },
  },
] as RouteRecordRaw[]
