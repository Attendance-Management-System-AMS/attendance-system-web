import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/shifts',
    name: 'shifts',
    component: () => import('@/views/shifts/ShiftsView.vue'),
    meta: { title: 'Ca làm việc', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
  },
  {
    path: '/shifts/new',
    name: 'shifts-new',
    component: () => import('@/views/shifts/ShiftNewView.vue'),
    meta: { title: 'Thêm ca làm', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
  },
  {
    path: '/shifts/:id/edit',
    name: 'shifts-edit',
    component: () => import('@/views/shifts/ShiftEditView.vue'),
    meta: { title: 'Sửa ca làm', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
  },
] as RouteRecordRaw[]

