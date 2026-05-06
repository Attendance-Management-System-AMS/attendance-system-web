import api from '@/shared/api/client'
import type { ApiResponse, Page } from '@/shared/types/api'
import type {
  PermissionRoleSummary,
  PermissionUser,
  PermissionUsersFilters,
  UpdatePermissionUserAccessRequest,
} from '@/modules/permissions/types/permission.types'

export const permissionApi = {
  getRoles: () =>
    api.get<ApiResponse<PermissionRoleSummary[]>>('/auth/roles').then((res) => res.data),

  getUsers: (params: PermissionUsersFilters) =>
    api
      .get<ApiResponse<Page<PermissionUser>>>('/auth/admin/users', { params })
      .then((res) => res.data),

  updateUserAccess: (userId: number, payload: UpdatePermissionUserAccessRequest) =>
    api
      .put<ApiResponse<PermissionUser>>(`/auth/admin/users/${userId}/access`, payload)
      .then((res) => res.data),
}
