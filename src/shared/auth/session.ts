import { queryClient } from '@/app/queryClient'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { clearAuthToken } from '@/shared/auth/token'

interface ResetAuthSessionOptions {
  redirectToLogin?: boolean
  redirectPath?: string
}

function buildLoginRedirect(targetPath?: string) {
  const redirect = targetPath?.trim()
  if (redirect) {
    return `/login?redirect=${encodeURIComponent(redirect)}`
  }
  return '/login'
}

export function resetAuthSession(options?: ResetAuthSessionOptions) {
  const { setUser } = useAuth()

  setUser(null)
  clearAuthToken()
  queryClient.clear()

  if (options?.redirectToLogin && typeof window !== 'undefined') {
    window.location.assign(buildLoginRedirect(options.redirectPath))
  }
}
