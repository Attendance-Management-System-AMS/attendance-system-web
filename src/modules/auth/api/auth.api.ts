import authHttp from '@/shared/auth/auth-http'
import { getRefreshToken } from '@/shared/auth/token'
import type { ApiResponse } from '@/shared/types/api'
import type { UserProfile } from '@/modules/auth/composables/useAuth'

export interface LoginRequest {
    login: string
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
            username: payload.login,
            email: payload.login,
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
