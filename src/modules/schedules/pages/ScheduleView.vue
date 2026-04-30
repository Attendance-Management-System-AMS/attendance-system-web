<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Plus,
  CalendarDays,
  Users,
  Clock,
  TrendingUp,
} from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { toast } from 'vue-sonner'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import { formatScheduleConflictError } from '@/modules/schedules/utils/scheduleConflictError'

import { useEmployees } from '@/modules/employees/composables/useEmployees'
import { useSchedules } from '@/modules/schedules/composables/useSchedules'
import { useShifts } from '@/modules/schedules/composables/useShifts'
import { useDepartments } from '@/modules/departments/composables/useDepartments'
import type { Schedule } from '@/modules/schedules/types/schedule.types'
import type { Shift } from '@/modules/schedules/types/shift.types'
import type { Employee } from '@/modules/employees/types/employee.types'
import type { Department } from '@/modules/departments/types/department.types'
import type { Page } from '@/shared/types/api'
import StatCard from '@/shared/ui/StatCard.vue'

interface ScheduleWithShift extends Schedule {
  shift?: Shift
}


const { employeesQuery } = useEmployees()
const { shiftsQuery } = useShifts()
const { departmentsQuery } = useDepartments()
const { schedulesQuery, deleteSchedule, createSchedule, updateSchedule } = useSchedules(null, { size: 1000 })

const employees = computed<Employee[]>(() => employeesQuery.data.value?.content ?? [])
const shifts = computed<Shift[]>(() => (shiftsQuery.data.value ?? []) as Shift[])
const schedules = computed<Schedule[]>(() => schedulesQuery.data.value ?? [])
const departments = computed<Department[]>(() => {
  const data = departmentsQuery.data.value as Page<Department> | undefined
  return data?.content ?? []
})

const currentDate = ref(new Date())
const itemsPerPage = 20
const currentPage = ref(1)
const searchQuery = ref('')
const filterDepartment = ref('')

// Quick Action Modal State
const actionModalOpen = ref(false)
const actionTarget = ref<{ schedule?: ScheduleWithShift, employee: Employee, date: string, mode: 'edit' | 'create' } | null>(null)
const actionShiftId = ref('')
const isActionLoading = ref(false)

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

const fmtYmd = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const fmtDayLabel = (date: Date): string =>
  new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date).replace('.', '')

const toBackendDayOfWeek = (date: Date): number => {
  const weekday = date.getDay()
  return weekday === 0 ? 7 : weekday
}

const weekStart = computed(() => startOfWeekMonday(currentDate.value))
const weekDays = computed(() => {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(weekStart.value, i)
    return {
      ymd: fmtYmd(d),
      dayLabel: fmtDayLabel(d),
      dayNumber: d.getDate(),
      isToday: fmtYmd(d) === fmtYmd(new Date()),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    }
  })
})

const weekRangeLabel = computed(() => {
  const from = weekStart.value
  const to = addDays(weekStart.value, 6)
  return `${from.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} — ${to.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`
})

const enrichedSchedules = computed<ScheduleWithShift[]>(() => {
  return schedules.value.map((schedule: Schedule) => ({
    ...schedule,
    shift: shifts.value.find((s: Shift) => String(s.id) === String(schedule.shiftId)),
  }))
})

const minutesFromTime = (value?: string): number | null => {
  if (!value) return null
  const [hourText, minuteText] = value.split(':')
  const hour = Number(hourText)
  const minute = Number(minuteText)
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null
  return hour * 60 + minute
}

const shiftDurationMinutes = (shift?: Shift): number => {
  const start = minutesFromTime(shift?.startTime)
  let end = minutesFromTime(shift?.endTime)
  if (start == null || end == null) return 0
  if (end < start) end += 24 * 60
  return Math.max(end - start, 0)
}

const formatHours = (minutes: number) => {
  const hours = Math.round(minutes / 60)
  return `${new Intl.NumberFormat('vi-VN').format(hours)}h`
}

const scheduleStats = computed(() => {
  const activeSchedules = enrichedSchedules.value.filter((schedule) => schedule.isActive !== false)
  const scheduledEmployeeIds = new Set(activeSchedules.map((schedule) => schedule.employeeId))
  const expectedMinutes = activeSchedules.reduce(
    (total, schedule) => total + shiftDurationMinutes(schedule.shift),
    0,
  )

  return [
    { label: 'Tổng lịch', value: activeSchedules.length, icon: CalendarDays, color: 'indigo' },
    { label: 'Nhân viên', value: scheduledEmployeeIds.size, icon: Users, color: 'emerald' },
    { label: 'Giờ công', value: formatHours(expectedMinutes), icon: Clock, color: 'amber' },
    { label: 'Ca làm', value: shifts.value.length, icon: TrendingUp, color: 'rose' },
  ]
})

