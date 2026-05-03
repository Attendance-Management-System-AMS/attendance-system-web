<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ShieldCheck } from 'lucide-vue-next'
import { roleDefinitions } from '@/shared/auth/access-control'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import type { PermissionRoleSummary, PermissionUser, UpdatePermissionUserAccessRequest } from '@/modules/permissions/types/permission.types'

const props = defineProps<{
  open: boolean
  user: PermissionUser | null
  roles: PermissionRoleSummary[]
  currentUserId?: number | null
  isSubmitting?: boolean
  submitError?: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: {
    userId: number
    payload: UpdatePermissionUserAccessRequest
    onSuccess: () => void
    onError: (error: unknown) => void
  }): void
}>()

const selectedRoles = ref<string[]>([])
const enabled = ref(true)
const localError = ref<string | null>(null)

const isCurrentUser = computed(() => props.user?.id != null && props.user.id === props.currentUserId)

watch(
  () => [props.open, props.user] as const,
  () => {
    selectedRoles.value = props.user?.roles ? [...props.user.roles] : []
    enabled.value = props.user?.enabled ?? true
    localError.value = null
  },
  { immediate: true },
)

function closeDialog() {
  localError.value = null
  emit('close')
}

function toggleRole(roleName: string, checked: boolean) {
  if (checked) {
    if (!selectedRoles.value.includes(roleName)) {
      selectedRoles.value = [...selectedRoles.value, roleName]
    }
    return
  }

  selectedRoles.value = selectedRoles.value.filter((role) => role !== roleName)
}

function handleSubmit() {
  if (!props.user) return

  if (selectedRoles.value.length === 0) {
    localError.value = 'Phải chọn ít nhất một vai trò cho tài khoản.'
    return
  }

  if (isCurrentUser.value && !enabled.value) {
    localError.value = 'Bạn không thể tự khóa tài khoản đang đăng nhập.'
    return
  }

  if (isCurrentUser.value && !selectedRoles.value.includes('ROLE_ADMIN')) {
    localError.value = 'Bạn không thể tự thu hồi quyền quản trị của chính mình.'
    return
  }

  localError.value = null

  emit('save', {
    userId: props.user.id,
    payload: {
      roles: selectedRoles.value as UpdatePermissionUserAccessRequest['roles'],
      enabled: enabled.value,
    },
    onSuccess: () => {
      closeDialog()
    },
    onError: (error: unknown) => {
      localError.value = getApiErrorMessage(error, 'Không thể cập nhật quyền truy cập.')
    },
  })
}

function getRoleLabel(roleName: string) {
  return roleDefinitions.find((role) => role.key === roleName)?.label ?? roleName
}
</script>

<template>
  <Dialog :open="open" @update:open="(value) => !value && closeDialog()">
    <DialogContent class="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <ShieldCheck class="h-4 w-4 text-primary" />
          Điều chỉnh quyền truy cập
        </DialogTitle>
        <DialogDescription>
          Cập nhật vai trò và trạng thái hoạt động cho tài khoản
          <span class="font-semibold text-primary-text">{{ user?.username }}</span>.
        </DialogDescription>
      </DialogHeader>

      <div v-if="user" class="space-y-5">
        <div class="rounded-xl border border-border bg-surface/70 p-4">
          <div class="space-y-1">
            <p class="text-sm font-semibold text-primary-text">{{ user.fullName || user.username }}</p>
            <p class="text-[11px] text-secondary-text">{{ user.email || 'Chưa có email liên kết' }}</p>
          </div>
          <p class="mt-2 text-[11px] text-tertiary-text">
            {{ user.departmentName || 'Chưa gắn phòng ban' }}
            <span v-if="user.positionName"> • {{ user.positionName }}</span>
          </p>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
            <div>
              <p class="text-sm font-semibold text-primary-text">Trạng thái tài khoản</p>
              <p class="text-[11px] text-secondary-text">
                Tài khoản bị khóa sẽ bị thu hồi refresh token và không thể đăng nhập lại.
              </p>
            </div>

            <label class="flex items-center gap-2 text-sm font-medium text-primary-text">
              <input
                :checked="enabled"
                type="checkbox"
                class="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                data-testid="permissions-enabled-toggle"
                @change="enabled = ($event.target as HTMLInputElement).checked"
              />
              Đang hoạt động
            </label>
          </div>

          <div class="rounded-xl border border-border bg-card p-4">
            <p class="text-sm font-semibold text-primary-text">Vai trò</p>
            <p class="mt-1 text-[11px] text-secondary-text">
              Một tài khoản có thể mang nhiều vai trò khi cần quyền liên thông giữa vận hành và self-service.
            </p>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <label
                v-for="role in roles"
                :key="role.roleName"
                class="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-3 transition-colors hover:bg-surface"
              >
                <input
                  :checked="selectedRoles.includes(role.roleName)"
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  :data-testid="`permissions-role-${role.roleName}`"
                  @change="toggleRole(role.roleName, ($event.target as HTMLInputElement).checked)"
                />
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-primary-text">{{ getRoleLabel(role.roleName) }}</p>
                  <p class="text-[11px] leading-5 text-secondary-text">
                    {{ role.description || 'Vai trò vận hành trong hệ thống.' }}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <p v-if="localError || submitError" class="text-sm font-medium text-rose-600">
          {{ localError || submitError }}
        </p>

        <p v-if="isCurrentUser" class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          Tài khoản hiện tại không thể tự bỏ quyền `ROLE_ADMIN` hoặc tự khóa để tránh mất quyền truy cập.
        </p>
      </div>

      <DialogFooter class="gap-2">
        <Button type="button" variant="outline" :disabled="isSubmitting" @click="closeDialog">
          Hủy
        </Button>
        <Button
          type="button"
          class="gap-2"
          :disabled="isSubmitting"
          data-testid="permissions-save-access"
          @click="handleSubmit"
        >
          {{ isSubmitting ? 'Đang lưu...' : 'Lưu quyền truy cập' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
