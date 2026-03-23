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

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', data: CreateLeaveRequest): void
}>()

const employeeId = ref<number | null>(null)
const reason = ref('')
const leaveType = ref('') // optional
const startDate = ref('')
const endDate = ref('')

const loading = ref(false)
const error = ref<string | null>(null)

const resetForm = () => {
  employeeId.value = null
  reason.value = ''
  leaveType.value = ''
  startDate.value = ''
  endDate.value = ''
  loading.value = false
  error.value = null
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const handleSubmit = () => {
  error.value = null

  if (employeeId.value === null) {
    error.value = 'employeeId là bắt buộc'
    return
  }
  if (!reason.value.trim()) {
    error.value = 'Lý do là bắt buộc'
    return
  }
  if (!startDate.value || !endDate.value) {
    error.value = 'Vui lòng chọn thời gian bắt đầu/kết thúc'
    return
  }

  loading.value = true
  try {
    const payload: CreateLeaveRequest = {
      employeeId: employeeId.value,
      reason: reason.value.trim(),
      leaveType: leaveType.value.trim() || undefined,
      startDate: startDate.value,
      endDate: endDate.value,
    }

    emit('created', payload)
    resetForm()
    emit('close')
  } catch (err: any) {
    error.value = err?.message || 'Lỗi khi tạo đơn nghỉ'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <DialogRoot :open="open" @update:open="handleClose">
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
          Nhập thông tin để tạo đơn nghỉ phép mới.
        </DialogDescription>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              EmployeeId <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="employeeId"
              type="number"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Ví dụ: 1"
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
                LeaveType
              </label>
              <input
                v-model="leaveType"
                type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                placeholder="Ví dụ: annual"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Trạng thái (tự động)
              </label>
              <input disabled value="pending" type="text"
                class="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                StartDate <span class="text-red-500">*</span>
              </label>
              <input
                v-model="startDate"
                type="date"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                EndDate <span class="text-red-500">*</span>
              </label>
              <input
                v-model="endDate"
                type="date"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>

          <div class="mt-6 flex justify-end gap-3">
            <DialogClose as-child>
              <button
                type="button"
                class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                :disabled="loading"
              >
                Hủy
              </button>
            </DialogClose>

            <button
              type="submit"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              :disabled="loading"
            >
              {{ loading ? 'Đang tạo...' : 'Tạo đơn' }}
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

