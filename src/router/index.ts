import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { clearAuthToken, isAuthenticated, setAuthToken } from '@/lib/auth'
import { authApi, resolveAuthToken } from '@/services/auth.service'

// Import routes từ các module
import dashboard from './routes/dashboard'
import attendance from './routes/attendance'
import employees from './routes/employees'
import departments from './routes/departments'
import positions from './routes/positions'
import shifts from './routes/shifts'
import holidays from './routes/holidays'
import leaves from './routes/leaves'
import reports from './routes/reports'
import misc from './routes/misc'

const adminChildren: RouteRecordRaw[] = [
  ...dashboard,
  ...attendance,
  ...employees,
  ...departments,
  ...positions,
  ...shifts,
  ...holidays,
  ...leaves,
  ...reports,
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

router.beforeEach((to) => {
  const authed = isAuthenticated()
  const isLoginRoute = to.name === 'login'

  if (!authed && !isLoginRoute) {
    return authApi.refresh()
      .then((response) => {
        const token = resolveAuthToken(response.result)
        if (token) {
          setAuthToken(token)
          return true
        }
        clearAuthToken()
        return { name: 'login', query: { redirect: to.fullPath } }
      })
      .catch(() => {
        clearAuthToken()
        return { name: 'login', query: { redirect: to.fullPath } }
      })
  }

  if (authed && isLoginRoute) {
    return { path: '/dashboard' }
  }

  return true
})

// Cập nhật tiêu đề trang
router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} — TimeMaster AMS` : 'TimeMaster AMS'
})

export default router