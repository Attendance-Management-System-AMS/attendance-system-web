<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import {
  CalendarIcon,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  LayoutGrid,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'
import FormCard from '@/components/ui/FormCard.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useEmployees } from '@/composables/useEmployees'
import { useSchedules } from '@/composables/useSchedules'
import { useShifts } from '@/composables/useShifts'
import { useDepartments } from '@/composables/useDepartments'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import { scheduleApi } from '@/services/schedule.service'
import type { Schedule } from '@/types/schedule'
import type { Shift } from '@/types/shift'
import type { Employee } from '@/types/employee'
import type { Page } from '@/types/api'

interface ScheduleWithShift extends Schedule {
  shift?: Shift
}

// Composables
const { employeesQuery } = useEmployees()
const { shiftsQuery } = useShifts()
const { departmentsQuery } = useDepartments()

// No employee filter - show all
const {
  schedulesQuery,
  createSchedule,
  deleteSchedule,
} = useSchedules(null)

const employees = computed(() => employeesQuery.data.value ?? [])
const shifts = computed(() => shiftsQuery.data.value ?? [])
const schedules = computed(() => schedulesQuery.data.value ?? [])
const departments = computed(() => departmentsQuery.data.value ?? [])

// View and pagination
const viewMode = ref<'week' | 'month'>('week')
const currentDate = ref(new Date())
const itemsPerPage = 20
const currentPage = ref(1)
const searchQuery = ref('')
const filterDepartment = ref('')
const filterShift = ref('')

// Detail panel
const selectedEmployeeId = ref<number | null>(null)
const isDetailPanelOpen = computed(() => selectedEmployeeId.value !== null)

const assignmentSectionRef = ref<HTMLElement | null>(null)
const assignmentError = ref('')
const assignmentSuccess = ref('')
const deleteDialogOpen = ref(false)
const deleteTarget = ref<ScheduleWithShift | null>(null)

const assignmentForm = reactive({
  employeeId: '',
  shiftId: '',
  dayOfWeek: '2',
  effectiveFrom: '',
  isActive: true,
})

// Utilities for date operations
const addDays = (date: Date, days: number): Date => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const startOfWeekMonday = (date: Date): Date => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  return d
}

const startOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

const daysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

const fmtYmd = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const fmtDayLabel = (date: Date): string =>
  new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date).replace('.', '')

const fmtLongDate = (date: Date): string =>
  new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)

const fmtMonthYear = (date: Date): string =>
  new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(date)

const fmtTime = (time: string): string => {
  if (!time) return '-'
  return time.substring(0, 5)
}

const fmtDateInput = (value?: string): string => {
  const normalized = normalizeYmd(value)
  return normalized ?? '—'
}

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
    case 2:
      return 'Thứ 2'
    case 3:
      return 'Thứ 3'
    case 4:
      return 'Thứ 4'
    case 5:
      return 'Thứ 5'
    case 6:
      return 'Thứ 6'
    case 7:
      return 'Thứ 7'
    case 8:
      return 'Chủ nhật'
    default:
      return '—'
  }
}

const dayOfWeekOptions = [
  { label: 'Thứ 2', value: '2' },
  { label: 'Thứ 3', value: '3' },
  { label: 'Thứ 4', value: '4' },
  { label: 'Thứ 5', value: '5' },
  { label: 'Thứ 6', value: '6' },
  { label: 'Thứ 7', value: '7' },
  { label: 'Chủ nhật', value: '8' },
]

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

    const totalElements = typeof pageResult.totalElements === 'number'
      ? pageResult.totalElements
      : typeof pageResult.total === 'number'
        ? pageResult.total
        : items.length

    const totalPages = typeof pageResult.totalPages === 'number'
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
  enabled: false,
  staleTime: 1000 * 30,
})

const scheduleList = computed(() => assignedSchedulesQuery.data.value?.items ?? [])

watch([scheduleEmployeeFilter, scheduleShiftFilter, scheduleDayFilter, scheduleSearch], () => {
  assignedPage.value = 1
})

