<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { RouterLink } from 'vue-router'
import { ArrowLeft, CalendarRange, LayoutGrid, Trash2, Check, X, Calendar as CalendarIcon, Info, Loader2 } from 'lucide-vue-next'
import DeleteConfirmDialog from '@/shared/ui/DeleteConfirmDialog.vue'
import FormCard from '@/shared/ui/FormCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { useEmployees } from '@/modules/employees/composables/useEmployees'
import { useSchedules } from '@/modules/schedules/composables/useSchedules'
import { useShifts } from '@/modules/schedules/composables/useShifts'
import { useScheduleTemplates } from '@/modules/schedules/composables/useScheduleTemplates'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import { scheduleApi } from '@/modules/schedules/api/schedule.api'
import type { Page } from '@/shared/types/api'
import type { Schedule } from '@/modules/schedules/types/schedule.types'
import type { Shift } from '@/modules/schedules/types/shift.types'
import type { Employee } from '@/modules/employees/types/employee.types'
import { toast } from 'vue-sonner'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

interface ScheduleWithShift extends Schedule {
  shift?: Shift
}

// Fetch more employees for assignment list to ensure search works
const { employeesQuery } = useEmployees({ size: 2000 })
const { shiftsQuery } = useShifts()
const { templatesQuery } = useScheduleTemplates()
const { bulkAssign, applyTemplate, deleteSchedule } = useSchedules(null)

const employees = computed<Employee[]>(() => employeesQuery.data.value?.content ?? [])
const shifts = computed(() => shiftsQuery.data.value ?? [])

const assignmentError = ref('')
const assignmentSuccess = ref('')
const deleteDialogOpen = ref(false)
const isAssignDialogOpen = ref(false)
const deleteTarget = ref<ScheduleWithShift | null>(null)

const initialWeeklyShifts = () => ({
  1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: ''
})

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const todayInput = formatDateForInput(new Date())

const assignmentForm = reactive({
  mode: 'bulk' as 'bulk' | 'template',
  employeeIds: [] as number[],
  shiftId: '',
  shiftsPerDay: initialWeeklyShifts() as Record<number, string>,
  templateId: '',
  daysOfWeek: [] as number[],
  effectiveFrom: todayInput,
  effectiveTo: '',
})

const employeeSearch = ref('')
const filteredEmployees = computed(() => {
  const search = employeeSearch.value.toLowerCase().trim()
  if (!search) return employees.value.slice(0, 100)
  return employees.value
    .filter(
      (e) =>
        e.fullName.toLowerCase().includes(search) ||
        (e.employeeCode && e.employeeCode.toLowerCase().includes(search)),
    )
    .slice(0, 200)
})

const toggleEmployee = (id: number) => {
  const index = assignmentForm.employeeIds.indexOf(id)
  if (index > -1) {
    assignmentForm.employeeIds.splice(index, 1)
  } else {
    assignmentForm.employeeIds.push(id)
  }
}

const dayOfWeekOptions = [
  { label: 'Thứ 2', value: 1 },
  { label: 'Thứ 3', value: 2 },
  { label: 'Thứ 4', value: 3 },
  { label: 'Thứ 5', value: 4 },
  { label: 'Thứ 6', value: 5 },
  { label: 'Thứ 7', value: 6 },
  { label: 'Chủ nhật', value: 7 },
]

const setQuickShifts = (days: number[], shiftId: string) => {
  days.forEach(d => {
    assignmentForm.shiftsPerDay[d] = shiftId
  })
}

const scheduleEmployeeFilter = ref('')
const scheduleShiftFilter = ref('')
const scheduleDayFilter = ref('')
const scheduleSearch = ref('')
const assignedPage = ref(1)
const assignedPageSize = ref(10)

interface ScheduleSearchData {
  items: Schedule[]
  totalPages: number
  totalElements: number
  page: number
}

