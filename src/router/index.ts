import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Import routes từ các module
import dashboard from './routes/dashboard'
import attendance from './routes/attendance'
import employees from './routes/employees'
import departments from './routes/departments'
import positions from './routes/positions'
import leaves from './routes/leaves'
import legacyRedirects from './routes/legacyRedirects'
import reports from './routes/reports'
import misc from './routes/misc'

const adminChildren: RouteRecordRaw[] = [
  ...dashboard,
  ...attendance,
  ...employees,
  ...departments,
  ...positions,
  ...leaves,
  ...reports,
  ...legacyRedirects,
  ...misc.filter((route) => !route.meta?.hideLayout),
]

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },

  // Tất cả trang layout chung
  {
    path: '/',
    component: () => import('@/components/layout/DashboardLayout.vue'),
    children: adminChildren,
  },

  // Trang không dùng layout
  ...misc.filter(route => route.meta?.hideLayout),

  // 404 fallback
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/errors/NotFoundView.vue'),
    meta: { title: 'Không tìm thấy trang' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Cập nhật tiêu đề trang
router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} — TimeMaster AMS` : 'TimeMaster AMS'
})

export default router