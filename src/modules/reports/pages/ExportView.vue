<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/shared/ui/button'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { Download, FileSpreadsheet, Info } from 'lucide-vue-next'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import { useDepartments } from '@/modules/departments/composables/useDepartments'
import { useEmployees } from '@/modules/employees/composables/useEmployees'
import { reportApi } from '@/modules/reports/api/report.api'

const currentMonth = new Date().toISOString().slice(0, 7)

const reportMonth = ref(currentMonth)
const reportScope = ref<'company' | 'employee'>('company')
const selectedEmployeeId = ref('')
const selectedDepartmentId = ref('')
const isExporting = ref(false)
const errorMessage = ref('')

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

const outputColumns = computed(() =>
  reportScope.value === 'company'
    ? [
        'STT',
        'Mã NV',
        'Họ và tên',
        'Phòng ban',
        'Chức vụ',
        'Tổng ngày công',
        'Đi muộn',
        'Về sớm',
        'Vắng',
        'Tổng giờ',
        'Chi tiết từng ngày',
      ]
    : [
        'Ngày',
        'Thứ',
        'Giờ vào',
        'Giờ ra',
        'Trạng thái',
        'Đi muộn',
        'Về sớm',
        'Tổng giờ',
        'Ghi chú',
      ],
)

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
  } catch (err) {
    errorMessage.value = getApiErrorMessage(err, 'Không thể xuất báo cáo chấm công.')
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Xuất bảng công"
      description="Tạo file Excel theo tháng cho toàn công ty hoặc từng nhân viên"
    />

    <section
      class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <FileSpreadsheet class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Bảng công tháng</h2>
            <p class="text-sm text-slate-500">
              Dữ liệu lấy từ bản ghi chấm công, gồm giờ vào, giờ ra và tổng công.
            </p>
          </div>
        </div>
      </div>

      <div class="grid gap-0 lg:grid-cols-[1fr_360px]">
        <div class="space-y-6 px-5 py-5">
          <div class="grid gap-4">
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 dark:text-slate-300">
                Tháng công
              </label>
              <input
                v-model="reportMonth"
                type="month"
                class="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div v-if="reportScope === 'company'" class="space-y-2">
            <label class="text-sm font-bold text-slate-700 dark:text-slate-300">
              Phòng ban
            </label>
            <select
              v-model="selectedDepartmentId"
              class="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">Tất cả phòng ban</option>
              <option v-for="department in departments" :key="department.id" :value="department.id">
                {{ department.name }}
              </option>
            </select>
            <p v-if="departmentsQuery.isLoading.value" class="text-xs font-medium text-slate-400">
              Đang tải danh sách phòng ban...
            </p>
          </div>

          <div class="space-y-3">
            <label class="text-sm font-bold text-slate-700 dark:text-slate-300">
              Phạm vi xuất báo cáo
            </label>
            <div class="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                :class="[
                  'rounded-lg border px-4 py-4 text-left transition',
                  reportScope === 'company'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300',
                ]"
                @click="reportScope = 'company'"
              >
                <p class="text-sm font-bold">Toàn công ty</p>
                <p class="mt-1 text-xs opacity-75">
                  Mỗi dòng là một nhân viên, phù hợp tổng hợp bảng công tháng.
                </p>
              </button>

              <button
                type="button"
                :class="[
                  'rounded-lg border px-4 py-4 text-left transition',
                  reportScope === 'employee'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300',
                ]"
                @click="reportScope = 'employee'"
              >
                <p class="text-sm font-bold">Một nhân viên</p>
                <p class="mt-1 text-xs opacity-75">
                  Mỗi dòng là một ngày, có giờ vào, giờ ra và ghi chú thiếu giờ ra.
                </p>
              </button>
            </div>
          </div>

          <div v-if="reportScope === 'employee'" class="space-y-2">
            <label class="text-sm font-bold text-slate-700 dark:text-slate-300">
              Chọn nhân viên
            </label>
            <select
              v-model="selectedEmployeeId"
              class="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">Chọn nhân viên</option>
              <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                {{ employee.employeeCode }} - {{ employee.fullName }}
              </option>
            </select>
            <p v-if="employeesQuery.isLoading.value" class="text-xs font-medium text-slate-400">
              Đang tải danh sách nhân viên...
            </p>
          </div>

          <div
            class="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
          >
            <Info class="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p>
              File nhân viên sẽ ưu tiên chi tiết giờ vào/giờ ra từng ngày. File toàn công ty ưu
              tiên tổng hợp để dễ đối chiếu cuối tháng.
            </p>
          </div>
        </div>

        <aside
          class="border-t border-slate-100 bg-slate-50 px-5 py-5 dark:border-slate-800 dark:bg-slate-950 lg:border-l lg:border-t-0"
        >
          <div class="space-y-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400">File sẽ xuất</p>
              <h3 class="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {{ reportScope === 'company' ? 'Bảng công toàn công ty' : 'Bảng công nhân viên' }}
              </h3>
            </div>

            <dl class="space-y-3 text-sm">
              <div class="flex justify-between gap-4">
                <dt class="text-slate-500">Kỳ công</dt>
                <dd class="font-bold text-slate-800 dark:text-slate-100">{{ reportLabel }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-slate-500">Phạm vi</dt>
                <dd class="max-w-48 text-right font-bold text-slate-800 dark:text-slate-100">
                  {{ scopeLabel }}
                </dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-slate-500">Định dạng</dt>
                <dd class="font-bold text-slate-800 dark:text-slate-100">Excel .xls</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-slate-500">Kiểu bảng</dt>
                <dd class="font-bold text-slate-800 dark:text-slate-100">
                  {{ reportScope === 'company' ? 'Tổng hợp' : 'Chi tiết từng ngày' }}
                </dd>
              </div>
            </dl>

            <p
              v-if="errorMessage"
              class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
            >
              {{ errorMessage }}
            </p>

            <Button
              class="h-11 w-full gap-2 rounded-lg bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700 disabled:bg-emerald-400"
              :disabled="isExporting"
              @click="handleExport"
            >
              <Download class="h-4 w-4" />
              {{ isExporting ? 'Đang tạo file...' : 'Tải file Excel' }}
            </Button>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>
