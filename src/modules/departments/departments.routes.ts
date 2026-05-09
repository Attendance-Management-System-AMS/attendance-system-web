import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/departments',
    meta: { roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
    children: [
      {
        path: '',
        name: 'departments',
        component: () => import('@/modules/departments/pages/DepartmentsView.vue'),
        meta: { title: 'Phòng ban' },
      },
    ],
  },
] as RouteRecordRaw[]
