<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Download, FileSpreadsheet, Info } from 'lucide-vue-next'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import { useDepartments } from '@/modules/departments/composables/useDepartments'
import { useEmployees } from '@/modules/employees/composables/useEmployees'
import { reportApi } from '@/modules/reports/api/report.api'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const currentMonth = new Date().toISOString().slice(0, 7)

const reportMonth = ref(currentMonth)
const reportScope = ref<'company' | 'employee'>('company')
const selectedEmployeeId = ref('')
const selectedDepartmentId = ref('')
const isExporting = ref(false)
const errorMessage = ref('')

// Reset state when dialog opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    errorMessage.value = ''
    reportScope.value = 'company'
  }
})

const { departmentsQuery } = useDepartments({ size: 500, sort: 'name', sortDir: 'asc' })
const { employeesQuery } = useEmployees({
  size: 2000,
  sort: 'fullName',
  sortDir: 'asc',
  status: 'ACTIVE',
})

const employees = computed(() => employeesQuery.data.value?.content ?? [])
const departments = computed(() => departmentsQuery.data.value?.content ?? [])

const selectedEmployee = computed(() =>
  employees.value.find((employee) => String(employee.id) === String(selectedEmployeeId.value)),
)

const selectedDepartment = computed(() =>
  departments.value.find((department) => String(department.id) === String(selectedDepartmentId.value)),
)

const reportLabel = computed(() => {
  const [year, month] = reportMonth.value.split('-')
  if (!year || !month) return 'Chưa chọn tháng'
  return `Tháng ${month}/${year}`
})

const scopeLabel = computed(() => {
  if (reportScope.value === 'company') {
    return selectedDepartment.value ? `Phòng ban ${selectedDepartment.value.name}` : 'Toàn công ty'
  }
  return selectedEmployee.value
    ? `${selectedEmployee.value.employeeCode} - ${selectedEmployee.value.fullName}`
    : 'Chưa chọn nhân viên'
})

function getFilenameFromDisposition(disposition: string | undefined) {
  const match = disposition?.match(/filename="?([^"]+)"?/i)
  return match?.[1] ?? `bang-cong-${reportMonth.value}.xls`
}

const handleExport = async () => {
  errorMessage.value = ''
  const [year, month] = reportMonth.value.split('-').map(Number)

  if (!year || !month) {
    errorMessage.value = 'Vui lòng chọn tháng báo cáo.'
    return
  }

  if (reportScope.value === 'employee' && !selectedEmployeeId.value) {
    errorMessage.value = 'Vui lòng chọn nhân viên cần xuất báo cáo.'
    return
  }

  isExporting.value = true
  try {
    const response = await reportApi.exportMonthlyAttendance({
      year,
      month,
      departmentId:
        reportScope.value === 'company' && selectedDepartmentId.value
          ? selectedDepartmentId.value
          : undefined,
      employeeId: reportScope.value === 'employee' ? selectedEmployeeId.value : undefined,
      includeDetails: reportScope.value === 'employee',
    })
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/vnd.ms-excel;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = getFilenameFromDisposition(response.headers['content-disposition'])
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    
    // Close dialog on success
    emit('update:open', false)
  } catch (err) {
    errorMessage.value = getApiErrorMessage(err, 'Không thể xuất báo cáo chấm công.')
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px] gap-0 p-0 overflow-hidden">
      <DialogHeader class="p-6 border-b">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <FileSpreadsheet class="h-5 w-5" />
          </div>
          <div class="text-left">
            <DialogTitle>Xuất bảng công tháng</DialogTitle>
            <DialogDescription>
              Tạo file Excel theo tháng cho toàn công ty hoặc từng nhân viên.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div class="p-6 space-y-6">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-tertiary-text">
              Tháng công
            </label>
            <input
              v-model="reportMonth"
              type="month"
              class="h-10 w-full rounded-md border border-border-standard bg-surface px-3 text-sm font-medium text-primary-text outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary transition-all dark:bg-background"
            />
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-tertiary-text">
              Phạm vi
            </label>
            <div class="flex bg-surface dark:bg-background p-1 rounded-md border border-border-standard">
              <button 
                @click="reportScope = 'company'"
                :class="[
                  'flex-1 px-3 py-1.5 text-xs font-semibold rounded transition-all',
                  reportScope === 'company' ? 'bg-card shadow-sm text-primary-text' : 'text-secondary-text'
                ]"
              >
                Công ty
              </button>
              <button 
                @click="reportScope = 'employee'"
                :class="[
                  'flex-1 px-3 py-1.5 text-xs font-semibold rounded transition-all',
                  reportScope === 'employee' ? 'bg-card shadow-sm text-primary-text' : 'text-secondary-text'
                ]"
              >
                Cá nhân
              </button>
            </div>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div v-if="reportScope === 'company'" class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-tertiary-text">
              Phòng ban
            </label>
            <select
              v-model="selectedDepartmentId"
              class="h-10 w-full rounded-md border border-border-standard bg-surface px-3 text-sm font-medium text-primary-text outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary transition-all dark:bg-background"
            >
              <option value="">Tất cả phòng ban</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <div v-if="reportScope === 'employee'" class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-tertiary-text">
              Nhân viên
            </label>
            <select
              v-model="selectedEmployeeId"
              class="h-10 w-full rounded-md border border-border-standard bg-surface px-3 text-sm font-medium text-primary-text outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary transition-all dark:bg-background"
            >
              <option value="">Chọn nhân viên</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.employeeCode }} - {{ emp.fullName }}
              </option>
            </select>
          </div>

          <div class="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
            <Info class="h-4 w-4 text-emerald-600 shrink-0" />
            <p class="text-[11px] leading-relaxed text-secondary-text">
              {{ reportScope === 'company' 
                ? 'Xuất dữ liệu tổng hợp công của tất cả nhân viên trong kỳ.' 
                : 'Xuất chi tiết giờ vào/ra từng ngày của nhân viên được chọn.' 
              }}
            </p>
          </div>
        </div>

        <div v-if="errorMessage" class="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p class="text-xs font-medium text-destructive">{{ errorMessage }}</p>
        </div>
      </div>

      <DialogFooter class="p-6 bg-surface dark:bg-card border-t sm:justify-between items-center gap-4">
        <div class="hidden sm:block">
          <p class="text-[10px] font-bold uppercase text-tertiary-text tracking-wider">Xem trước tập tin</p>
          <p class="text-xs font-semibold text-primary-text">{{ reportLabel }} • {{ scopeLabel }}</p>
        </div>
        <div class="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" @click="emit('update:open', false)" :disabled="isExporting" class="flex-1 sm:flex-none border-border-standard">
            Hủy bỏ
          </Button>
          <Button @click="handleExport" :disabled="isExporting" class="flex-1 sm:flex-none bg-primary text-primary-foreground hover:brightness-110 gap-2 font-bold shadow-lg shadow-primary/20">
            <Download v-if="!isExporting" class="h-4 w-4" />
            {{ isExporting ? 'Đanh xuất...' : 'Tải xuống .xls' }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
