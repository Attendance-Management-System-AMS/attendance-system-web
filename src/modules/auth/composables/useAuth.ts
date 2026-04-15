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

const currentUser = ref<UserProfile | null>(null)
const isLoadingProfile = ref(false)

export function useAuth() {
  const setUser = (user: UserProfile | null) => {
    currentUser.value = user
  }

  const user = computed(() => currentUser.value)
  const isAuthenticated = computed(() => !!currentUser.value)

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!currentUser.value) return false
    const roleList = Array.isArray(roles) ? roles : [roles]
    // Kiểm tra xem user có ít nhất một trong các vai trò yêu cầu hay không
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