const filteredEmployees = computed(() => {
  let filtered = employees.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (e: Employee) =>
        e.fullName.toLowerCase().includes(q) || e.employeeCode.toLowerCase().includes(q),
    )
  }
  if (filterDepartment.value) {
    filtered = filtered.filter((e: Employee) => String(e.departmentId) === filterDepartment.value)
  }
  return filtered
})

const paginatedEmployees = computed(() => {
  const startIdx = (currentPage.value - 1) * itemsPerPage
  return filteredEmployees.value.slice(startIdx, startIdx + itemsPerPage)
})

const totalPagesCount = computed(() => Math.ceil(filteredEmployees.value.length / itemsPerPage))

const movePeriod = (direction: -1 | 1) => {
  const nextDate = new Date(currentDate.value)
  nextDate.setDate(nextDate.getDate() + direction * 7)
  currentDate.value = nextDate
}

const normalizeYmd = (value?: string): string | null => {
  if (!value) return null
  return value.trim().slice(0, 10)
}

const todayYmd = () => fmtYmd(new Date())

const isPastYmd = (value?: string | null): boolean => {
  const normalized = normalizeYmd(value ?? undefined)
  if (!normalized) return false
  return normalized < todayYmd()
}

const pastActionMessage = (mode: 'edit' | 'create'): string =>
  mode === 'edit'
    ? 'Không thể chỉnh sửa ca làm cho ngày trong quá khứ.'
    : 'Không thể phân ca nhanh cho ngày trong quá khứ.'

const previousDateYmd = (value: string): string => {
  const baseDate = new Date(`${value}T00:00:00`)
  baseDate.setDate(baseDate.getDate() - 1)
  return fmtYmd(baseDate)
}

const appliesToDate = (schedule: Schedule, ymd: string): boolean => {
  if (schedule.isActive === false) return false
  const currentDateStr = ymd.slice(0, 10)
  if (schedule.date) return normalizeYmd(schedule.date) === currentDateStr

  const effectiveFromStr = normalizeYmd(schedule.effectiveFrom)
  const effectiveToStr = normalizeYmd(schedule.effectiveTo ?? undefined)
  if (schedule.dayOfWeek === undefined || schedule.dayOfWeek === null || !effectiveFromStr)
    return false
  if (currentDateStr < effectiveFromStr) return false
  if (effectiveToStr && currentDateStr > effectiveToStr) return false

  const parsedDate = new Date(ymd)

  const currentDayOfWeek = toBackendDayOfWeek(parsedDate)
  return Number(schedule.dayOfWeek) === Number(currentDayOfWeek)
}

// Quick Action Modal Logic
const openEditDialog = (schedule: ScheduleWithShift, employee: Employee, date: string) => {
  actionTarget.value = { schedule, employee, date, mode: 'edit' }
  actionShiftId.value = String(schedule.shiftId)
  actionModalOpen.value = true
}

const openCreateDialog = (employee: Employee, date: string) => {
  if (isPastYmd(date)) {
    return
  }
  actionTarget.value = { employee, date, mode: 'create' }
  actionShiftId.value = ''
  actionModalOpen.value = true
}

const closeActionModal = () => {
  actionModalOpen.value = false
  actionTarget.value = null
  actionShiftId.value = ''
}