const assignedTotalPages = computed(() => Math.max(1, assignedSchedulesQuery.data.value?.totalPages ?? 1))
const assignedTotalElements = computed(() => assignedSchedulesQuery.data.value?.totalElements ?? 0)
const assignedPageLabel = computed(() => (assignedSchedulesQuery.data.value?.page ?? 0) + 1)

const filteredSchedules = computed(() => {
  return scheduleList.value.map((schedule) => ({
    ...schedule,
    shift: shifts.value.find((s) => String(s.id) === String(schedule.shiftId)),
  }))
})

const resetAssignmentForm = () => {
  assignmentForm.employeeId = ''
  assignmentForm.shiftId = ''
  assignmentForm.dayOfWeek = '2'
  assignmentForm.effectiveFrom = ''
  assignmentForm.isActive = true
}

const scrollToAssignmentForm = () => {
  assignmentSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const submitAssignment = async () => {
  assignmentError.value = ''
  assignmentSuccess.value = ''

  if (!assignmentForm.employeeId || !assignmentForm.shiftId || !assignmentForm.dayOfWeek || !assignmentForm.effectiveFrom) {
    assignmentError.value = 'Vui lòng chọn đầy đủ nhân viên, ca, thứ và ngày hiệu lực.'
    return
  }

  try {
    await createSchedule.mutateAsync({
      employeeId: Number(assignmentForm.employeeId),
      shiftId: Number(assignmentForm.shiftId),
      dayOfWeek: Number(assignmentForm.dayOfWeek),
      effectiveFrom: assignmentForm.effectiveFrom,
      isActive: assignmentForm.isActive,
    })
    await assignedSchedulesQuery.refetch()
    assignmentSuccess.value = 'Đã gán lịch làm việc thành công.'
    resetAssignmentForm()
  } catch (err) {
    assignmentError.value = getApiErrorMessage(err, 'Không thể gán lịch làm việc. Vui lòng thử lại.')
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
    assignmentSuccess.value = 'Đã xóa lịch làm việc.'
  } catch (err) {
    assignmentError.value = getApiErrorMessage(err, 'Không thể xóa lịch làm việc.')
  }
}

const normalizeYmd = (value?: string): string | null => {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, 10)
}

const getIsoDayOfWeek = (ymd: string): number => {
  const [yearText, monthText, dayText] = ymd.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const parsedDate = new Date(year, month - 1, day)
  const weekday = parsedDate.getDay()
  return weekday === 0 ? 8 : weekday + 1
}

// Week view computation
const weekStart = computed(() => {
  const today = new Date()
  const offset = Math.floor((currentDate.value.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7))
  return addDays(startOfWeekMonday(today), offset * 7)
})

const weekDays = computed(() => {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(weekStart.value, i)
    return {
      ymd: fmtYmd(d),
      dayLabel: fmtDayLabel(d),
      dayNumber: d.getDate(),
      isToday: fmtYmd(d) === fmtYmd(new Date()),
    }
  })
})

const weekRangeLabel = computed(() => {
  const from = weekStart.value
  const to = addDays(weekStart.value, 6)
  const fromStr = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(from)
  const toStr = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(to)
  return `${fromStr} → ${toStr}`
})

const periodLabel = computed(() => (viewMode.value === 'month' ? fmtMonthYear(currentDate.value) : weekRangeLabel.value))

// Enriched schedules with shift info
const enrichedSchedules = computed<ScheduleWithShift[]>(() => {
  return schedules.value.map((schedule) => ({
    ...schedule,
    shift: shifts.value.find((s) => String(s.id) === String(schedule.shiftId)),
  }))
})

// Filter and search employees
const filteredAndPaginatedEmployees = computed(() => {
  let filtered = employees.value

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(e =>
      e.fullName.toLowerCase().includes(q) ||
      e.employeeCode.toLowerCase().includes(q)
    )
  }

  // Department filter
  if (filterDepartment.value) {
    filtered = filtered.filter(e => String(e.departmentId) === filterDepartment.value)
  }

  // Apply pagination
  const startIdx = (currentPage.value - 1) * itemsPerPage
  return filtered.slice(startIdx, startIdx + itemsPerPage)
})

