const AUTH_TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'

export function getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function setAuthTokens(accessToken: string, refreshToken?: string | null): void {
    setAuthToken(accessToken)
    if (refreshToken) {
        setRefreshToken(refreshToken)
    }
}

export function clearAuthToken(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function isAuthenticated(): boolean {
    const token = getAuthToken()
    return typeof token === 'string' && token.trim().length > 0
}