const handleActionSubmit = async () => {
  if (!actionTarget.value || !actionShiftId.value) return
  isActionLoading.value = true
  try {
    const { mode, schedule, employee, date } = actionTarget.value

    if (isPastYmd(date)) {
      toast.error(pastActionMessage(mode))
      return
    }
    
    if (mode === 'edit' && schedule) {
      const selectedShiftId = Number(actionShiftId.value)
      const scheduleEffectiveFrom = normalizeYmd(schedule.effectiveFrom)
      const scheduleEffectiveTo = normalizeYmd(schedule.effectiveTo ?? undefined)
      const shouldSplitSchedule =
        !!scheduleEffectiveFrom && scheduleEffectiveFrom < date

      if (shouldSplitSchedule) {
        await updateSchedule.mutateAsync({
          id: schedule.id,
          data: {
            effectiveTo: previousDateYmd(date),
            force: true,
          }
        })

        await createSchedule.mutateAsync({
          employeeId: employee.id,
          shiftId: selectedShiftId,
          dayOfWeek: Number(schedule.dayOfWeek),
          effectiveFrom: date,
          effectiveTo: scheduleEffectiveTo ?? undefined,
          isActive: schedule.isActive ?? true,
          force: true,
        })
      } else {
        // Sử dụng API Update nguyên tử khi lịch chưa đi vào quá khứ
        await updateSchedule.mutateAsync({
          id: schedule.id,
          data: {
            shiftId: selectedShiftId,
            force: true
          }
        })
      }
    } else {
      // Tính dayOfWeek từ ngày
      const d = new Date(date)
      const weekday = d.getDay()
      const dayOfWeek = weekday === 0 ? 7 : weekday

      // Tạo ca mới
      await createSchedule.mutateAsync({
        employeeId: employee.id,
        shiftId: Number(actionShiftId.value),
        dayOfWeek,
        effectiveFrom: date,
        isActive: true,
        force: true // Cho phép ghi đè nếu trùng giờ (vì người dùng chủ động chọn)
      })
    }

    toast.success(mode === 'edit' ? 'Đã cập nhật ca làm việc' : 'Đã phân ca thành công')
    closeActionModal()
  } catch (err: unknown) {
    toast.error(formatScheduleConflictError(err, 'Xung đột') ?? getApiErrorMessage(err, 'Thao tác thất bại'))
  } finally {
    isActionLoading.value = false
  }
}

const handleActionDelete = async () => {
  if (!actionTarget.value || !actionTarget.value.schedule) return
  isActionLoading.value = true
  try {
    await deleteSchedule.mutateAsync(actionTarget.value.schedule.id)
    toast.success('Đã xóa ca làm việc')
    closeActionModal()
  } catch (err) {
    toast.error(getApiErrorMessage(err, 'Không thể xóa ca làm việc'))
  } finally {
    isActionLoading.value = false
  }
}

const getSchedulesForEmployeeDate = (employee: Employee, date: string): ScheduleWithShift[] => {
  const matchingSchedules = enrichedSchedules.value.filter(
    (s) => String(s.employeeId) === String(employee.id) && appliesToDate(s, date),
  )

  if (matchingSchedules.length === 0) return []

  const latestEffectiveFrom = matchingSchedules
    .map((schedule) => normalizeYmd(schedule.effectiveFrom) ?? '')
    .sort()
    .slice(-1)[0]

  if (!latestEffectiveFrom) return matchingSchedules

  return matchingSchedules.filter(
    (schedule) => normalizeYmd(schedule.effectiveFrom) === latestEffectiveFrom,
  )
}

const getShiftBadgeStyle = (shiftName?: string) => {
  const name = (shiftName ?? '').toLowerCase()
  if (name.includes('hành chính')) return 'bg-primary/10 text-primary border-primary/20'
  if (name.includes('sáng')) return 'bg-emerald-50 text-emerald-600 border-emerald-100'
  if (name.includes('chiều')) return 'bg-amber-50 text-amber-600 border-amber-100'
  if (name.includes('đêm')) return 'bg-violet-50 text-violet-600 border-violet-100'
  return 'bg-surface text-secondary-text border-border-subtle'
}

const isReadOnlyPastAction = computed(() =>
  actionTarget.value ? isPastYmd(actionTarget.value.date) : false,
)
</script>

