<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { PencilLine, RefreshCw, ShieldAlert, Users } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { UserRole } from '@/modules/auth/composables/useAuth'
import { useAuth } from '@/modules/auth/composables/useAuth'
import UserAccessDialog from '@/modules/permissions/components/UserAccessDialog.vue'
import { usePermissions } from '@/modules/permissions/composables/usePermissions'
import type { PermissionUser, UpdatePermissionUserAccessRequest } from '@/modules/permissions/types/permission.types'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import { roleDefinitions } from '@/shared/auth/access-control'
import PageHeader from '@/shared/ui/PageHeader.vue'
import SearchToolbar from '@/shared/ui/SearchToolbar.vue'
import FilterSelect from '@/shared/ui/FilterSelect.vue'
import Pagination from '@/shared/ui/Pagination.vue'
import DataTable from '@/shared/ui/DataTable.vue'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

const search = ref('')
const debouncedSearch = ref('')
const filterRole = ref<UserRole | ''>('')
const filterStatus = ref<'enabled' | 'disabled' | ''>('')
const currentPage = ref(0)
const pageSize = ref(12)
const editingUser = ref<PermissionUser | null>(null)

const updateDebouncedSearch = useDebounceFn((value: string) => {
  debouncedSearch.value = value.trim()
  currentPage.value = 0
}, 350)

watch(search, updateDebouncedSearch)
watch([filterRole, filterStatus], () => {
  currentPage.value = 0
})

const enabledFilter = computed(() => {
  if (filterStatus.value === 'enabled') return true
  if (filterStatus.value === 'disabled') return false
  return undefined
})

const { user } = useAuth()
const currentUserId = computed(() => user.value?.id ?? null)

const { usersQuery, updateUserAccess } = usePermissions({
  keyword: debouncedSearch,
  enabled: enabledFilter,
  role: filterRole,
  page: currentPage,
  size: pageSize,
  sort: () => 'createdAt',
  sortDir: () => 'desc',
  includeRoles: false,
})

const { data: usersData, isLoading: isUsersLoading } = usersQuery

const usersErrorMessage = computed(() =>
  usersQuery.isError.value
    ? getApiErrorMessage(usersQuery.error.value, 'Không tải được danh sách tài khoản.')
    : '',
)

const permissionApiTroubleshooting = computed(() => {
  const status = getErrorStatus(usersQuery.error.value)

  if (status === 403) {
    return 'Tài khoản hiện tại chưa có quyền ROLE_ADMIN ở backend.'
  }

  if (status === 404) {
    return 'API /api/auth/admin/users chưa có trên service đang chạy.'
  }

  if (status === 401) {
    return 'Phiên đăng nhập có thể đã hết hạn. Hãy đăng nhập lại.'
  }

  return 'Hãy kiểm tra auth-service, api-gateway và kết nối database nếu lỗi vẫn còn.'
})

const editableRoles = computed(() =>
  roleDefinitions.map((role) => ({
    roleName: role.key,
    description: role.description,
    userCount: 0,
  })),
)

const roleOptions = computed(() =>
  roleDefinitions.map((role) => ({
    label: role.label,
    value: role.key,
  })),
)

const statusOptions = [
  { label: 'Đang hoạt động', value: 'enabled' },
  { label: 'Đã khóa', value: 'disabled' },
]

const columns = [
  { key: 'user', label: 'Tài khoản' },
  { key: 'organization', label: 'Bộ phận' },
  { key: 'roles', label: 'Vai trò' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: '', align: 'right' as const },
]

const users = computed(() => usersData.value?.content ?? [])
const totalElements = computed(() => usersData.value?.totalElements ?? 0)
const totalPages = computed(() => usersData.value?.totalPages ?? 0)
const hasFilters = computed(() => Boolean(search.value.trim() || filterRole.value || filterStatus.value))

function openAccessDialog(target: PermissionUser) {
  editingUser.value = { ...target, roles: [...target.roles] }
}

function closeAccessDialog() {
  editingUser.value = null
}

function clearFilters() {
  search.value = ''
  debouncedSearch.value = ''
  filterRole.value = ''
  filterStatus.value = ''
  currentPage.value = 0
}

function handleSaveAccess(event: {
  userId: number
  payload: UpdatePermissionUserAccessRequest
  onSuccess: () => void
  onError: (error: unknown) => void
}) {
  updateUserAccess.mutate(
    {
      userId: event.userId,
      payload: event.payload,
    },
    {
      onSuccess: (updatedUser) => {
        toast.success(`Đã cập nhật quyền cho ${updatedUser.fullName || updatedUser.username}.`)
        event.onSuccess()
      },
      onError: (error) => {
        toast.error('Không thể cập nhật quyền truy cập.')
        event.onError(error)
      },
    },
  )
}

function getRoleBadgeClass(roleName: string) {
  switch (roleName) {
    case 'ROLE_ADMIN':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'
    case 'ROLE_HR':
      return 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300'
    case 'ROLE_MANAGER':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
    default:
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
  }
}

function getRoleLabel(roleName: string) {
  return roleDefinitions.find((role) => role.key === roleName)?.label ?? roleName
}

