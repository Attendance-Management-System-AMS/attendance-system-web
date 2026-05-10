<script setup lang="ts">
import { ref, watch } from 'vue'
import { ShieldCheck } from 'lucide-vue-next'
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
import { authApi } from '@/modules/auth/api/auth.api'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)
const localError = ref<string | null>(null)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
      localError.value = null
    }
  }
)

function closeDialog() {
  localError.value = null
  emit('update:open', false)
}

async function handleSubmit() {
  if (!currentPassword.value) {
    localError.value = 'Vui lòng nhập mật khẩu hiện tại.'
    return
  }

  if (!newPassword.value) {
    localError.value = 'Vui lòng nhập mật khẩu mới.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    localError.value = 'Mật khẩu xác nhận không khớp.'
    return
  }
  
  if (newPassword.value.length < 8) {
    localError.value = 'Mật khẩu mới phải có ít nhất 8 ký tự.'
    return
  }

  localError.value = null
  isSubmitting.value = true

  try {
    await authApi.changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    })
    toast.success('Đổi mật khẩu thành công')
    closeDialog()
  } catch (error) {
    localError.value = getApiErrorMessage(error, 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="(value) => !isSubmitting && emit('update:open', value)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <ShieldCheck class="h-4 w-4 text-primary" />
          Đổi mật khẩu
        </DialogTitle>
        <DialogDescription>
          Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold tracking-normal text-secondary-text mb-1.5">
              Mật khẩu hiện tại
            </label>
            <input
              v-model="currentPassword"
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
              :disabled="isSubmitting"
              class="h-10 w-full rounded-lg border border-border-standard bg-surface px-3 text-sm text-primary-text focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/40 dark:border-border dark:bg-elevated dark:text-primary-text"
            />
          </div>

          <div>
            <label class="block text-xs font-bold tracking-normal text-secondary-text mb-1.5">
              Mật khẩu mới
            </label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
              :disabled="isSubmitting"
              class="h-10 w-full rounded-lg border border-border-standard bg-surface px-3 text-sm text-primary-text focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/40 dark:border-border dark:bg-elevated dark:text-primary-text"
            />
          </div>

          <div>
            <label class="block text-xs font-bold tracking-normal text-secondary-text mb-1.5">
              Xác nhận mật khẩu mới
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              :disabled="isSubmitting"
              class="h-10 w-full rounded-lg border border-border-standard bg-surface px-3 text-sm text-primary-text focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/40 dark:border-border dark:bg-elevated dark:text-primary-text"
            />
          </div>
        </div>

        <p v-if="localError" class="text-sm font-medium text-rose-600">
          {{ localError }}
        </p>

        <DialogFooter class="gap-2 pt-2">
          <Button type="button" variant="outline" :disabled="isSubmitting" @click="closeDialog">
            Hủy
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
