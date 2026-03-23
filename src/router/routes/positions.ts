import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/positions',
    name: 'positions',
    component: () => import('@/views/shifts/ShiftsView.vue'),
    meta: { title: 'Chức vụ' },
  },
  {
    path: '/positions/new',
    name: 'positions-new',
    component: () => import('@/views/positions/PositionNewView.vue'),
    meta: { title: 'Thêm chức vụ' },
  },
  {
    path: '/positions/:id/edit',
    name: 'positions-edit',
    component: () => import('@/views/positions/PositionEditView.vue'),
    meta: { title: 'Sửa chức vụ' },
  },
] as RouteRecordRaw[]
