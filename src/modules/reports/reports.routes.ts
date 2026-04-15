import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/modules/reports/pages/ReportsView.vue'),
    meta: { title: 'Báo cáo & Phân tích', roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
  },
] as RouteRecordRaw[]