const totalPages = computed(() => {
  let total = employees.value

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    total = total.filter(e =>
      e.fullName.toLowerCase().includes(q) ||
      e.employeeCode.toLowerCase().includes(q)
    )
  }

  if (filterDepartment.value) {
    total = total.filter(e => String(e.departmentId) === filterDepartment.value)
  }

  return Math.ceil(total.length / itemsPerPage)
})

const monthCalendarDays = computed(() => {
  const monthStart = startOfMonth(currentDate.value)
  const monthTotalDays = daysInMonth(monthStart)
  const leadingEmptyDays = monthStart.getDay()
  const totalCells = Math.ceil((leadingEmptyDays + monthTotalDays) / 7) * 7

  return Array.from({ length: totalCells }).map((_, index) => {
    const dayNumber = index - leadingEmptyDays + 1
    if (dayNumber < 1 || dayNumber > monthTotalDays) {
      return null
    }

    const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), dayNumber)
    return {
      ymd: fmtYmd(date),
      dayNumber,
      isToday: fmtYmd(date) === fmtYmd(new Date()),
    }
  })
})

const monthScheduleCountByDate = computed(() => {
  const map = new Map<string, number>()
  for (const day of monthCalendarDays.value) {
    if (!day) continue
    map.set(day.ymd, getSchedulesForDate(day.ymd).length)
  }
  return map
})

const monthActiveDayCount = computed(() => {
  return Array.from(monthScheduleCountByDate.value.values()).filter(count => count > 0).length
})

const getSchedulesForDate = (ymd: string): ScheduleWithShift[] => {
  return enrichedSchedules.value.filter(schedule => appliesToDate(schedule, ymd))
}

const movePeriod = (direction: -1 | 1) => {
  const nextDate = new Date(currentDate.value)
  if (viewMode.value === 'month') {
    nextDate.setMonth(nextDate.getMonth() + direction)
  } else {
    nextDate.setDate(nextDate.getDate() + direction * 7)
  }
  currentDate.value = nextDate
}

const goToToday = () => {
  currentDate.value = new Date()
}

// Check if specific date has schedule for employee
const hasScheduleForDate = (employee: Employee, date: string): boolean => {
  return enrichedSchedules.value.some(s =>
    s.employeeId === employee.id && appliesToDate(s, date)
  )
}

// Get schedules for specific employee and date
const getSchedulesForEmployeeDate = (employee: Employee, date: string): ScheduleWithShift[] => {
  return enrichedSchedules.value.filter(s =>
    s.employeeId === employee.id && appliesToDate(s, date)
  )
}

// Check if schedule applies to date
const appliesToDate = (schedule: Schedule, ymd: string): boolean => {
  if (schedule.isActive === false) return false

  if (schedule.date) {
    return normalizeYmd(schedule.date) === ymd
  }

  const effectiveFrom = normalizeYmd(schedule.effectiveFrom)

  if (!schedule.dayOfWeek || !effectiveFrom) {
    return false
  }

  if (ymd < effectiveFrom) {
    return false
  }

  return schedule.dayOfWeek === getIsoDayOfWeek(ymd)
}

// Shift color mapping
const getShiftColor = (shift?: Shift): 'blue' | 'orange' | 'purple' | 'gray' => {
  if (!shift) return 'gray'
  const name = (shift.name ?? '').toLowerCase()
  if (name.includes('sang') || name.includes('morning')) return 'blue'
  if (name.includes('chieu') || name.includes('afternoon')) return 'orange'
  if (name.includes('toi') || name.includes('night')) return 'purple'
  return 'gray'
}

const shiftColorClasses: Record<'blue' | 'orange' | 'purple' | 'gray', string> = {
  blue: 'bg-blue-100 text-blue-800 border-blue-300',
  orange: 'bg-orange-100 text-orange-800 border-orange-300',
  purple: 'bg-purple-100 text-purple-800 border-purple-300',
  gray: 'bg-gray-100 text-gray-800 border-gray-300',
}