const normalizeScheduleSearchData = (result: unknown): ScheduleSearchData => {
  if (Array.isArray(result)) {
    return {
      items: result as Schedule[],
      totalPages: 1,
      totalElements: result.length,
      page: 0,
    }
  }

  if (result && typeof result === 'object') {
    const pageResult = result as Partial<Page<Schedule>> & {
      items?: Schedule[]
      records?: Schedule[]
      data?: Schedule[]
      total?: number
    }

    const items = Array.isArray(pageResult.content)
      ? pageResult.content
      : Array.isArray(pageResult.items)
        ? pageResult.items
        : Array.isArray(pageResult.records)
          ? pageResult.records
          : Array.isArray(pageResult.data)
            ? pageResult.data
            : []

    const totalElements =
      typeof pageResult.totalElements === 'number'
        ? pageResult.totalElements
        : typeof pageResult.total === 'number'
          ? pageResult.total
          : items.length

    const totalPages =
      typeof pageResult.totalPages === 'number'
        ? pageResult.totalPages
        : Math.max(1, Math.ceil(totalElements / assignedPageSize.value))

    const page = typeof pageResult.page === 'number' ? pageResult.page : 0

    return {
      items,
      totalPages,
      totalElements,
      page,
    }
  }

  return {
    items: [],
    totalPages: 1,
    totalElements: 0,
    page: 0,
  }
}

const assignedSchedulesQuery = useQuery<ScheduleSearchData>({
  queryKey: computed(() => [
    'schedules',
    'search',
    {
      employeeId: scheduleEmployeeFilter.value || null,
      shiftId: scheduleShiftFilter.value || null,
      dayOfWeek: scheduleDayFilter.value || null,
      keyword: scheduleSearch.value.trim() || null,
      page: assignedPage.value,
      size: assignedPageSize.value,
    },
  ]),
  queryFn: async () => {
    const keyword = scheduleSearch.value.trim()
    const params: Record<string, unknown> = {
      page: assignedPage.value - 1,
      size: assignedPageSize.value,
    }

    if (scheduleEmployeeFilter.value) params.employeeId = Number(scheduleEmployeeFilter.value)
    if (scheduleShiftFilter.value) params.shiftId = Number(scheduleShiftFilter.value)
    if (scheduleDayFilter.value) params.dayOfWeek = Number(scheduleDayFilter.value)
    if (keyword) {
      params.keyword = keyword
      params.search = keyword
      params.query = keyword
    }

    const response = await scheduleApi.search(params)
    return normalizeScheduleSearchData(response.data?.result)
  },
  staleTime: 1000 * 30,
  refetchOnMount: 'always',
})

watch([scheduleEmployeeFilter, scheduleShiftFilter, scheduleDayFilter, scheduleSearch], () => {
  assignedPage.value = 1
})

const scheduleList = computed(() => assignedSchedulesQuery.data.value?.items ?? [])
const assignedTotalPages = computed(() =>
  Math.max(1, assignedSchedulesQuery.data.value?.totalPages ?? 1),
)
const assignedPageLabel = computed(() => (assignedSchedulesQuery.data.value?.page ?? 0) + 1)

const filteredSchedules = computed<ScheduleWithShift[]>(() => {
  return scheduleList.value.map((schedule) => ({
    ...schedule,
    shift: shifts.value.find((s) => String(s.id) === String(schedule.shiftId)),
  }))
})

const getEmployeeName = (employeeId: number | string): string => {
  const employee = employees.value.find((item) => String(item.id) === String(employeeId))
  if (!employee) return `NV #${employeeId}`
  return `${employee.fullName}${employee.employeeCode ? ` (${employee.employeeCode})` : ''}`
}

const getShiftName = (shiftId: number | string): string => {
  const shift = shifts.value.find((item) => String(item.id) === String(shiftId))
  return shift?.name || `Ca #${shiftId}`
}

const formatDayOfWeekLabel = (dayOfWeek?: number): string => {
  switch (dayOfWeek) {
    case 1: return 'Thứ 2'
    case 2: return 'Thứ 3'
    case 3: return 'Thứ 4'
    case 4: return 'Thứ 5'
    case 5: return 'Thứ 6'
    case 6: return 'Thứ 7'
    case 7: return 'Chủ nhật'
    default: return '—'
  }
}

const fmtTime = (time: string | undefined): string => {
  if (!time) return '-'
  return time.substring(0, 5)
}

const fmtDateInput = (value?: string): string => {
  if (!value) return '—'
  const trimmed = value.trim()
  if (!trimmed) return '—'
  return trimmed.slice(0, 10)
}

const formatEffectiveRange = (schedule: Schedule) => {
  const from = fmtDateInput(schedule.effectiveFrom)
  const to = fmtDateInput(schedule.effectiveTo ?? undefined)
  if (to === '—') return `Từ ${from}`
  return `${from} → ${to}`
}

