import type { UserRole } from '@/modules/auth/composables/useAuth'

export interface PermissionRoleSummary {
  roleName: UserRole
  description: string | null
  userCount: number
}

export interface PermissionUser {
  id: number
  username: string
  email: string | null
  fullName: string | null
  departmentName: string | null
  positionName: string | null
  enabled: boolean
  roles: UserRole[]
  createdAt: string | null
}

export interface PermissionUsersFilters {
  keyword?: string
  enabled?: boolean
  role?: UserRole
  page?: number
  size?: number
  sort?: string
  sortDir?: 'asc' | 'desc'
}

export interface UpdatePermissionUserAccessRequest {
  roles: UserRole[]
  enabled: boolean
}
