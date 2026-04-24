import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { clearAuthToken, isAuthenticated, setAuthTokens } from '@/shared/auth/token'
import { authApi, resolveAuthToken } from '@/modules/auth/api/auth.api'
import { useAuth, type UserRole } from '@/modules/auth/composables/useAuth'

// Route nghiệp vụ nằm trong chính module để dễ lần theo chức năng.
import attendance from '@/modules/attendance/attendance.routes'
import dashboard from '@/modules/dashboard/dashboard.routes'
import departments from '@/modules/departments/departments.routes'
import employees from '@/modules/employees/employees.routes'
import holidays from '@/modules/holidays/holidays.routes'
import leaves from '@/modules/leaves/leaves.routes'
import misc from '@/modules/misc/misc.routes'
import positions from '@/modules/positions/positions.routes'
import reports from '@/modules/reports/reports.routes'
import shifts from '@/modules/schedules/shifts.routes'

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
    component: () => import('@/shared/layout/DashboardLayout.vue'),
    children: adminChildren,
  },

  // Trang không dùng layout
  ...misc.filter(route => route.meta?.hideLayout),

  // 404 fallback
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/modules/errors/pages/NotFoundView.vue'),
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
  const isPublicRoute = to.meta?.public === true
  const { user, setUser, hasRole, isAdmin, isHR, isManager, isEmployee } = useAuth()

  // 1. Xử lý Auth (Token) — chỉ thử refresh 1 lần duy nhất
  if (!authed && !isLoginRoute && !isPublicRoute) {
    try {
      const response = await authApi.refresh()
      const token = resolveAuthToken(response.result)
      if (token) {
        setAuthTokens(token, response.result?.refreshToken)
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
      if (resp.result) {
        setUser(resp.result)
      }
    } catch (profileErr: unknown) {
      // Nếu 401 (access token hết hạn) → thử refresh 1 lần rồi retry getProfile
      const is401 = typeof profileErr === 'object' && profileErr !== null
        && 'response' in profileErr
        && (profileErr as { response?: { status?: number } }).response?.status === 401

      if (is401) {
        try {
          const refreshResponse = await authApi.refresh()
          const token = resolveAuthToken(refreshResponse.result)
          if (!token) throw new Error('No token from refresh')
          setAuthTokens(token, refreshResponse.result?.refreshToken)

          // Retry getProfile với token mới
          const retryResp = await authApi.getProfile()
          if (retryResp.result) {
            setUser(retryResp.result)
          }
        } catch {
          // Refresh cũng thất bại → token thực sự hết hạn → logout
          clearAuthToken()
          setUser(null)
          if (!isLoginRoute) return { name: 'login' }
        }
      }
      // Lỗi khác (network, server) → không logout, user vẫn giữ session
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
