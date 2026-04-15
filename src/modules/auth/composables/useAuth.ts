import { computed, ref } from 'vue'

export type UserRole = 'ROLE_ADMIN' | 'ROLE_HR' | 'ROLE_MANAGER' | 'ROLE_EMPLOYEE'

export interface UserProfile {
  id: number
  username: string
  fullName: string | null
  departmentName?: string
  positionName?: string
  email: string
  roles: UserRole[]
  avatar?: string
}

export type RawUserProfile = Omit<UserProfile, 'roles'> & {
  roles?: UserRole[] | string | null
}

const currentUser = ref<UserProfile | null>(null)
const isLoadingProfile = ref(false)

export function normalizeUserProfile(user: RawUserProfile): UserProfile {
  const roles =
    typeof user.roles === 'string'
      ? user.roles.split(',').map((role) => role.trim()).filter(Boolean)
      : Array.isArray(user.roles)
        ? user.roles
        : []

  return {
    ...user,
    roles: roles as UserRole[],
  }
}

export function useAuth() {
  const setUser = (user: RawUserProfile | UserProfile | null) => {
    currentUser.value = user ? normalizeUserProfile(user) : null
  }

  const user = computed(() => currentUser.value)
  const isAuthenticated = computed(() => !!currentUser.value)

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!currentUser.value) return false
    const roleList = Array.isArray(roles) ? roles : [roles]
    return currentUser.value.roles.some((r) => roleList.includes(r))
  }

  const isAdmin = computed(() => currentUser.value?.roles.includes('ROLE_ADMIN'))
  const isHR = computed(() => currentUser.value?.roles.includes('ROLE_HR'))
  const isManager = computed(() => currentUser.value?.roles.includes('ROLE_MANAGER'))
  const isEmployee = computed(() => currentUser.value?.roles.includes('ROLE_EMPLOYEE'))

  return {
    user,
    isAuthenticated,
    isLoadingProfile,
    setUser,
    hasRole,
    isAdmin,
    isHR,
    isManager,
    isEmployee,
  }
}
