import axios from 'axios'

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
    const token = localStorage.getItem('token')
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
  (error) => {
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