<template>
  <div class="space-y-6 p-4 sm:p-6">
    <PageHeader
      title="Lịch làm việc"
      description="Quản lý phân công ca hàng tuần • Hệ thống thời gian thực"
    >
      <template #actions>
        <div class="flex flex-wrap items-center gap-4">
          <!-- Date Navigator -->
          <div class="flex items-center bg-card rounded-lg border border-border p-1 shadow-none dark:bg-card dark:border-border">
            <Button
              variant="ghost"
              size="icon"
              @click="movePeriod(-1)"
              class="h-9 w-9 hover:bg-muted dark:hover:bg-elevated"
            >
              <ChevronLeft class="h-4 w-4" />
            </Button>

            <div class="px-6 flex flex-col items-center min-w-45 border-x border-border dark:border-border">
              <span class="text-sm font-semibold text-primary tabular-nums tracking-normal">{{
                weekRangeLabel
              }}</span>
              <button
                @click="currentDate = new Date()"
                class="text-[9px] font-bold  tracking-normal text-tertiary-text hover:text-primary transition-colors"
              >
                Tuần hiện tại
              </button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              @click="movePeriod(1)"
              class="h-9 w-9 hover:bg-surface dark:hover:bg-elevated"
            >
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>

          <Button
            as-child
            class="h-11 px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-semibold tracking-normal text-[11px] rounded-lg gap-2 text-primary-foreground"
          >
            <RouterLink to="/schedule/assignments">
              <Plus class="h-4 w-4" /> Phân công ca
            </RouterLink>
          </Button>
        </div>
      </template>
    </PageHeader>
    <!-- Stats Section -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <StatCard
        v-for="s in scheduleStats"
        :key="s.label"
        :label="s.label"
        :value="s.value"
        :icon="s.icon"
        :color="(s.color as any)"
      />
    </div>

    <!-- Filter & Search Bar -->
    <div
      class="flex flex-wrap items-center justify-between gap-4 p-5 bg-card rounded-lg border border-border"
    >
      <div class="flex flex-wrap items-center gap-4">
        <div class="relative group w-full sm:w-64">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary-text group-focus-within:text-primary transition-colors"
          />
          <input
            v-model="searchQuery"
            placeholder="Tìm tên hoặc mã nhân viên..."
            class="h-10 pl-10 pr-4 rounded-lg border border-border-subtle bg-card text-xs font-bold text-primary-text outline-none focus:ring-1 focus:ring-primary transition-all w-full"
          />
        </div>
        <select
          v-model="filterDepartment"
          class="h-10 rounded-lg border border-border-subtle bg-card px-4 text-xs font-bold text-primary-text outline-none focus:ring-1 focus:ring-primary transition-all"
        >
          <option value="">Tất cả phòng ban</option>
          <option v-for="d in departments" :key="d.id" :value="String(d.id)">{{ d.name }}</option>
        </select>
      </div>
    </div>

    <!-- Table Section -->
    <Card class="overflow-hidden border-border shadow-none rounded-lg bg-card">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-border">
              <th
                class="sticky left-0 z-20 w-64 bg-card border-r border-border px-6 py-5 text-left"
              >
                <span class="text-[10px] font-semibold  tracking-normal text-tertiary-text"
                  >Nhân viên</span
                >
              </th>
              <th
                v-for="day in weekDays"
                :key="day.ymd"
                :class="[
                  'px-4 py-4 text-center border-r border-border min-w-37.5',
                  day.isToday ? 'bg-muted/50' : '',
                ]"
              >
                <div class="flex flex-col items-center">
                  <span
                    class="text-[10px] font-semibold  tracking-normal"
                    :class="day.isToday ? 'text-primary' : 'text-tertiary-text'"
                    >{{ day.dayLabel }}</span
                  >
                  <span
                    class="text-xl font-semibold mt-1"
                    :class="day.isToday ? 'text-primary' : 'text-primary-text'"
                    >{{ day.dayNumber }}</span
                  >
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="employee in paginatedEmployees"
              :key="employee.id"
              class="group hover:bg-surface/50 transition-colors"
            >
              <td class="sticky left-0 z-10 bg-card border-r border-border px-6 py-5">
                <div class="flex items-center gap-4">
                  <Avatar class="h-10 w-10 border border-border-subtle shadow-sm">
                    <AvatarImage v-if="employee.avatarUrl" :src="employee.avatarUrl" />
                    <AvatarFallback class="bg-surface text-tertiary-text text-[11px] font-semibold">
                      {{
                        employee.fullName
                          .split(' ')
                          .map((n: string) => n[0])
                          .slice(-2)
                          .join('')
                          .toUpperCase()
                      }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="min-w-0">
                    <p
                      class="text-sm font-semibold text-primary-text truncate group-hover:text-primary transition-colors leading-none"
                    >
                      {{ employee.fullName }}
                    </p>
                    <p class="text-[10px] text-tertiary-text font-medium leading-relaxed">
                      {{ employee.departmentName || 'Phòng ban tự do' }}
                    </p>
                  </div>
                </div>
              </td>
              <td
                v-for="day in weekDays"
                :key="day.ymd"
                class="relative px-3 py-5 align-top border-r border-border text-center group"
                :class="day.isToday ? 'bg-muted/50' : ''"
              >
                <div class="space-y-2 flex flex-col items-center">
                  <div
                    v-for="s in getSchedulesForEmployeeDate(employee, day.ymd)"
                    :key="s.id"
                    @click.stop="openEditDialog(s, employee, day.ymd)"
                    class="w-full text-[10px] font-semibold p-2.5 rounded-lg border text-center transition-all shadow-sm group-hover:shadow-md cursor-pointer hover:scale-[1.02]"
                    :class="getShiftBadgeStyle(s.shift?.name)"
                  >
                    <p class=" tracking-normal leading-none mb-1.5">{{ s.shift?.name }}</p>
                    <p class="font-mono text-[9px] opacity-70">
                      {{ s.shift?.startTime?.slice(0, 5) }} - {{ s.shift?.endTime?.slice(0, 5) }}
                    </p>
                  </div>
                </div>

                <!-- Quick add button -->
                <button
                  v-if="!isPastYmd(day.ymd)"
                  @click.stop="openCreateDialog(employee, day.ymd)"
                  class="absolute inset-0 m-auto h-6 w-6 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-primary hover:text-white"
                >
                  <Plus class="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- Pagination Section -->
    <div
      v-if="totalPagesCount > 1"
      class="flex justify-between items-center bg-card p-5 rounded-lg border border-border shadow-none"
    >
      <span class="text-[10px] font-semibold text-tertiary-text  tracking-normal"
        >Trang {{ currentPage }} / {{ totalPagesCount }}</span
      >
      <div class="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="currentPage--"
          class="h-10 px-6 rounded-lg font-semibold  text-[10px]"
          >Trước</Button
        >
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === totalPagesCount"
          @click="currentPage++"
          class="h-10 px-6 rounded-lg font-semibold  text-[10px]"
          >Sau</Button
        >
      </div>
    </div>

    <!-- Quick Action Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="actionModalOpen"
          class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-card/40 backdrop-blur-[2px]"
          @click.self="!isActionLoading && closeActionModal()"
        >
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
          >
            <div v-if="actionModalOpen" class="relative w-full max-w-sm rounded-lg border border-border-subtle bg-card shadow-2xl p-6">
              <button
                type="button"
                class="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-tertiary-text transition-colors hover:bg-muted hover:text-primary-text"
                :disabled="isActionLoading"
                @click="closeActionModal"
              >
                <X class="h-4 w-4" />
              </button>

              <h3 class="text-lg font-semibold mb-4 pr-10">{{ actionTarget?.mode === 'edit' ? 'Chi tiết ca làm' : 'Phân ca nhanh' }}</h3>
              
              <div class="space-y-4">
                <div>
                  <p class="text-[10px] text-tertiary-text font-semibold uppercase tracking-wider mb-1">Nhân viên</p>
                  <p class="text-sm font-semibold">{{ actionTarget?.employee.fullName }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-tertiary-text font-semibold uppercase tracking-wider mb-1">Ngày làm việc</p>
                  <p class="text-sm font-semibold">{{ actionTarget?.date }}</p>
                </div>
                
                <div>
                  <p class="text-[10px] text-tertiary-text font-semibold uppercase tracking-wider mb-1">Chọn ca làm</p>
                  <select
                    v-model="actionShiftId"
                    class="w-full h-10 px-3 rounded-lg border border-border-subtle bg-surface text-sm font-semibold focus:ring-1 focus:ring-primary outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="isReadOnlyPastAction || isActionLoading"
                  >
                    <option value="" disabled>-- Chọn ca --</option>
                    <option v-for="shift in shifts" :key="shift.id" :value="String(shift.id)">{{ shift.name }} ({{ shift.startTime?.slice(0,5) }} - {{ shift.endTime?.slice(0,5) }})</option>
                  </select>
                </div>

                <p
                  v-if="isReadOnlyPastAction"
                  class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300"
                >
                  {{
                    actionTarget?.mode === 'edit'
                      ? 'Ca làm trong quá khứ chỉ xem chi tiết, không được đổi sang ca mới.'
                      : 'Không thể phân ca nhanh cho ngày trong quá khứ.'
                  }}
                </p>
              </div>

              <div class="mt-8 flex gap-3">
                <Button @click="closeActionModal" variant="outline" class="flex-1" :disabled="isActionLoading">Đóng</Button>
                <Button v-if="actionTarget?.mode === 'edit'" @click="handleActionDelete" variant="outline" class="flex-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200" :disabled="isActionLoading">
                  {{ isActionLoading ? 'Đang xóa...' : 'Xóa ca' }}
                </Button>
                <Button @click="handleActionSubmit" class="flex-1 bg-primary hover:bg-primary/90 text-white" :disabled="isActionLoading || !actionShiftId || isReadOnlyPastAction">
                  {{
                    isReadOnlyPastAction
                      ? actionTarget?.mode === 'edit'
                        ? 'Không sửa quá khứ'
                        : 'Không phân ca quá khứ'
                      : isActionLoading
                        ? 'Đang lưu...'
                        : 'Lưu lại'
                  }}
                </Button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
