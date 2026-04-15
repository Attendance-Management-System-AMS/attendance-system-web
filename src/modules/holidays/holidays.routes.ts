import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/holidays',
    name: 'holidays',
    component: () => import('@/modules/holidays/pages/HolidaysView.vue'),
    meta: { title: 'Ngày nghỉ', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
  },
  {
    path: '/holidays/new',
    name: 'holidays-new',
    component: () => import('@/modules/holidays/pages/HolidayNewView.vue'),
    meta: { title: 'Thêm ngày nghỉ', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
  },
  {
    path: '/holidays/:id/edit',
    name: 'holidays-edit',
    component: () => import('@/modules/holidays/pages/HolidayEditView.vue'),
    meta: { title: 'Sửa ngày nghỉ', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
  },
] as RouteRecordRaw[]
