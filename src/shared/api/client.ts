import axios from 'axios'
import { clearAuthToken, getAuthToken, getRefreshToken, setAuthTokens } from '@/shared/auth/token'
import { authApi, resolveAuthToken } from '@/modules/auth/api/auth.api'
import { resetAuthSession } from '@/shared/auth/session'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor (e.g., for adding auth tokens)
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ── Refresh Token Mutex ──────────────────────────────────────────────
// Đảm bảo chỉ có 1 request refresh tại 1 thời điểm.
// Các request 401 khác sẽ đợi kết quả từ refresh đang chạy.
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []
let refreshFailSubscribers: Array<(err: unknown) => void> = []

function subscribeTokenRefresh(onResolved: (token: string) => void, onRejected: (err: unknown) => void) {
  refreshSubscribers.push(onResolved)
  refreshFailSubscribers.push(onRejected)
}

function onRefreshSuccess(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
  refreshFailSubscribers = []
}

function onRefreshFailure(err: unknown) {
  refreshFailSubscribers.forEach((cb) => cb(err))
  refreshSubscribers = []
  refreshFailSubscribers = []
}
// ─────────────────────────────────────────────────────────────────────

// Response interceptor (e.g., for handling global errors)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !String(originalRequest.url ?? '').includes('/auth/')) {
      originalRequest._retry = true

      // Nếu đang có 1 refresh đang chạy → đợi kết quả
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(
            (newToken: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`
              } else {
                originalRequest.headers = { Authorization: `Bearer ${newToken}` }
              }
              resolve(api.request(originalRequest))
            },
            (err: unknown) => {
              reject(err)
            }
          )
        })
      }

      // Bắt đầu refresh
      isRefreshing = true
      try {
        // Kiểm tra refresh token còn tồn tại không
        const currentRefreshToken = getRefreshToken()
        if (!currentRefreshToken) {
          throw { isAuthExpired: true }
        }

        const refreshResponse = await authApi.refresh()
        const nextToken = resolveAuthToken(refreshResponse.result)
        if (nextToken) {
          setAuthTokens(nextToken, refreshResponse.result?.refreshToken)
          onRefreshSuccess(nextToken)

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${nextToken}`
          } else {
            originalRequest.headers = { Authorization: `Bearer ${nextToken}` }
          }
          return api.request(originalRequest)
        }

        throw { isAuthExpired: true }
      } catch (refreshError: unknown) {
        onRefreshFailure(refreshError)

        // Chỉ clear token + redirect login khi server trả lỗi 400/401 (token thực sự hết hạn)
        // KHÔNG clear khi network error / timeout (lỗi tạm thời)
        const isServerReject = axios.isAxiosError(refreshError)
          && refreshError.response
          && (refreshError.response.status === 400 || refreshError.response.status === 401)

        const isAuthExpired = typeof refreshError === 'object' && refreshError !== null && 'isAuthExpired' in refreshError

        if (isServerReject || isAuthExpired) {
          clearAuthToken()
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Xử lý lỗi Network Error (Backend down, CORS, etc.)
    if (!error.response) {
      console.error('Network Error: Không thể kết nối đến Backend API.', {
        message: error.message,
        baseURL: api.defaults.baseURL,
        config: error.config
      })
    } else {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
    }
    return Promise.reject(error)
  }
)

export default api
