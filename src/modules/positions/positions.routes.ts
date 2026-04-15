import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/positions',
    name: 'positions',
    component: () => import('@/modules/positions/pages/PositionsView.vue'),
    meta: { title: 'Chức vụ', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
  },
  {
    path: '/positions/new',
    name: 'positions-new',
    component: () => import('@/modules/positions/pages/PositionNewView.vue'),
    meta: { title: 'Thêm chức vụ', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
  },
  {
    path: '/positions/:id/edit',
    name: 'positions-edit',
    component: () => import('@/modules/positions/pages/PositionEditView.vue'),
    meta: { title: 'Sửa chức vụ', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
  },
] as RouteRecordRaw[]
