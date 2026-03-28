import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/shifts',
    name: 'shifts',
    component: () => import('@/views/shifts/ShiftsView.vue'),
    meta: { title: 'Ca làm việc' },
  },
  {
    path: '/shifts/new',
    name: 'shifts-new',
    component: () => import('@/views/shifts/ShiftNewView.vue'),
    meta: { title: 'Thêm ca làm' },
  },
  {
    path: '/shifts/:id/edit',
    name: 'shifts-edit',
    component: () => import('@/views/shifts/ShiftEditView.vue'),
    meta: { title: 'Sửa ca làm' },
  },
] as RouteRecordRaw[]

