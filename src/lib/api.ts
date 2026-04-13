import axios from 'axios'
import { clearAuthToken, getAuthToken, setAuthTokens } from '@/lib/auth'
import { authApi, resolveAuthToken } from '@/services/auth.service'

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

// Response interceptor (e.g., for handling global errors)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !String(originalRequest.url ?? '').includes('/auth/')) {
      originalRequest._retry = true

      try {
        const refreshResponse = await authApi.refresh()
        const nextToken = resolveAuthToken(refreshResponse.result)
        if (nextToken) {
          setAuthTokens(nextToken, refreshResponse.result?.refreshToken)
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${nextToken}`
          } else {
            originalRequest.headers = { Authorization: `Bearer ${nextToken}` }
          }
          return api.request(originalRequest)
        }
      } catch (refreshError) {
        clearAuthToken()
        return Promise.reject(refreshError)
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