// Department options for filter
const departmentOptions = computed(() => {
  const opts = departments.value.map(d => ({ label: d.name, value: String(d.id) }))
  return opts
})

// Shift options for filter in calendar view
const shiftOptions = computed(() => {
  const opts = shifts.value.map(s => ({ label: s.name || `Shift #${s.id}`, value: String(s.id) }))
  return opts
})

// Selected employee full info
const selectedEmployee = computed(() => {
  if (!selectedEmployeeId.value) return null
  return employees.value.find(e => e.id === selectedEmployeeId.value)
})

// Mini calendar data for detail panel
const miniCalendarDays = computed(() => {
  const monthStart = startOfMonth(currentDate.value)
  const daysCount = daysInMonth(monthStart)
  const startDay = monthStart.getDay()

  const days: (number | null)[] = []
  for (let i = 0; i < startDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysCount; i++) {
    days.push(i)
  }
  return days
})

const getEmployeeAvatarInitials = (employee: Employee): string => {
  return employee.fullName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(-2)
    .join('')
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-950">
    <!-- Toolbar -->
    <div class="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div class="px-6 py-4">
        <div class="flex flex-col gap-4">
          <!-- Title and Breadcrumb -->
          <div class="flex items-center gap-3">
            <CalendarRange class="h-6 w-6 text-blue-600" />
            <div>
              <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Lịch làm việc</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ periodLabel }}</p>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <!-- View mode switcher -->
            <div class="flex items-center gap-2">
              <button @click="viewMode = 'week'" :class="[
                'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                viewMode === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              ]">
                <LayoutGrid class="h-4 w-4" />
                Tuần
              </button>
              <button @click="viewMode = 'month'" :class="[
                'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                viewMode === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              ]">
                <CalendarIcon class="h-4 w-4" />
                Tháng
              </button>
            </div>

            <!-- Filters and Search -->
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <!-- Department filter -->
              <select v-model="filterDepartment"
                class="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500">
                <option value="">Tất cả phòng ban</option>
                <option v-for="dept in departmentOptions" :key="dept.value" :value="dept.value">
                  {{ dept.label }}
                </option>
              </select>

              <!-- Search -->
              <div class="relative">
                <input v-model="searchQuery" type="text" placeholder="Tìm nhân viên..."
                  class="pl-3 pr-3 py-2 rounded-lg border border-slate-300 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 w-40" />
              </div>

              <!-- Assign Shift Button -->
              <RouterLink to="/schedule/assignments"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
                Phân công ca
              </RouterLink>
            </div>
          </div>

          <div
            class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-300">
              {{ viewMode === 'month' ? 'Xem theo tháng' : 'Xem theo tuần' }}
            </p>
            <div class="flex items-center gap-2">
              <button type="button" @click="movePeriod(-1)"
                class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
                <ChevronLeft class="h-4 w-4" />
                Trước
              </button>
              <button type="button" @click="goToToday"
                class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
                Hôm nay
              </button>
              <button type="button" @click="movePeriod(1)"
                class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
                Sau
                <ChevronRight class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="px-6 pt-6">
      <div
        class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Quản lý phân công đã được tách sang trang riêng. Chọn "Phân công ca" để thao tác.
      </div>
    </div>

    <!-- Main content -->
    <div v-show="viewMode === 'week'" class="flex">
      <!-- Schedule Grid -->
      <div class="flex-1 overflow-x-auto">
        <div class="inline-block min-w-full">
          <!-- Table Header -->
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800">
                <!-- Employee column header -->
                <th
                  class="sticky left-0 w-48 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 px-4 py-3 text-left">
                  <div class="text-xs font-bold uppercase tracking-wider text-slate-500">Nhân viên</div>
                </th>

                <!-- Day headers -->
                <th v-for="day in weekDays" :key="day.ymd" :class="[
                  'px-4 py-3 text-center border-r border-slate-200 dark:border-slate-800 min-w-32',
                  day.isToday ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-950'
                ]">
                  <div class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ day.dayLabel }}</div>
                  <div
                    :class="['text-lg font-bold mt-1', day.isToday ? 'text-blue-600' : 'text-slate-900 dark:text-white']">
                    {{ day.dayNumber }}
                  </div>
                  <div v-if="day.isToday" class="text-[10px] text-blue-600 font-semibold mt-1">Hôm nay</div>
                </th>
              </tr>
            </thead>

            <tbody>
              <!-- Employee rows -->
              <tr v-for="employee in filteredAndPaginatedEmployees" :key="employee.id"
                class="border-b border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 dark:border-slate-800 cursor-pointer transition-colors"
                @click="selectedEmployeeId = employee.id">
                <!-- Employee info cell -->
                <td
                  class="sticky left-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 px-4 py-3">
                  <div class="flex items-center gap-3">
                    <Avatar class="h-10 w-10">
                      <AvatarImage :src="`/api/avatar/${employee.id}`" />
                      <AvatarFallback class="bg-blue-600 text-white text-xs font-bold">
                        {{ getEmployeeAvatarInitials(employee) }}
                      </AvatarFallback>
                    </Avatar>
                    <div class="min-w-0">
                      <div class="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {{ employee.fullName }}
                      </div>
                      <div class="text-xs text-slate-500 dark:text-slate-400">
                        {{ employee.departmentName || 'N/A' }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Schedule cells for each day -->
                <td v-for="day in weekDays" :key="day.ymd" :class="[
                  'px-4 py-3 text-center border-r border-slate-200 dark:border-slate-800 align-top min-w-32',
                  day.isToday ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-950'
                ]">
                  <div v-if="getSchedulesForEmployeeDate(employee, day.ymd).length === 0"
                    class="text-xs text-slate-400">
                    Trống
                  </div>
                  <div v-else class="space-y-1">
                    <div v-for="schedule in getSchedulesForEmployeeDate(employee, day.ymd)" :key="schedule.id" :class="[
                      'text-xs font-semibold rounded border',
                      shiftColorClasses[getShiftColor(schedule.shift)]
                    ]">
                      <div class="px-2 py-1.5">
                        <div class="truncate">{{ schedule.shift?.name || 'Ca chưa xác định' }}</div>
                        <div class="text-[10px] opacity-75 mt-0.5">
                          {{ fmtTime(schedule.shift?.startTime || '') }} - {{ fmtTime(schedule.shift?.endTime || '') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="filteredAndPaginatedEmployees.length === 0">
                <td :colspan="weekDays.length + 1" class="px-4 py-8 text-center text-slate-500">
                  Không có nhân viên nào
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-show="viewMode === 'month'" class="px-6 py-6">
      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">Lịch tháng {{ fmtMonthYear(currentDate) }}
              </h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Bấm vào ngày để xem số ca trong ngày đó</p>
            </div>
            <div
              class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
              {{ monthActiveDayCount }} ngày có lịch
            </div>
          </div>
        </div>

        <div class="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800">
          <div v-for="dayName in ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']" :key="dayName"
            class="bg-slate-50 px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-950">
            {{ dayName }}
          </div>

          <template v-if="monthCalendarDays.some(day => day !== null)">
            <template v-for="(day, index) in monthCalendarDays">
              <button v-if="day" :key="day.ymd" type="button" @click="selectedEmployeeId = null" :class="[
                'min-h-36 bg-white p-3 text-left transition-colors hover:bg-blue-50/60 dark:bg-slate-900 dark:hover:bg-slate-800',
                day.isToday ? 'ring-2 ring-inset ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''
              ]">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-bold text-slate-900 dark:text-white">{{ day.dayNumber }}</span>
                  <span v-if="(monthScheduleCountByDate.get(day.ymd) ?? 0) > 0"
                    class="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-white dark:text-slate-900">
                    {{ monthScheduleCountByDate.get(day.ymd) }}
                  </span>
                </div>

                <div class="mt-3 space-y-1.5">
                  <div v-for="schedule in getSchedulesForDate(day.ymd).slice(0, 2)" :key="schedule.id" :class="[
                    'rounded-lg border px-2 py-1 text-[11px] font-semibold',
                    shiftColorClasses[getShiftColor(schedule.shift)]
                  ]">
                    <div class="truncate">{{ schedule.shift?.name ?? 'Ca chưa xác định' }}</div>
                    <div class="mt-0.5 text-[10px] opacity-75">
                      {{ fmtTime(schedule.shift?.startTime || '') }} - {{ fmtTime(schedule.shift?.endTime || '') }}
                    </div>
                  </div>
                  <p v-if="getSchedulesForDate(day.ymd).length === 0" class="text-xs text-slate-400">
                    Không có ca
                  </p>
                </div>
              </button>
              <div v-else :key="`empty-${index}`" class="min-h-36 bg-slate-50 dark:bg-slate-950" />
            </template>
          </template>
          <div v-else class="col-span-7 bg-white px-6 py-10 text-center text-sm text-slate-500 dark:bg-slate-900">
            Không có dữ liệu lịch cho tháng này
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Panel -->
    <div v-if="isDetailPanelOpen" class="fixed inset-0 z-40 bg-slate-900/20" @click="selectedEmployeeId = null" />
    <div v-if="isDetailPanelOpen && selectedEmployee"
      class="fixed inset-y-0 right-0 w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl overflow-y-auto z-50">
      <!-- Header -->
      <div
        class="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">Chi tiết</h2>
        <button type="button" @click="selectedEmployeeId = null" aria-label="Đóng chi tiết" title="Đóng"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
          <X class="h-4 w-4" />
          Đóng
        </button>
      </div>

      <div class="p-6 space-y-6">
        <!-- Employee Info -->
        <div class="text-center">
          <Avatar class="h-20 w-20 mx-auto mb-4">
            <AvatarImage :src="`/api/avatar/${selectedEmployee.id}`" />
            <AvatarFallback class="bg-blue-600 text-white text-2xl font-bold">
              {{ getEmployeeAvatarInitials(selectedEmployee) }}
            </AvatarFallback>
          </Avatar>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ selectedEmployee.fullName }}</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {{ selectedEmployee.employeeCode }}
          </p>
          <p class="text-sm text-slate-500 dark:text-slate-500 mt-2">
            {{ selectedEmployee.departmentName || 'N/A' }}
          </p>
        </div>

        <!-- Mini Calendar -->
        <div class="space-y-3">
          <h4 class="text-sm font-semibold text-slate-900 dark:text-white">Lịch tháng {{ fmtMonthYear(currentDate) }}
          </h4>
          <div class="grid grid-cols-7 gap-1">
            <!-- Day headers -->
            <div v-for="dayName in ['Cn', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']" :key="dayName"
              class="text-xs font-bold text-center text-slate-500 py-2">
              {{ dayName }}
            </div>
            <!-- Days -->
            <div v-for="(day, idx) in miniCalendarDays" :key="idx" :class="[
              'aspect-square flex items-center justify-center text-xs rounded-lg border',
              day === null
                ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                : 'border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900'
            ]">
              {{ day }}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-2">
          <button
            class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            <Edit3 class="h-4 w-4" />
            Chỉnh sửa lịch
          </button>
          <button
            class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Eye class="h-4 w-4" />
            Xem lịch sử
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1"
      class="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="text-sm text-slate-600 dark:text-slate-400">
          Trang {{ currentPage }} của {{ totalPages }}
        </div>
        <div class="flex items-center gap-2">
          <button :disabled="currentPage <= 1" @click="currentPage--"
            class="p-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft class="h-4 w-4" />
          </button>

          <div class="flex gap-1">
            <button v-for="page in totalPages" :key="page" @click="currentPage = page" :class="[
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            ]">
              {{ page }}
            </button>
          </div>

          <button :disabled="currentPage >= totalPages" @click="currentPage++"
            class="p-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
