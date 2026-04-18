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
import type { CreateLeaveRequest } from '@/modules/leaves/types/leave.types';
import type { LeaveType } from '@/modules/leaves/types/leave-type.types';
import { useEmployees } from '@/modules/employees/composables/useEmployees';

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
const employees = computed(() => employeesQuery.data.value?.content ?? [])
const isLoadingEmployees = computed(() => employeesQuery.isLoading.value)

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
        class="fixed inset-0 bg-primary/10 backdrop-blur-sm data-[state=open]:animate-overlayShow data-[state=closed]:animate-overlayHide z-50" />
      <DialogContent
        class="fixed left-1/2 top-1/2 max-h-[85vh] w-[95vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-card shadow-2xl focus:outline-none data-[state=open]:animate-contentShow data-[state=closed]:animate-contentHide overflow-hidden border-none z-50">
        
        <div class="p-4 sm:p-6 bg-primary/10/50 border-b border-primary/20/50">
          <DialogTitle class="m-0 text-lg sm:text-xl font-semibold text-primary-text  tracking-normal">
            Tạo đơn nghỉ phép
          </DialogTitle>
          <DialogDescription class="text-[10px] font-bold text-primary  tracking-normal mt-0.5">
            Vui lòng điền thông tin chi tiết bên dưới
          </DialogDescription>
        </div>

        <form @submit.prevent="handleSubmit" class="p-4 sm:p-6 space-y-4">
          <div class="space-y-1.5">
            <label class="px-1 text-[10px] font-semibold  tracking-normal text-primary flex items-center gap-1.5">
              Nhân viên nhận đơn
            </label>
            <select v-model.number="employeeId"
              class="w-full h-10 rounded-lg border border-primary/20 bg-primary/10 px-3 text-xs font-bold text-primary-text focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none transition-all"
              :disabled="isLoadingEmployees || employees.length === 0">
              <option value="" disabled>Chọn nhân viên</option>
              <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                {{ employee.employeeCode }} — {{ employee.fullName }}
              </option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="px-1 text-[10px] font-semibold  tracking-normal text-primary flex items-center gap-1.5">
              Lý do chi tiết
            </label>
            <textarea v-model="reason" rows="3"
              class="w-full rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-medium text-primary-text focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-all"
              placeholder="Nhập lý do nghỉ phép..."></textarea>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <label class="px-1 text-[10px] font-semibold  tracking-normal text-primary flex items-center gap-1.5">
                Loại nghỉ
              </label>
              <select v-model="leaveTypeCode"
                class="w-full h-10 rounded-lg border border-primary/20 bg-primary/10 px-3 text-xs font-bold text-primary-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                :disabled="isLoadingLeaveTypes || availableTypes.length === 0">
                <option value="" disabled>Chọn loại</option>
                <option v-for="type in availableTypes" :key="type.id" :value="type.code">
                  {{ type.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="px-1 text-[10px] font-semibold  tracking-normal text-primary flex items-center gap-1.5">
                Từ ngày
              </label>
              <input v-model="fromDate" type="date"
                class="w-full h-10 rounded-lg border border-primary/20 bg-primary/10 px-3 text-xs font-bold text-primary-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
            </div>
            <div class="space-y-1.5">
              <label class="px-1 text-[10px] font-semibold  tracking-normal text-primary flex items-center gap-1.5">
                Đến ngày
              </label>
              <input v-model="toDate" type="date"
                class="w-full h-10 rounded-lg border border-primary/20 bg-primary/10 px-3 text-xs font-bold text-primary-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
            </div>
          </div>

          <div v-if="error || serverError" class="p-2 rounded bg-rose-50 border border-rose-100 text-[10px] font-bold text-rose-600 ">
            {{ error || serverError }}
          </div>

          <div class="mt-2 flex justify-end gap-2 pt-4 border-t border-primary/20">
            <DialogClose as-child>
              <button type="button"
                class="flex-1 h-11 rounded-lg border border-primary/20 px-4 text-[11px] font-semibold  tracking-normal text-primary hover:bg-primary/10 hover:text-primary transition-all"
                :disabled="isSubmitting">
                Hủy bỏ
              </button>
            </DialogClose>

            <button type="submit"
              class="flex-1 h-11 rounded-lg bg-primary px-4 text-[11px] font-semibold  tracking-normal text-white shadow-lg shadow-primary/20 hover:bg-primary disabled:opacity-50 transition-all"
              :disabled="isSubmitting || isLoadingLeaveTypes || isLoadingEmployees || availableTypes.length === 0 || employees.length === 0">
              {{ isSubmitting ? 'Đang gửi...' : 'Tạo đơn ngay' }}
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
