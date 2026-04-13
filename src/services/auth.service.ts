import authHttp from '@/lib/auth-http'
import { getRefreshToken } from '@/lib/auth'
import type { ApiResponse } from '@/types/api'
import type { UserProfile } from '@/composables/useAuth'

export interface LoginRequest {
    email: string
    password: string
    remember?: boolean
}

export interface LoginResult {
    token?: string
    accessToken?: string
    jwt?: string
    refreshToken?: string
    user?: UserProfile
}

export type RefreshResult = LoginResult

export function resolveAuthToken(result?: LoginResult | RefreshResult | null): string | undefined {
    return result?.token || result?.accessToken || result?.jwt
}

export const authApi = {
    login: (payload: LoginRequest) =>
        authHttp.post<ApiResponse<LoginResult>>('/auth/login', {
            username: payload.email,
            email: payload.email,
            password: payload.password,
            remember: payload.remember,
        }).then((res) => res.data),
    refresh: () =>
        authHttp.post<ApiResponse<RefreshResult>>('/auth/refresh', {
            refreshToken: getRefreshToken(),
        }).then((res) => res.data),
    getProfile: () =>
        authHttp.get<ApiResponse<UserProfile>>('/auth/me').then((res) => res.data),
}
