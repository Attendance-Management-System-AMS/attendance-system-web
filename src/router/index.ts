import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { clearAuthToken, isAuthenticated, setAuthToken } from '@/lib/auth'
import { authApi, resolveAuthToken } from '@/services/auth.service'
import { useAuth, type UserProfile, type UserRole } from '@/composables/useAuth'

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

router.beforeEach(async (to) => {
  const authed = isAuthenticated()
  const isLoginRoute = to.name === 'login'
  const { user, setUser, hasRole, isAdmin, isHR, isManager, isEmployee } = useAuth()

  // 1. Xử lý Auth (Token)
  if (!authed && !isLoginRoute) {
    try {
      const response = await authApi.refresh()
      const token = resolveAuthToken(response.result)
      if (token) {
        setAuthToken(token)
      } else {
        throw new Error('No token')
      }
    } catch {
      clearAuthToken()
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }

  // 2. Fetch Profile nếu đã có token nhưng chưa có user data trong store
  if (isAuthenticated() && !user.value) {
    try {
      const resp = await authApi.getProfile()
      const result = resp.result
      if (!result) return

      // Tạo một bản sao để xử lý role nếu nó là string
      const userData = { ...result } as UserProfile & { roles: string | UserRole[] }

      if (userData.roles) {
        if (typeof userData.roles === 'string') {
          userData.roles = (userData.roles as string).split(',').map((r) => r.trim() as UserRole)
        }
      } else {
        userData.roles = []
      }
      setUser(userData as UserProfile)
    } catch {
      clearAuthToken()
      setUser(null)
      if (!isLoginRoute) return { name: 'login' }
    }
  }

  // 3. Kiểm tra Role
  const requiredRoles = to.meta?.roles as UserRole[] | undefined

  if (requiredRoles && !hasRole(requiredRoles)) {
    console.warn('Router: Access denied: insufficient permissions')
    if (isAdmin.value || isHR.value || isManager.value) return { name: 'dashboard' }
    if (isEmployee.value) return { name: 'my-dashboard' }
    return { name: 'dashboard' }
  }

  if (isAuthenticated() && (isLoginRoute || to.path === '/')) {
    // Ưu tiên Admin/HR/Manager vào trang quản trị
    if (isAdmin.value || isHR.value || isManager.value) {
      return { path: '/dashboard' }
    }
    if (isEmployee.value) {
      return { name: 'my-dashboard' }
    }
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
