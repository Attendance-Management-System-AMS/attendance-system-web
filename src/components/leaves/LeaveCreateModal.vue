<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'reka-ui'
import type { CreateLeaveRequest } from '@/types/leave';
import type { LeaveType } from '@/types/leave-type';
import { useEmployees } from '@/composables/useEmployees';

const props = defineProps<{
  open: boolean
  /** Lỗi từ API sau khi gọi POST /leaves */
  serverError?: string | null
  isSubmitting?: boolean
  leaveTypes?: LeaveType[]
  isLoadingLeaveTypes?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', data: CreateLeaveRequest): void
}>()

const { employeesQuery } = useEmployees()

const employeeId = ref<number | null>(null)
const reason = ref('')
const leaveTypeCode = ref('')
const fromDate = ref('')
const toDate = ref('')

const error = ref<string | null>(null)
const availableTypes = computed(() => props.leaveTypes ?? [])
const employees = computed(() => employeesQuery.data.value ?? [])
const isLoadingEmployees = computed(() => employeesQuery.isPending.value)

watch(
  () => availableTypes.value,
  (types) => {
    const firstCode = types[0]?.code
    if (!leaveTypeCode.value && firstCode) {
      leaveTypeCode.value = firstCode
    }
  },
  { immediate: true },
)

const resetForm = () => {
  employeeId.value = null
  reason.value = ''
  leaveTypeCode.value = ''
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
    error.value = 'Vui lòng chọn nhân viên'
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
  if (!leaveTypeCode.value.trim()) {
    error.value = 'Vui lòng chọn loại nghỉ'
    return
  }
  if (new Date(toDate.value) < new Date(fromDate.value)) {
    error.value = 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu'
    return
  }

  const payload: CreateLeaveRequest = {
    employeeId: employeeId.value,
    leaveTypeCode: leaveTypeCode.value.trim(),
    fromDate: fromDate.value,
    toDate: toDate.value,
    reason: reason.value.trim(),
  }

  emit('created', payload)
}
</script>

<template>
  <DialogRoot :open="open" @update:open="(v) => !v && handleClose()">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 bg-black/40 backdrop-blur-sm data-[state=open]:animate-overlayShow data-[state=closed]:animate-overlayHide" />
      <DialogContent
        class="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-112.5 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl focus:outline-none data-[state=open]:animate-contentShow data-[state=closed]:animate-contentHide dark:bg-slate-900">
        <DialogTitle class="m-0 text-lg font-medium text-slate-900 dark:text-white">
          Tạo đơn nghỉ phép
        </DialogTitle>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Chọn nhân viên <span class="text-red-500">*</span>
            </label>
            <select v-model.number="employeeId"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              :disabled="isLoadingEmployees || employees.length === 0">
              <option value="" disabled>
                {{ isLoadingEmployees ? 'Đang tải danh sách nhân viên...' : 'Chọn nhân viên' }}
              </option>
              <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                {{ employee.employeeCode }} — {{ employee.fullName }}{{ employee.departmentName ? `
                (${employee.departmentName})` : '' }}
              </option>
            </select>
            <p v-if="!isLoadingEmployees && employees.length === 0" class="mt-1 text-xs text-rose-600">
              Chưa có nhân viên nào trong hệ thống.
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Lý do <span class="text-red-500">*</span>
            </label>
            <textarea v-model="reason" rows="3"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Nhập lý do nghỉ phép..."></textarea>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Loại nghỉ <span class="text-red-500">*</span>
              </label>
              <select v-model="leaveTypeCode"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                :disabled="isLoadingLeaveTypes || availableTypes.length === 0">
                <option value="" disabled>
                  {{ isLoadingLeaveTypes ? 'Đang tải loại nghỉ...' : 'Chọn loại nghỉ' }}
                </option>
                <option v-for="type in availableTypes" :key="type.id" :value="type.code">
                  {{ type.code }} — {{ type.name }}
                </option>
              </select>
              <p v-if="!isLoadingLeaveTypes && availableTypes.length === 0" class="mt-1 text-xs text-rose-600">
                Chưa có loại nghỉ khả dụng. Vui lòng liên hệ quản trị để cấu hình loại nghỉ.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Từ ngày <span class="text-red-500">*</span>
              </label>
              <input v-model="fromDate" type="date"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Đến ngày <span class="text-red-500">*</span>
              </label>
              <input v-model="toDate" type="date"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
            </div>
          </div>

          <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
          <p v-if="serverError"
            class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
            {{ serverError }}
          </p>

          <div class="mt-6 flex justify-end gap-3">
            <DialogClose as-child>
              <button type="button"
                class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                :disabled="isSubmitting">
                Hủy
              </button>
            </DialogClose>

            <button type="submit"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              :disabled="isSubmitting || isLoadingLeaveTypes || isLoadingEmployees || availableTypes.length === 0 || employees.length === 0">
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
