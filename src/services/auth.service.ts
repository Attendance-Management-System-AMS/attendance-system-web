import authHttp from '@/lib/auth-http'
import type { ApiResponse } from '@/types/api'

export interface LoginRequest {
    email: string
    password: string
    remember?: boolean
}

export interface LoginResult {
    token?: string
    accessToken?: string
    jwt?: string
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
        authHttp.post<ApiResponse<RefreshResult>>('/auth/refresh').then((res) => res.data),
}
