import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/holidays',
    name: 'holidays',
    component: () => import('@/views/holidays/HolidaysView.vue'),
    meta: { title: 'Ngày nghỉ' },
  },
  {
    path: '/holidays/new',
    name: 'holidays-new',
    component: () => import('@/views/holidays/HolidayNewView.vue'),
    meta: { title: 'Thêm ngày nghỉ' },
  },
  {
    path: '/holidays/:id/edit',
    name: 'holidays-edit',
    component: () => import('@/views/holidays/HolidayEditView.vue'),
    meta: { title: 'Sửa ngày nghỉ' },
  },
] as RouteRecordRaw[]

