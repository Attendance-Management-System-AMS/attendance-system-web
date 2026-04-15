import axios from 'axios'
import { getAuthToken } from '@/shared/auth/token'

const authHttp = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add a request interceptor to include the JWT token in all requests
authHttp.interceptors.request.use(
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

export default authHttp
