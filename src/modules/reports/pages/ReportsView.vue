<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import {
  BarChart3,
  Clock3,
  Download,
  TimerReset,
  Users,
} from 'lucide-vue-next'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { useDepartments } from '@/modules/departments/composables/useDepartments'
import { useEmployees } from '@/modules/employees/composables/useEmployees'
import ExportReportDialog from '../components/ExportReportDialog.vue'
import {
  reportApi,
  type AnnualAttendanceSummary,
  type EmployeeAttendanceSummary,
  type EmployeeOvertimeSummary,
  type OvertimeSummary,
} from '../api/report.api'

const showExportDialog = ref(false)
const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const reportYear = ref(String(currentYear))
const selectedMonth = ref(String(currentMonth))
const reportScope = ref<'company' | 'employee'>('company')
const selectedDepartmentId = ref('')
const selectedEmployeeId = ref('')

const { departmentsQuery } = useDepartments({ size: 500, sort: 'name', sortDir: 'asc' })
const { employeesQuery } = useEmployees({
  size: 2000,
  sort: 'fullName',
  sortDir: 'asc',
})

const departments = computed(() => departmentsQuery.data.value?.content ?? [])
const employees = computed(() => employeesQuery.data.value?.content ?? [])

const selectedDepartment = computed(() =>
  departments.value.find((department) => String(department.id) === String(selectedDepartmentId.value)),
)
const selectedEmployee = computed(() =>
  employees.value.find((employee) => String(employee.id) === String(selectedEmployeeId.value)),
)

const parsedYear = computed(() => Number(reportYear.value))
const selectedMonthNumber = computed(() => {
  const parsed = Number(selectedMonth.value)
  return Number.isFinite(parsed) && parsed >= 1 && parsed <= 12 ? parsed : currentMonth
})
const canQuery = computed(() =>
  Number.isFinite(parsedYear.value)
  && parsedYear.value >= 2000
  && parsedYear.value <= 2100
  && (reportScope.value === 'company' || !!selectedEmployeeId.value),
)

const reportParams = computed(() => ({
  year: parsedYear.value,
  departmentId:
    reportScope.value === 'company' && selectedDepartmentId.value
      ? Number(selectedDepartmentId.value)
      : undefined,
  employeeId:
    reportScope.value === 'employee' && selectedEmployeeId.value
      ? Number(selectedEmployeeId.value)
      : undefined,
}))

const annualAttendanceQuery = useQuery<AnnualAttendanceSummary>({
  queryKey: computed(() => ['reports', 'attendance-annual', reportParams.value] as const),
  queryFn: async () => {
    const response = await reportApi.getAnnualAttendanceSummary(reportParams.value)
    return response.data.result as AnnualAttendanceSummary
  },
  enabled: canQuery,
  staleTime: 1000 * 60,
})

const overtimeSummaryQuery = useQuery<OvertimeSummary>({
  queryKey: computed(() => ['reports', 'overtime-annual', reportParams.value] as const),
  queryFn: async () => {
    const response = await reportApi.getOvertimeSummary(reportParams.value)
    return response.data.result as OvertimeSummary
  },
  enabled: canQuery,
  staleTime: 1000 * 60,
})

const attendanceSummary = computed(() => annualAttendanceQuery.data.value)

const scopeDescription = computed(() => {
  if (reportScope.value === 'employee') {
    return selectedEmployee.value
      ? `${selectedEmployee.value.employeeCode} - ${selectedEmployee.value.fullName}`
      : 'Chọn nhân viên để xem báo cáo năm'
  }

  return selectedDepartment.value
    ? `Phạm vi phòng ban ${selectedDepartment.value.name}`
    : 'Phạm vi toàn công ty'
})

