import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/leaves',
    name: 'leaves',
    component: () => import('@/views/timesheets/TimesheetsView.vue'),
    meta: { title: 'Nghỉ phép', roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
  },
] as RouteRecordRaw[]