const isSubmittingAssignment = computed(
  () => bulkAssign.isPending.value || applyTemplate.isPending.value,
)

const resetAssignmentForm = () => {
  assignmentForm.mode = 'bulk'
  assignmentForm.employeeIds = []
  assignmentForm.shiftId = ''
  assignmentForm.shiftsPerDay = initialWeeklyShifts()
  assignmentForm.templateId = ''
  assignmentForm.daysOfWeek = []
  assignmentForm.effectiveFrom = todayInput
  assignmentForm.effectiveTo = ''
  employeeSearch.value = ''
}

const submitAssignment = async () => {
  assignmentError.value = ''
  assignmentSuccess.value = ''

  if (assignmentForm.employeeIds.length === 0) {
    assignmentError.value = 'Vui lòng chọn ít nhất một nhân viên.'
    return
  }

  const effectiveFrom = assignmentForm.effectiveFrom
  if (!effectiveFrom) {
    assignmentError.value = 'Vui lòng chọn ngày hiệu lực.'
    return
  }
  if (effectiveFrom < todayInput) {
    assignmentError.value = 'Ngày hiệu lực không được ở quá khứ.'
    return
  }
  if (assignmentForm.effectiveTo && assignmentForm.effectiveTo < effectiveFrom) {
    assignmentError.value = 'Ngày kết thúc không được nhỏ hơn ngày hiệu lực.'
    return
  }

  try {
    if (assignmentForm.mode === 'template') {
      if (!assignmentForm.templateId) {
        assignmentError.value = 'Vui lòng chọn mẫu lịch.'
        return
      }
      await applyTemplate.mutateAsync({
        employeeIds: assignmentForm.employeeIds,
        templateId: Number(assignmentForm.templateId),
        effectiveFrom: effectiveFrom,
        effectiveTo: assignmentForm.effectiveTo || undefined,
        force: true,
      })
      assignmentSuccess.value = 'Đã áp dụng mẫu lịch thành công.'
    } else {
      const groups: Record<string, number[]> = {}
      let hasSelection = false
      Object.entries(assignmentForm.shiftsPerDay).forEach(([day, shiftId]) => {
        if (shiftId) {
          if (!groups[shiftId]) groups[shiftId] = []
          groups[shiftId].push(Number(day))
          hasSelection = true
        }
      })

      if (!hasSelection) {
        assignmentError.value = 'Vui lòng chọn ít nhất một ca làm việc cho một ngày.'
        return
      }

      const promises = Object.entries(groups).map(([shiftId, days]) => 
        bulkAssign.mutateAsync({
          employeeIds: assignmentForm.employeeIds,
          shiftId: Number(shiftId),
          daysOfWeek: days,
          effectiveFrom: effectiveFrom,
          effectiveTo: assignmentForm.effectiveTo || undefined,
          force: true,
        })
      )
      
      await Promise.all(promises)
      assignmentSuccess.value = 'Đã gán lịch làm việc thành công.'
    }

    await assignedSchedulesQuery.refetch()

    setTimeout(() => {
      isAssignDialogOpen.value = false
      resetAssignmentForm()
      assignmentSuccess.value = ''
    }, 1200)
  } catch (err) {
    assignmentError.value = getApiErrorMessage(err, 'Thao tác thất bại. Vui lòng thử lại.')
    toast.error(assignmentError.value)
  }
}

const requestDeleteSchedule = (schedule: ScheduleWithShift) => {
  deleteTarget.value = schedule
  deleteDialogOpen.value = true
}

const confirmDeleteSchedule = async () => {
  if (!deleteTarget.value) return
  assignmentError.value = ''
  try {
    await deleteSchedule.mutateAsync(deleteTarget.value.id)
    await assignedSchedulesQuery.refetch()
    deleteDialogOpen.value = false
    deleteTarget.value = null
    toast.success('Đã xóa lịch làm việc thành công.')
  } catch (err) {
    toast.error(getApiErrorMessage(err, 'Không thể xóa lịch làm việc.'))
  }
}
</script>

