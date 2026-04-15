import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/modules/dashboard/pages/DashboardView.vue'),
    meta: { title: 'Dashboard', roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
  },
] as RouteRecordRaw[]
