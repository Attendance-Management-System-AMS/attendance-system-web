import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { Page } from '@/shared/types/api'
import { queryKeys } from '@/shared/lib/queryKeys'
import { permissionApi } from '@/modules/permissions/api/permission.api'
import type {
  PermissionRoleSummary,
  PermissionUser,
  UpdatePermissionUserAccessRequest,
} from '@/modules/permissions/types/permission.types'
import type { UserRole } from '@/modules/auth/composables/useAuth'

export interface UsePermissionUsersParams {
  keyword?: MaybeRefOrGetter<string | undefined>
  enabled?: MaybeRefOrGetter<boolean | undefined>
  role?: MaybeRefOrGetter<UserRole | '' | undefined>
  page?: MaybeRefOrGetter<number | undefined>
  size?: MaybeRefOrGetter<number | undefined>
  sort?: MaybeRefOrGetter<string | undefined>
  sortDir?: MaybeRefOrGetter<'asc' | 'desc' | undefined>
  includeRoles?: MaybeRefOrGetter<boolean | undefined>
}

export function usePermissions(params?: UsePermissionUsersParams) {
  const queryClient = useQueryClient()
  const shouldLoadRoles = computed(() => toValue(params?.includeRoles) ?? true)

  const rolesQuery = useQuery<PermissionRoleSummary[]>({
    queryKey: queryKeys.permissions.roles(),
    queryFn: async () => {
      const response = await permissionApi.getRoles()
      return response.result ?? []
    },
    enabled: shouldLoadRoles,
    staleTime: 1000 * 60 * 5,
  })

  const usersQuery = useQuery<Page<PermissionUser>>({
    queryKey: computed(() => [
      ...queryKeys.permissions.users(),
      {
        keyword: toValue(params?.keyword),
        enabled: toValue(params?.enabled),
        role: toValue(params?.role),
        page: toValue(params?.page),
        size: toValue(params?.size),
        sort: toValue(params?.sort),
        sortDir: toValue(params?.sortDir),
      },
    ]),
    queryFn: async () => {
      const response = await permissionApi.getUsers({
        keyword: toValue(params?.keyword),
        enabled: toValue(params?.enabled),
        role: toValue(params?.role) || undefined,
        page: toValue(params?.page),
        size: toValue(params?.size),
        sort: toValue(params?.sort),
        sortDir: toValue(params?.sortDir),
      })
      return response.result
    },
    staleTime: 1000 * 30,
  })

  const updateUserAccess = useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: UpdatePermissionUserAccessRequest }) =>
      permissionApi.updateUserAccess(userId, payload).then((res) => res.result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.users() })
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.roles() })
    },
  })

  return {
    rolesQuery,
    usersQuery,
    updateUserAccess,
  }
}
