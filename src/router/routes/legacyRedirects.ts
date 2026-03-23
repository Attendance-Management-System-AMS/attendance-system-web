import type { RouteRecordRaw } from 'vue-router'

/** Giữ bookmark / liên kết cũ sau khi đổi path chuẩn. */
export default [
  { path: '/timesheets', redirect: '/leaves' },
  {
    path: '/shifts/:id/edit',
    redirect: (to) => `/positions/${String(to.params.id)}/edit`,
  },
  { path: '/shifts/new', redirect: '/positions/new' },
  { path: '/shifts', redirect: '/positions' },
] as RouteRecordRaw[]
