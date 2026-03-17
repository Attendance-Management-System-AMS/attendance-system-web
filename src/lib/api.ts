import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9000/api',
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
    // Handle specific status codes here (e.g., 401, 403, 500)
    return Promise.reject(error)
  }
)

export default api
