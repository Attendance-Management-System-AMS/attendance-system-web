<script setup lang="ts">
import { ref } from 'vue'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'reka-ui'
import type { CreateLeaveRequest } from '@/types/leave'

defineProps<{
  open: boolean
  /** Lỗi từ API sau khi gọi POST /leaves */
  serverError?: string | null
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', data: CreateLeaveRequest): void
}>()

const employeeId = ref<number | null>(null)
const reason = ref('')
const leaveType = ref('')
const fromDate = ref('')
const toDate = ref('')

const error = ref<string | null>(null)

const resetForm = () => {
  employeeId.value = null
  reason.value = ''
  leaveType.value = ''
  fromDate.value = ''
  toDate.value = ''
  error.value = null
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const handleSubmit = () => {
  error.value = null

  if (employeeId.value === null || Number.isNaN(employeeId.value)) {
    error.value = 'Vui lòng nhập mã nhân viên (employeeId) hợp lệ'
    return
  }
  if (!reason.value.trim()) {
    error.value = 'Lý do là bắt buộc'
    return
  }
  if (!fromDate.value || !toDate.value) {
    error.value = 'Vui lòng chọn thời gian bắt đầu/kết thúc'
    return
  }

  const payload: CreateLeaveRequest = {
    employeeId: employeeId.value,
    leaveType: leaveType.value.trim() || 'ANNUAL',
    fromDate: fromDate.value,
    toDate: toDate.value,
    reason: reason.value.trim(),
  }

  emit('created', payload)
}
</script>

<template>
  <DialogRoot :open="open" @update:open="(v: boolean) => !v && handleClose()">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 bg-black/40 backdrop-blur-sm data-[state=open]:animate-overlayShow data-[state=closed]:animate-overlayHide"
      />
      <DialogContent
        class="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-112.5 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl focus:outline-none data-[state=open]:animate-contentShow data-[state=closed]:animate-contentHide dark:bg-slate-900"
      >
        <DialogTitle class="m-0 text-lg font-medium text-slate-900 dark:text-white">
          Tạo đơn nghỉ phép
        </DialogTitle>
        <DialogDescription class="mb-5 mt-2 leading-normal text-slate-600 dark:text-slate-400">
          Dữ liệu gửi lên <code class="rounded bg-slate-100 px-1 text-xs dark:bg-slate-800">POST /leaves</code>. Nếu lỗi 400,
          kiểm tra backend (employee tồn tại, enum loại nghỉ, định dạng ngày).
        </DialogDescription>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Mã nhân viên (employeeId) <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="employeeId"
              type="number"
              min="1"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="ID nhân viên trong hệ thống (ví dụ: 1)"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Lý do <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="reason"
              rows="3"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Nhập lý do nghỉ phép..."
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Loại nghỉ (leaveType)
              </label>
              <select
                v-model="leaveType"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="">ANNUAL (mặc định)</option>
                <option value="ANNUAL">ANNUAL — Nghỉ phép năm</option>
                <option value="SICK">SICK — Nghỉ ốm</option>
                <option value="UNPAID">UNPAID — Không lương</option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Trạng thái (do backend)
              </label>
              <input
                disabled
                value="pending"
                type="text"
                class="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Từ ngày <span class="text-red-500">*</span>
              </label>
              <input
                v-model="fromDate"
                type="date"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Đến ngày <span class="text-red-500">*</span>
              </label>
              <input
                v-model="toDate"
                type="date"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
          <p
            v-if="serverError"
            class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
          >
            {{ serverError }}
          </p>

          <div class="mt-6 flex justify-end gap-3">
            <DialogClose as-child>
              <button
                type="button"
                class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                :disabled="isSubmitting"
              >
                Hủy
              </button>
            </DialogClose>

            <button
              type="submit"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Đang gửi lên server...' : 'Tạo đơn' }}
            </button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style>
@keyframes overlayShow {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes overlayHide {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes contentShow {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes contentHide {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
}
</style>