function getErrorStatus(error: unknown) {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return undefined
  }

  return (error as { response?: { status?: number } }).response?.status
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <PageHeader
        title="Phân quyền"
        description="Xem danh sách tài khoản và chỉnh vai trò truy cập."
      />

      <div class="inline-flex items-center gap-2 self-start rounded-lg border border-border bg-card px-3 py-2 text-sm text-secondary-text sm:self-auto">
        <Users class="h-4 w-4 text-primary" />
        <span>{{ isUsersLoading ? 'Đang tải...' : `${totalElements} tài khoản` }}</span>
      </div>
    </div>

    <Card class="border-border shadow-none">
      <CardContent class="space-y-4 p-5">
        <div class="space-y-1">
          <p class="text-sm font-semibold text-primary-text">Danh sách tài khoản và vai trò</p>
          <p class="text-xs leading-5 text-secondary-text">
            Tìm theo username hoặc email, lọc nhanh theo vai trò hoặc trạng thái rồi chỉnh quyền trực tiếp.
          </p>
        </div>

        <SearchToolbar v-model="search" placeholder="Tìm theo username hoặc email...">
          <template #filters>
            <FilterSelect v-model="filterRole" label="vai trò" :options="roleOptions" />
            <FilterSelect v-model="filterStatus" label="trạng thái" :options="statusOptions" />
          </template>
        </SearchToolbar>

        <div v-if="hasFilters" class="flex items-center justify-between rounded-lg border border-border bg-surface/50 px-3 py-2">
          <p class="text-xs text-secondary-text">Đang áp dụng bộ lọc cho danh sách tài khoản.</p>
          <Button size="sm" variant="ghost" class="h-8 px-2 text-xs" @click="clearFilters">
            Xóa lọc
          </Button>
        </div>

        <div
          v-if="usersQuery.isError.value"
          class="rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100"
        >
          <div class="flex items-start gap-3">
            <ShieldAlert class="mt-0.5 h-4 w-4 shrink-0" />
            <div class="space-y-2">
              <p class="text-sm font-semibold">Không tải được danh sách phân quyền</p>
              <p class="text-xs leading-5">
                {{ usersErrorMessage }}
              </p>
              <p class="text-xs leading-5 opacity-90">
                {{ permissionApiTroubleshooting }}
              </p>
              <div class="flex gap-2 pt-1">
                <Button size="sm" variant="outline" class="gap-2" @click="usersQuery.refetch()">
                  <RefreshCw class="h-3.5 w-3.5" />
                  Tải lại
                </Button>
                <Button
                  v-if="hasFilters"
                  size="sm"
                  variant="outline"
                  class="gap-2"
                  @click="clearFilters"
                >
                  Xóa lọc
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-lg border border-border bg-card">
          <DataTable :columns="columns" :rows="users" :loading="isUsersLoading">
            <template #cell-user="{ row }">
              <div class="space-y-1">
                <p class="text-sm font-semibold text-primary-text">
                  {{ row.fullName || row.username }}
                </p>
                <div class="flex flex-wrap items-center gap-2 text-[11px] text-secondary-text">
                  <code class="rounded bg-surface px-1.5 py-0.5 font-mono font-semibold text-primary">
                    {{ row.username }}
                  </code>
                  <span>{{ row.email || 'Chưa có email' }}</span>
                </div>
              </div>
            </template>

            <template #cell-organization="{ row }">
              <div class="space-y-1">
                <p class="text-sm font-medium text-primary-text">
                  {{ row.departmentName || 'Chưa liên kết hồ sơ HR' }}
                </p>
                <p class="text-[11px] text-tertiary-text">
                  {{ row.positionName || 'Chưa có chức vụ' }}
                </p>
              </div>
            </template>

            <template #cell-roles="{ row }">
              <div class="flex flex-wrap gap-1.5">
                <Badge
                  v-for="role in row.roles"
                  :key="role"
                  variant="secondary"
                  class="border-none px-2 py-0.5 text-[10px] font-semibold"
                  :class="getRoleBadgeClass(role)"
                  :data-testid="`permissions-user-${row.id}-role-${role}`"
                >
                  {{ getRoleLabel(role) }}
                </Badge>
              </div>
            </template>

            <template #cell-status="{ row }">
              <Badge
                :variant="row.enabled ? 'default' : 'secondary'"
                class="border-none px-2.5 py-0.5 text-[10px] font-semibold"
                :class="row.enabled ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-muted text-secondary-text dark:bg-elevated'"
              >
                {{ row.enabled ? 'Đang hoạt động' : 'Đã khóa' }}
              </Badge>
            </template>

            <template #cell-actions="{ row }">
              <Button
                size="sm"
                variant="outline"
                class="gap-2"
                :data-testid="`permissions-edit-${row.id}`"
                @click="openAccessDialog(row)"
              >
                <PencilLine class="h-3.5 w-3.5" />
                Chỉnh quyền
              </Button>
            </template>
          </DataTable>

          <Pagination
            v-model="currentPage"
            :total-pages="totalPages"
            :total-elements="totalElements"
            :page-size="pageSize"
            label="tài khoản"
          />
        </div>
      </CardContent>
    </Card>

    <UserAccessDialog
      :open="!!editingUser"
      :user="editingUser"
      :roles="editableRoles"
      :current-user-id="currentUserId"
      :is-submitting="updateUserAccess.isPending.value"
      @close="closeAccessDialog"
      @save="handleSaveAccess"
    />
  </div>
</template>