const attendanceCards = computed(() => [
  {
    label: 'Nhân sự trong báo cáo',
    value: attendanceSummary.value?.totalEmployees ?? 0,
    helper: scopeDescription.value,
    icon: Users,
    tone: 'text-sky-600 bg-sky-500/10',
  },
  {
    label: 'Tổng ngày công',
    value: attendanceSummary.value?.workDays ?? 0,
    helper: `Đi muộn ${attendanceSummary.value?.lateDays ?? 0} ngày`,
    icon: BarChart3,
    tone: 'text-emerald-600 bg-emerald-500/10',
  },
  {
    label: 'Tổng giờ làm',
    value: formatHours(attendanceSummary.value?.workedMinutes),
    helper: `OT ${formatHours(attendanceSummary.value?.overtimeMinutes)}`,
    icon: Clock3,
    tone: 'text-indigo-600 bg-indigo-500/10',
  },
  {
    label: 'Vắng mặt',
    value: attendanceSummary.value?.absentDays ?? 0,
    helper: `Nghỉ phép ${attendanceSummary.value?.leaveDays ?? 0} ngày`,
    icon: TimerReset,
    tone: 'text-rose-600 bg-rose-500/10',
  },
])


const monthlyAttendanceRows = computed(() => attendanceSummary.value?.months ?? [])
const employeeAttendanceRows = computed(() => attendanceSummary.value?.employees ?? [])
const monthOptions = computed(() => {
  if (monthlyAttendanceRows.value.length > 0) {
    return monthlyAttendanceRows.value.map((row) => ({ value: String(row.month), label: row.label }))
  }

  return Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1),
    label: `Tháng ${index + 1}`,
  }))
})
const selectedMonthLabel = computed(() =>
  monthOptions.value.find((item) => Number(item.value) === selectedMonthNumber.value)?.label
  ?? `Tháng ${selectedMonthNumber.value}`,
)
const employeeMonthlyRows = computed(() =>
  employeeAttendanceRows.value
    .map((employee) => {
      const monthSummary = employee.months?.find((item) => item.month === selectedMonthNumber.value) ?? {
        month: selectedMonthNumber.value,
        label: selectedMonthLabel.value,
        workDays: 0,
        lateDays: 0,
        earlyLeaveDays: 0,
        absentDays: 0,
        leaveDays: 0,
        holidayDays: 0,
        missingCheckoutDays: 0,
        incompleteDays: 0,
        workedMinutes: 0,
        overtimeMinutes: 0,
      }

      return {
        employee,
        month: monthSummary,
      }
    })
    .sort((left, right) => {
      if (right.month.workedMinutes !== left.month.workedMinutes) {
        return right.month.workedMinutes - left.month.workedMinutes
      }
      if (right.month.workDays !== left.month.workDays) {
        return right.month.workDays - left.month.workDays
      }
      return formatEmployeeLabel(left.employee).localeCompare(formatEmployeeLabel(right.employee), 'vi')
    }),
)

const isLoading = computed(() =>
  annualAttendanceQuery.isLoading.value || overtimeSummaryQuery.isLoading.value,
)

const hasError = computed(() =>
  annualAttendanceQuery.isError.value || overtimeSummaryQuery.isError.value,
)

function formatHours(minutes?: number | null) {
  const value = minutes ?? 0
  return `${(value / 60).toFixed(2)}h`
}

function formatCount(value?: number | null) {
  return new Intl.NumberFormat('vi-VN').format(value ?? 0)
}

function formatEmployeeLabel(row: EmployeeAttendanceSummary | EmployeeOvertimeSummary) {
  return row.employeeCode ? `${row.employeeCode} - ${row.fullName ?? 'Chưa rõ'}` : row.fullName ?? 'Chưa rõ'
}