<template>
  <div class="space-y-6 px-6 py-6 font-bold">
    <PageHeader
      title="Phân công lịch làm việc"
      description="Tìm kiếm, quản lý và gán ca làm việc cho nhân viên."
    >
      <template #actions>
        <div class="flex items-center gap-3">
          <button
            @click="isAssignDialogOpen = true"
            class="h-10 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold  text-white shadow-lg shadow-primary/20 hover:bg-primary transition-all dark:shadow-none"
          >
            <CalendarRange class="h-4 w-4" />
            Gán lịch mới
          </button>
          <RouterLink
            to="/schedule"
            class="h-10 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold  text-primary-text transition-colors hover:bg-muted dark:border-border dark:bg-card dark:text-tertiary-text dark:hover:bg-elevated"
          >
            <ArrowLeft class="h-4 w-4" />
            Quay lại
          </RouterLink>
        </div>
      </template>
    </PageHeader>
    <FormCard title="Danh sách lịch đã gán" :icon="LayoutGrid">
      <div class="grid gap-3 md:grid-cols-4">
        <input
          v-model="scheduleSearch"
          type="text"
          placeholder="Tìm tên nhân viên, ca làm..."
          class="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm text-primary-text focus:ring-1 focus:ring-primary dark:border-border dark:bg-elevated dark:text-primary-text font-bold"
        />
        <select
          v-model="scheduleEmployeeFilter"
          class="h-10 rounded-lg border border-border bg-muted/30 px-3 text-sm text-primary-text focus:ring-1 focus:ring-primary dark:border-border dark:bg-elevated dark:text-primary-text font-bold"
        >
          <option value="">Tất cả nhân viên</option>
          <option v-for="employee in employees" :key="employee.id" :value="String(employee.id)">
            {{ employee.fullName }}
          </option>
        </select>
        <select
          v-model="scheduleShiftFilter"
          class="h-10 rounded-lg border border-border bg-muted/30 px-3 text-sm text-primary-text focus:ring-1 focus:ring-primary dark:border-border dark:bg-elevated dark:text-primary-text font-bold"
        >
          <option value="">Tất cả ca</option>
          <option v-for="shift in shifts" :key="shift.id" :value="String(shift.id)">
            {{ shift.name || `Ca #${shift.id}` }}
          </option>
        </select>
        <select
          v-model="scheduleDayFilter"
          class="h-10 rounded-lg border border-border bg-muted/30 px-3 text-sm text-primary-text focus:ring-1 focus:ring-primary dark:border-border dark:bg-elevated dark:text-primary-text font-bold"
        >
          <option value="">Tất cả thứ</option>
          <option v-for="option in dayOfWeekOptions" :key="option.value" :value="String(option.value)">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="mt-5 overflow-x-auto rounded-lg border border-border dark:border-border">
        <table class="min-w-full divide-y divide-border dark:divide-slate-700">
          <thead class="bg-muted/50 dark:bg-card">
            <tr>
              <th class="px-4 py-3 text-left text-[11px] font-semibold  tracking-normal text-secondary-text">Nhân viên</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold  tracking-normal text-secondary-text">Ca làm việc</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold  tracking-normal text-secondary-text">Thứ</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold  tracking-normal text-secondary-text">Khoảng hiệu lực</th>
              <th class="px-4 py-3 text-center text-[11px] font-semibold  tracking-normal text-secondary-text">Trạng thái</th>
              <th class="px-4 py-3 text-right text-[11px] font-semibold  tracking-normal text-secondary-text">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border bg-card dark:divide-slate-700 dark:bg-card">
            <tr v-if="assignedSchedulesQuery.isLoading.value">
              <td colspan="6" class="px-4 py-10 text-center text-sm font-bold text-secondary-text ">Đang tải dữ liệu...</td>
            </tr>
            <tr v-else-if="filteredSchedules.length === 0">
              <td colspan="6" class="px-4 py-10 text-center text-sm font-bold text-secondary-text ">Không tìm thấy dữ liệu.</td>
            </tr>
            <tr v-else v-for="schedule in filteredSchedules" :key="schedule.id" class="hover:bg-surface/50 transition-colors">
              <td class="px-4 py-3">
                <div class="text-sm font-semibold text-primary-text  leading-none">{{ getEmployeeName(schedule.employeeId) }}</div>
                <div class="text-[10px] font-semibold text-tertiary-text  mt-1">ID: {{ schedule.employeeId }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-semibold text-primary  leading-none">{{ getShiftName(schedule.shiftId) }}</div>
                <div v-if="schedule.shift" class="text-[10px] font-bold text-tertiary-text mt-1 ">
                  {{ fmtTime(schedule.shift.startTime) }} — {{ fmtTime(schedule.shift.endTime) }}
                </div>
              </td>
              <td class="px-4 py-3">
                <Badge variant="outline" class="h-6 px-2 text-[10px] font-semibold border-primary/20 bg-primary/10 text-primary rounded ">
                  {{ formatDayOfWeekLabel(schedule.dayOfWeek) }}
                </Badge>
              </td>
              <td class="px-4 py-3 text-xs font-semibold text-secondary-text ">{{ formatEffectiveRange(schedule) }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="[
                  'inline-flex h-6 items-center rounded px-2 text-[9px] font-semibold  tracking-normal',
                  schedule.isActive === false ? 'bg-muted text-tertiary-text' : 'bg-emerald-50 text-emerald-600'
                ]">
                  {{ schedule.isActive === false ? 'OFF' : 'ACTIVE' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <button @click="requestDeleteSchedule(schedule)" class="h-9 w-9 inline-flex items-center justify-center rounded-lg text-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all">
                  <Trash2 class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <div class="text-[10px] font-semibold text-tertiary-text  tracking-normal">
          Trang {{ assignedPageLabel }} / {{ assignedTotalPages }}
        </div>
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="sm" :disabled="assignedPage <= 1" @click="assignedPage--" class="h-9 rounded-lg font-semibold  text-[10px]">Trước</Button>
          <Button variant="ghost" size="sm" :disabled="assignedPage >= assignedTotalPages" @click="assignedPage++" class="h-9 rounded-lg font-semibold  text-[10px]">Sau</Button>
        </div>
      </div>
    </FormCard>

    <DeleteConfirmDialog
      :open="deleteDialogOpen"
      title="Xóa lịch làm việc"
      description="Bạn có chắc chắn muốn xóa lịch đã gán này không?"
      :item-name="deleteTarget ? `${getEmployeeName(deleteTarget.employeeId)} - ${getShiftName(deleteTarget.shiftId)}` : ''"
      @confirm="confirmDeleteSchedule"
      @cancel="deleteDialogOpen = false"
    />

    <!-- Assignment Dialog -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="isAssignDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/40 backdrop-blur-[2px]">
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
          >
            <div v-if="isAssignDialogOpen" class="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg border border-border-standard bg-card shadow-2xl overflow-hidden">
              <!-- Header -->
              <div class="flex items-center justify-between border-b border-border-subtle p-5 bg-card shrink-0">
                <div class="flex items-center gap-4">
                  <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <CalendarRange class="h-5 w-5" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-primary-text  tracking-normal">Thiết lập lịch làm việc mới</h3>
                    <p class="text-[10px] font-semibold text-tertiary-text  tracking-normal mt-0.5">Phân công ca làm chi tiết theo từng thứ trong tuần</p>
                  </div>
                </div>
                <button
                  @click="!isSubmittingAssignment && (isAssignDialogOpen = false)"
                  :disabled="isSubmittingAssignment"
                  class="h-8 w-8 flex items-center justify-center rounded-lg text-tertiary-text hover:text-secondary-text hover:bg-surface transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X class="h-5 w-5" />
                </button>
              </div>

              <!-- Content -->
              <div class="flex-1 overflow-y-auto p-6 space-y-8 min-h-0">
                <!-- Step 1: Mode & Employees -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div class="lg:col-span-1 space-y-6">
                    <div>
                      <label class="text-[11px] font-semibold  tracking-normal text-tertiary-text mb-3 block">1. Phương thức gán</label>
                      <div class="grid grid-cols-2 p-1 bg-muted rounded-lg">
                        <button @click="assignmentForm.mode = 'bulk'" 
                          :class="[
                            'py-2.5 text-[10px] font-semibold  tracking-normal rounded-lg transition-all',
                            assignmentForm.mode === 'bulk' ? 'bg-card text-primary shadow-sm' : 'text-tertiary-text hover:text-secondary-text'
                          ]">Tùy chỉnh tuần</button>
                        <button @click="assignmentForm.mode = 'template'" 
                          :class="[
                            'py-2.5 text-[10px] font-semibold  tracking-normal rounded-lg transition-all',
                            assignmentForm.mode === 'template' ? 'bg-card text-primary shadow-sm' : 'text-tertiary-text hover:text-secondary-text'
                          ]">Theo mẫu lịch</button>
                      </div>
                    </div>

                    <div class="space-y-3">
                      <label class="text-[11px] font-semibold  tracking-normal text-tertiary-text block">2. Khoảng hiệu lực</label>
                      <div class="relative">
                        <CalendarIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary-text" />
                        <input v-model="assignmentForm.effectiveFrom" type="date" :min="todayInput"
                          class="h-11 w-full pl-10 rounded-lg border border-border-subtle bg-surface text-sm font-semibold text-primary-text focus:ring-1 focus:ring-primary outline-none" />
                      </div>
                      <div class="relative">
                        <CalendarIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary-text" />
                        <input
                          v-model="assignmentForm.effectiveTo"
                          type="date"
                          :min="assignmentForm.effectiveFrom || todayInput"
                          class="h-11 w-full pl-10 rounded-lg border border-border-subtle bg-surface text-sm font-semibold text-primary-text focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                      <p class="text-[10px] font-semibold text-tertiary-text tracking-normal">
                        Để trống ngày kết thúc nếu lịch có hiệu lực vô thời hạn.
                      </p>
                    </div>
                  </div>

                  <div class="lg:col-span-2 space-y-4">
                    <div class="flex items-center justify-between">
                      <label class="text-[11px] font-semibold  tracking-normal text-tertiary-text">3. Chọn nhân viên ({{ assignmentForm.employeeIds.length }} đã chọn)</label>
                      <button v-if="assignmentForm.employeeIds.length > 0" @click="assignmentForm.employeeIds = []" class="text-[10px] font-semibold text-rose-500  hover:underline tracking-normal">Bỏ chọn tất cả</button>
                    </div>
                    <div class="relative">
                      <input v-model="employeeSearch" type="text" placeholder="Tìm tên hoặc mã nhân viên..."
                        class="h-11 w-full rounded-lg border border-border-subtle bg-surface px-4 text-sm font-semibold text-primary-text placeholder:text-tertiary-text focus:ring-1 focus:ring-primary outline-none" />
                      
                      <div class="mt-3 flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 border border-border-subtle rounded-lg bg-surface/50">
                        <div v-if="filteredEmployees.length === 0" class="w-full text-center py-6">
                           <p class="text-xs font-semibold text-tertiary-text  tracking-normal">Không tìm thấy dữ liệu</p>
                        </div>
                        <button v-for="emp in filteredEmployees" :key="emp.id" @click="toggleEmployee(emp.id)"
                          :class="[
                            'px-3 py-2.5 rounded-lg text-[10px] font-semibold  tracking-normal transition-all border flex items-center gap-2',
                            assignmentForm.employeeIds.includes(emp.id)
                              ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20'
                              : 'bg-card border-border-subtle text-secondary-text hover:border-primary/20'
                          ]">
                          <Check v-if="assignmentForm.employeeIds.includes(emp.id)" class="h-3 w-3" />
                          {{ emp.fullName }} ({{ emp.employeeCode || emp.id }})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Step 2: Shift Configuration -->
                <div v-if="assignmentForm.mode === 'bulk'" class="space-y-6 pt-6 border-t border-border-subtle">
                   <div class="flex items-center justify-between">
                      <label class="text-[11px] font-semibold  tracking-normal text-tertiary-text">4. Thiết lập ca làm việc hàng tuần</label>
                      <div class="flex gap-2">
                         <Button variant="outline" size="sm" @click="setQuickShifts([1,2,3,4,5], assignmentForm.shiftId)" 
                           class="h-8 text-[10px] font-semibold  tracking-normal rounded-lg border-primary/20 text-primary hover:bg-primary/10 px-3"
                           v-if="assignmentForm.shiftId">Gán T2-T6</Button>
                         <Button variant="outline" size="sm" @click="setQuickShifts([1,2,3,4,5,6,7], assignmentForm.shiftId)" 
                           class="h-8 text-[10px] font-semibold  tracking-normal rounded-lg border-primary/20 text-primary hover:bg-primary/10 px-3"
                           v-if="assignmentForm.shiftId">Gán cả tuần</Button>
                      </div>
                   </div>

                   <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                      <div v-for="day in dayOfWeekOptions" :key="day.value" 
                        class="p-4 rounded-lg border transition-all"
                        :class="assignmentForm.shiftsPerDay[day.value] ? 'border-primary/20 bg-primary/10' : 'border-border-subtle bg-surface/20'">
                        <div class="flex items-center justify-between mb-3">
                           <span class="text-xs font-semibold text-primary-text  tracking-normal">{{ day.label }}</span>
                           <div v-if="assignmentForm.shiftsPerDay[day.value]" class="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                              <Check class="h-2.5 w-2.5 text-white" />
                           </div>
                        </div>
                        <select v-model="assignmentForm.shiftsPerDay[day.value]"
                          class="w-full bg-card rounded-lg border border-border-subtle p-2 text-xs font-semibold text-primary-text outline-none focus:ring-1 focus:ring-primary ">
                          <option value="">Nghỉ</option>
                          <option v-for="shift in shifts" :key="shift.id" :value="String(shift.id)">
                            {{ shift.name }}
                          </option>
                        </select>
                      </div>
                   </div>
                   
                   <div class="flex items-center gap-4 p-5 bg-surface rounded-lg border border-border-subtle/50">
                      <div class="h-10 w-10 rounded-lg bg-card flex items-center justify-center text-tertiary-text border border-border-subtle shadow-sm shrink-0">
                        <Info class="h-5 w-5" />
                      </div>
                      <div class="flex-1">
                        <p class="text-[10px] font-semibold text-secondary-text  tracking-normal mb-1.5 leading-none">Mẹo gán nhanh hàng tuần</p>
                        <div class="flex items-center gap-3">
                          <p class="text-[10px] font-semibold text-tertiary-text  tracking-normal">Chọn ca mẫu:</p>
                          <select v-model="assignmentForm.shiftId" class="h-8 rounded-lg border-border-subtle text-[10px] font-semibold px-3 outline-none bg-card  tracking-normal">
                            <option value="">Khung giờ mẫu</option>
                            <option v-for="shift in shifts" :key="shift.id" :value="String(shift.id)">{{ shift.name }}</option>
                          </select>
                        </div>
                      </div>
                   </div>
                </div>

                <div v-else class="space-y-4 pt-6 border-t border-border-subtle">
                  <label class="text-[11px] font-semibold  tracking-normal text-tertiary-text block">4. Chọn mẫu lịch chuẩn</label>
                  <select v-model="assignmentForm.templateId"
                    class="h-12 w-full rounded-lg border border-border-subtle bg-surface px-4 text-sm font-semibold text-primary-text focus:ring-1 focus:ring-primary outline-none  tracking-normal">
                    <option value="">Chọn mẫu từ danh sách lưu sẵn</option>
                    <option v-for="tpl in templatesQuery.data.value" :key="tpl.id" :value="String(tpl.id)">
                      {{ tpl.name }} ({{ tpl.items.length }} ngày phân ca)
                    </option>
                  </select>                 
                </div>
              </div>

              <!-- Footer -->
              <div class="border-t border-border-subtle p-6 bg-card shrink-0 flex items-center justify-end gap-4">
                <div v-if="isSubmittingAssignment" class="mr-auto flex items-center gap-2 text-[11px] font-semibold text-primary">
                  <Loader2 class="h-4 w-4 animate-spin" />
                  Đang lưu lịch và làm mới danh sách...
                </div>

                <Button variant="ghost" @click="isAssignDialogOpen = false"
                  :disabled="isSubmittingAssignment"
                  class="h-11 px-8 rounded-lg text-[11px] font-semibold  tracking-normal text-tertiary-text hover:bg-surface hover:text-secondary-text transition-all">Hủy bỏ</Button>
                
                <Button @click="submitAssignment" 
                  :disabled="isSubmittingAssignment"
                  class="h-12 px-12 rounded-lg bg-primary text-white text-[11px] font-semibold  tracking-normal shadow-2xl shadow-primary/20 hover:bg-primary hover:-translate-y-0.5 transition-all">
                  <Loader2 v-if="isSubmittingAssignment" class="mr-2 h-4 w-4 animate-spin" />
                  {{ isSubmittingAssignment ? 'Đang thiết lập...' : 'Xác nhận thiết lập' }}
                </Button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
