import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/overtime',
    name: 'overtime',
    component: () => import('@/modules/overtime/pages/OvertimeView.vue'),
    meta: { title: 'Tăng ca', roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
  },
  {
    path: '/my/overtime',
    redirect: '/my/requests',
  },
] as RouteRecordRaw[]