function retryQueries() {
  annualAttendanceQuery.refetch()
  overtimeSummaryQuery.refetch()
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Báo cáo & Phân tích"
      description="Theo dõi bảng công theo năm, thống kê tăng ca và xuất file phục vụ phản biện hoặc vận hành"
    >
      <template #actions>
        <Button
          @click="showExportDialog = true"
          class="gap-2 bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20"
        >
          <Download class="h-4 w-4" />
          Xuất báo cáo
        </Button>
      </template>
    </PageHeader>

      <Card class="shadow-none border-border-standard">
        <CardHeader>
          <CardTitle class="text-base font-bold text-primary-text">Bộ lọc báo cáo</CardTitle>
        </CardHeader>
      <CardContent class="grid gap-4 xl:grid-cols-[180px_220px_180px_1fr]">
        <div class="space-y-2">
          <label class="text-xs font-bold uppercase tracking-wider text-tertiary-text">Năm báo cáo</label>
          <input
            v-model="reportYear"
            type="number"
            min="2000"
            max="2100"
            class="h-10 w-full rounded-md border border-border-standard bg-surface px-3 text-sm font-medium text-primary-text outline-none focus:border-primary focus:ring-2 focus:ring-ring/40 dark:bg-background"
          />
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold uppercase tracking-wider text-tertiary-text">Phạm vi</label>
          <div class="flex rounded-md border border-border-standard bg-surface p-1 dark:bg-background">
            <button
              type="button"
              @click="reportScope = 'company'"
              :class="[
                'flex-1 rounded px-3 py-1.5 text-xs font-semibold transition-all',
                reportScope === 'company' ? 'bg-card text-primary-text shadow-sm' : 'text-secondary-text',
              ]"
            >
              Công ty
            </button>
            <button
              type="button"
              @click="reportScope = 'employee'"
              :class="[
                'flex-1 rounded px-3 py-1.5 text-xs font-semibold transition-all',
                reportScope === 'employee' ? 'bg-card text-primary-text shadow-sm' : 'text-secondary-text',
              ]"
            >
              Cá nhân
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold uppercase tracking-wider text-tertiary-text">Tháng chi tiết</label>
          <select
            v-model="selectedMonth"
            class="h-10 w-full rounded-md border border-border-standard bg-surface px-3 text-sm font-medium text-primary-text outline-none focus:border-primary focus:ring-2 focus:ring-ring/40 dark:bg-background"
          >
            <option v-for="month in monthOptions" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold uppercase tracking-wider text-tertiary-text">
            {{ reportScope === 'company' ? 'Phòng ban' : 'Nhân viên' }}
          </label>
          <select
            v-if="reportScope === 'company'"
            v-model="selectedDepartmentId"
            class="h-10 w-full rounded-md border border-border-standard bg-surface px-3 text-sm font-medium text-primary-text outline-none focus:border-primary focus:ring-2 focus:ring-ring/40 dark:bg-background"
          >
            <option value="">Toàn công ty</option>
            <option v-for="department in departments" :key="department.id" :value="department.id">
              {{ department.name }}
            </option>
          </select>
          <select
            v-else
            v-model="selectedEmployeeId"
            class="h-10 w-full rounded-md border border-border-standard bg-surface px-3 text-sm font-medium text-primary-text outline-none focus:border-primary focus:ring-2 focus:ring-ring/40 dark:bg-background"
          >
            <option value="">Chọn nhân viên</option>
            <option v-for="employee in employees" :key="employee.id" :value="employee.id">
              {{ employee.employeeCode }} - {{ employee.fullName }}
            </option>
          </select>
        </div>
      </CardContent>
    </Card>

    <div
      v-if="reportScope === 'employee' && !selectedEmployeeId"
      class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
    >
      Chọn nhân viên để xem báo cáo năm và báo cáo tăng ca theo cá nhân.
    </div>

    <div v-if="isLoading" class="flex h-56 items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>

    <div
      v-else-if="hasError"
      class="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
    >
      <p>Không thể tải dữ liệu báo cáo.</p>
      <Button variant="outline" class="mt-4" @click="retryQueries">Thử lại</Button>
    </div>

    <template v-else-if="canQuery">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card v-for="card in attendanceCards" :key="card.label" class="shadow-none border-border-standard">
          <CardContent class="flex items-center gap-4 p-5">
            <div :class="['rounded-xl p-3', card.tone]">
              <component :is="card.icon" class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-medium text-tertiary-text">{{ card.label }}</p>
              <p class="mt-1 text-2xl font-semibold text-primary-text">{{ card.value }}</p>
              <p class="mt-1 text-xs text-secondary-text">{{ card.helper }}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card class="shadow-none border-border-standard">
          <CardHeader>
            <CardTitle class="text-base font-bold text-primary-text">Tổng hợp bảng công theo tháng</CardTitle>
          </CardHeader>
          <CardContent class="overflow-x-auto">
            <table class="w-full min-w-180 border-collapse">
              <thead>
                <tr class="border-b border-border bg-surface/50">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-text">Tháng</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Ngày công</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Muộn</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Vắng</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Nghỉ phép</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Thiếu checkout</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Tổng giờ</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">OT</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-subtle">
                <tr v-for="row in monthlyAttendanceRows" :key="row.month">
                  <td class="px-4 py-3 text-sm font-semibold text-primary-text">{{ row.label }}</td>
                  <td class="px-4 py-3 text-right text-sm text-primary-text">{{ formatCount(row.workDays) }}</td>
                  <td class="px-4 py-3 text-right text-sm text-secondary-text">{{ formatCount(row.lateDays) }}</td>
                  <td class="px-4 py-3 text-right text-sm text-secondary-text">{{ formatCount(row.absentDays) }}</td>
                  <td class="px-4 py-3 text-right text-sm text-secondary-text">{{ formatCount(row.leaveDays) }}</td>
                  <td class="px-4 py-3 text-right text-sm text-secondary-text">{{ formatCount(row.missingCheckoutDays) }}</td>
                  <td class="px-4 py-3 text-right text-sm font-semibold text-primary-text">{{ formatHours(row.workedMinutes) }}</td>
                  <td class="px-4 py-3 text-right text-sm font-semibold text-indigo-600">{{ formatHours(row.overtimeMinutes) }}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card class="shadow-none border-border-standard">
          <CardHeader>
            <CardTitle class="text-base font-bold text-primary-text">Tóm tắt toàn kỳ</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="rounded-xl border border-border-standard bg-surface/60 px-4 py-3 dark:bg-elevated/40">
              <p class="text-xs font-semibold text-tertiary-text">Kỳ báo cáo</p>
              <p class="mt-1 text-sm font-semibold text-primary-text">
                {{ attendanceSummary?.fromDate }} đến {{ attendanceSummary?.toDate }}
              </p>
            </div>
            <div class="rounded-xl border border-border-standard bg-surface/60 px-4 py-3 dark:bg-elevated/40">
              <p class="text-xs font-semibold text-tertiary-text">Phạm vi</p>
              <p class="mt-1 text-sm font-semibold text-primary-text">{{ scopeDescription }}</p>
            </div>
            <div class="rounded-xl border border-border-standard bg-surface/60 px-4 py-3 dark:bg-elevated/40">
              <p class="text-xs font-semibold text-tertiary-text">Tình trạng công</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <Badge class="border-none bg-emerald-500/10 text-emerald-600">Đi muộn {{ attendanceSummary?.lateDays ?? 0 }}</Badge>
                <Badge class="border-none bg-amber-500/10 text-amber-600">Về sớm {{ attendanceSummary?.earlyLeaveDays ?? 0 }}</Badge>
                <Badge class="border-none bg-rose-500/10 text-rose-600">Vắng {{ attendanceSummary?.absentDays ?? 0 }}</Badge>
                <Badge class="border-none bg-sky-500/10 text-sky-600">Nghỉ phép {{ attendanceSummary?.leaveDays ?? 0 }}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card class="shadow-none border-border-standard">
        <CardHeader>
          <CardTitle class="text-base font-bold text-primary-text">Tổng hợp theo nhân viên</CardTitle>
        </CardHeader>
        <CardContent class="overflow-x-auto">
          <table class="w-full min-w-220 border-collapse">
            <thead>
              <tr class="border-b border-border bg-surface/50">
                <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-text">Nhân viên</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-text">Phòng ban</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Ngày công</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Muộn</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Vắng</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Nghỉ phép</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Thiếu checkout</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Giờ làm</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">OT</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="row in employeeAttendanceRows" :key="row.employeeId">
                <td class="px-4 py-3">
                  <p class="text-sm font-semibold text-primary-text">{{ formatEmployeeLabel(row) }}</p>
                  <p class="text-xs text-tertiary-text">{{ row.positionName || 'Chưa gán chức vụ' }}</p>
                </td>
                <td class="px-4 py-3 text-sm text-secondary-text">{{ row.departmentName || 'Chưa phân bổ' }}</td>
                <td class="px-4 py-3 text-right text-sm text-primary-text">{{ formatCount(row.workDays) }}</td>
                <td class="px-4 py-3 text-right text-sm text-secondary-text">{{ formatCount(row.lateDays) }}</td>
                <td class="px-4 py-3 text-right text-sm text-secondary-text">{{ formatCount(row.absentDays) }}</td>
                <td class="px-4 py-3 text-right text-sm text-secondary-text">{{ formatCount(row.leaveDays) }}</td>
                <td class="px-4 py-3 text-right text-sm text-secondary-text">{{ formatCount(row.missingCheckoutDays) }}</td>
                <td class="px-4 py-3 text-right text-sm font-semibold text-primary-text">{{ formatHours(row.workedMinutes) }}</td>
                <td class="px-4 py-3 text-right text-sm font-semibold text-indigo-600">{{ formatHours(row.overtimeMinutes) }}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card class="shadow-none border-border-standard">
        <CardHeader>
          <CardTitle class="text-base font-bold text-primary-text">
            Tổng hợp theo nhân viên trong {{ selectedMonthLabel }}
          </CardTitle>
        </CardHeader>
        <CardContent class="overflow-x-auto">
          <table class="w-full min-w-220 border-collapse">
            <thead>
              <tr class="border-b border-border bg-surface/50">
                <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-text">Nhân viên</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-text">Phòng ban</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Ngày công</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Muộn</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Vắng</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Nghỉ phép</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Thiếu checkout</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Giờ làm</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">OT</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="row in employeeMonthlyRows" :key="`${row.employee.employeeId}-${row.month.month}`">
                <td class="px-4 py-3">
                  <p class="text-sm font-semibold text-primary-text">{{ formatEmployeeLabel(row.employee) }}</p>
                  <p class="text-xs text-tertiary-text">{{ row.employee.positionName || 'Chưa gán chức vụ' }}</p>
                </td>
                <td class="px-4 py-3 text-sm text-secondary-text">{{ row.employee.departmentName || 'Chưa phân bổ' }}</td>
                <td class="px-4 py-3 text-right text-sm text-primary-text">{{ formatCount(row.month.workDays) }}</td>
                <td class="px-4 py-3 text-right text-sm text-secondary-text">{{ formatCount(row.month.lateDays) }}</td>
                <td class="px-4 py-3 text-right text-sm text-secondary-text">{{ formatCount(row.month.absentDays) }}</td>
                <td class="px-4 py-3 text-right text-sm text-secondary-text">{{ formatCount(row.month.leaveDays) }}</td>
                <td class="px-4 py-3 text-right text-sm text-secondary-text">{{ formatCount(row.month.missingCheckoutDays) }}</td>
                <td class="px-4 py-3 text-right text-sm font-semibold text-primary-text">{{ formatHours(row.month.workedMinutes) }}</td>
                <td class="px-4 py-3 text-right text-sm font-semibold text-indigo-600">{{ formatHours(row.month.overtimeMinutes) }}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </template>

    <ExportReportDialog v-model:open="showExportDialog" />
  </div>
</template>
