<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  UserRound,
  XCircle,
} from 'lucide-vue-next'
import { attendanceApi } from '@/modules/attendance/api/attendance.api'
import type { Attendance } from '@/modules/attendance/types/attendance.types'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { employeeApi } from '@/modules/employees/api/employee.api'
import { scheduleApi } from '@/modules/schedules/api/schedule.api'
import type { EmployeeScheduleResponse } from '@/modules/schedules/types/schedule.types'
import { queryKeys } from '@/shared/lib/queryKeys'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

type EmployeeAttendanceContext = {
  fullName: string | null
  employeeCode: string | null
  departmentName: string | null
  positionName: string | null
}

type AttendanceHistoryResult = {
  content: Attendance[]
}

const route = useRoute()
const router = useRouter()
const { isAdmin, isHR } = useAuth()

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const employeeId = computed(() => Number(route.params.id))
const hasValidEmployeeId = computed(() => Number.isFinite(employeeId.value) && employeeId.value > 0)
const canLoadEmployeeProfile = computed(() => Boolean(isAdmin.value || isHR.value))
const canOpenEmployeeProfile = computed(
  () => canLoadEmployeeProfile.value && hasValidEmployeeId.value,
)

const normalizeRouteText = (value: unknown) => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' && value[0].trim() ? value[0].trim() : null
  }

  return typeof value === 'string' && value.trim() ? value.trim() : null
}

const getInitials = (fullName?: string | null) => {
  if (!fullName) return '??'

  const names = fullName.trim().split(/\s+/).filter(Boolean)
  if (!names.length) return '??'

  return names.length > 1
    ? `${names[0]?.charAt(0) ?? ''}${names[names.length - 1]?.charAt(0) ?? ''}`.toUpperCase()
    : (names[0]?.charAt(0) ?? '').toUpperCase()
}

const formatDateStr = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseDateValue = (value?: string | null) => {
  if (!value) {
    return null
  }

  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDisplayDate = (value?: string | null) => {
  const parsed = parseDateValue(value)
  if (!parsed) {
    return value || 'Chưa cập nhật'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed)
}

const getStartOfMonth = (year: number, month: number) => new Date(year, month, 1)
const getEndOfMonth = (year: number, month: number) => new Date(year, month + 1, 0)

const filters = computed(() => {
  const start = getStartOfMonth(currentYear.value, currentMonth.value)
  const end = getEndOfMonth(currentYear.value, currentMonth.value)

  return {
    fromDate: formatDateStr(start),
    toDate: formatDateStr(end),
    page: 0,
    size: 100,
    sort: 'workDate',
    sortDir: 'desc',
  }
})

const routeContext = computed<EmployeeAttendanceContext>(() => ({
  fullName: normalizeRouteText(route.query.name),
  employeeCode: normalizeRouteText(route.query.code),
  departmentName: normalizeRouteText(route.query.department),
  positionName: normalizeRouteText(route.query.position),
}))

const employeeQuery = useQuery({
  queryKey: computed(() => queryKeys.employees.detail(employeeId.value)),
  queryFn: async () => {
    const response = await employeeApi.getById(employeeId.value)
    return response.data.result
  },
  enabled: computed(() => hasValidEmployeeId.value && canLoadEmployeeProfile.value),
  staleTime: 1000 * 60 * 3,
})

const historyQuery = useQuery({
  queryKey: computed(
    () => ['attendance', 'employee', employeeId.value, 'history', filters.value] as const,
  ),
  queryFn: async () => {
    const response = await attendanceApi.search({
      employeeId: employeeId.value,
      ...filters.value,
    })
    return (response.data.result ?? null) as AttendanceHistoryResult | null
  },
  enabled: hasValidEmployeeId,
})

const scheduleQuery = useQuery({
  queryKey: computed(() => ['attendance', 'employee', employeeId.value, 'schedules'] as const),
  queryFn: async () => {
    const response = await scheduleApi.getByEmployee(employeeId.value)
    return (response.data.result ?? []) as EmployeeScheduleResponse[]
  },
  enabled: hasValidEmployeeId,
})

const employeeFromAttendance = computed(() => {
  const rows = historyQuery.data.value?.content ?? []

  return (
    rows.find(
      (row) =>
        row.employeeFullName ||
        row.employeeSnapshotCode ||
        row.employeeSnapshotDepartmentName ||
        row.employeeSnapshotPositionName,
    ) ?? null
  )
})

const employeeSummary = computed(() => {
  const employee = employeeQuery.data.value
  const routeData = routeContext.value
  const snapshot = employeeFromAttendance.value

  return {
    fullName:
      employee?.fullName ||
      routeData.fullName ||
      snapshot?.employeeFullName ||
      `Nhân viên #${employeeId.value}`,
    employeeCode:
      employee?.employeeCode || routeData.employeeCode || snapshot?.employeeSnapshotCode || '',
    departmentName:
      employee?.departmentName ||
      routeData.departmentName ||
      snapshot?.employeeSnapshotDepartmentName ||
      null,
    positionName:
      employee?.positionName ||
      routeData.positionName ||
      snapshot?.employeeSnapshotPositionName ||
      null,
    joinDate: employee?.joinDate ?? null,
    status: employee?.status ?? null,
  }
})

const monthLabel = computed(() =>
  new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(
    new Date(currentYear.value, currentMonth.value, 1),
  ),
)

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value -= 1
  } else {
    currentMonth.value -= 1
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value += 1
  } else {
    currentMonth.value += 1
  }
}

const getAttendanceTimestamp = (logEntry: Attendance | undefined, key: 'checkIn' | 'checkOut') => {
  if (!logEntry) return null

  return key === 'checkIn'
    ? logEntry.checkInTime || logEntry.checkIn || logEntry.check_in_time || null
    : logEntry.checkOutTime || logEntry.checkOut || logEntry.check_out_time || null
}

const resolveAttendanceStatus = (
  logEntry: Attendance | undefined,
  dateStr: string,
  todayStr: string,
) => {
  if (!logEntry) return ''

  const checkInValue = getAttendanceTimestamp(logEntry, 'checkIn')
  const checkOutValue = getAttendanceTimestamp(logEntry, 'checkOut')
  if (dateStr < todayStr && checkInValue && !checkOutValue) {
    return 'MISSING_CHECKOUT'
  }

  return logEntry.status || ''
}

const logs = computed(() => {
  const apiData = historyQuery.data.value?.content ?? []
  const scheduleData = scheduleQuery.data.value ?? []
  const daysInMonth = getEndOfMonth(currentYear.value, currentMonth.value).getDate()
  const allDays = []
  const todayStr = formatDateStr(new Date())

  for (let i = 1; i <= daysInMonth; i += 1) {
    const dateObj = new Date(currentYear.value, currentMonth.value, i)
    const dateStr = formatDateStr(dateObj)
    const dayOfWeek = dateObj.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    const logEntry = apiData.find((item) => {
      const itemDate = parseDateValue(item.workDate)
      return itemDate ? formatDateStr(itemDate) === dateStr : false
    })

    const checkInValue = getAttendanceTimestamp(logEntry, 'checkIn')
    const checkOutValue = getAttendanceTimestamp(logEntry, 'checkOut')

    const checkInDate = parseDateValue(checkInValue)
    const checkOutDate = parseDateValue(checkOutValue)

    const hasSchedule = (() => {
      const backendDay = dayOfWeek === 0 ? 7 : dayOfWeek
      return scheduleData.some(
        (schedule) =>
          schedule.dayOfWeek === backendDay &&
          schedule.isActive &&
          schedule.effectiveFrom <= dateStr &&
          (!schedule.effectiveTo || schedule.effectiveTo >= dateStr),
      )
    })()

    if (isWeekend && !logEntry && !hasSchedule) {
      continue
    }

    const resolvedStatus = (() => {
      const status = resolveAttendanceStatus(logEntry, dateStr, todayStr)
      if (status) return status
      if (dateStr < todayStr && hasSchedule) return 'ABSENT'
      return ''
    })()

    allDays.push({
      id: logEntry?.id || `empty-${dateStr}`,
      date: new Intl.DateTimeFormat('vi-VN', { day: '2-digit' }).format(dateObj),
      month: new Intl.DateTimeFormat('vi-VN', { month: '2-digit' }).format(dateObj),
      dayLabel: new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(dateObj),
      dateObj,
      isWeekend,
      shift: (() => {
        const backendDay = dayOfWeek === 0 ? 7 : dayOfWeek
        const matchedSchedule = scheduleData
          .filter(
            (schedule) =>
              schedule.dayOfWeek === backendDay &&
              schedule.isActive &&
              schedule.effectiveFrom <= dateStr &&
              (!schedule.effectiveTo || schedule.effectiveTo >= dateStr),
          )
          .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0]

        if (matchedSchedule) return matchedSchedule.shiftName
        if (logEntry?.shiftName) return logEntry.shiftName
        return '—'
      })(),
      displayCheckIn: checkInDate
        ? new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).format(checkInDate)
        : '—',
      displayCheckOut: checkOutDate
        ? new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).format(checkOutDate)
        : '—',
      status: resolvedStatus,
      lateMinutes: logEntry?.lateMinutes || 0,
      isToday: dateStr === todayStr,
    })
  }

  return allDays.reverse()
})

const summary = computed(() => {
  const data = logs.value

  return {
    present: data.filter((row) => row.status === 'PRESENT').length,
    late: data.filter((row) => ['LATE', 'LATE_AND_EARLY_LEAVE'].includes(row.status)).length,
    absent: data.filter((row) => row.status === 'ABSENT').length,
    leave: data.filter((row) => ['LEAVE', 'ON_LEAVE'].includes(row.status)).length,
  }
})

const getStatusBadge = (status: string, lateMinutes: number, isToday: boolean) => {
  if (!status) {
    if (isToday) return { label: 'Đang đợi', class: 'bg-primary/10 text-primary' }
    return { label: 'Trống', class: 'bg-surface text-tertiary-text italic' }
  }

  switch (String(status || '').toUpperCase()) {
    case 'PRESENT':
      return {
        label: 'Đúng giờ',
        class: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      }
    case 'LATE':
      return {
        label: `Muộn (${lateMinutes || 0}p)`,
        class: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
      }
    case 'ABSENT':
      return {
        label: 'Vắng mặt',
        class: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
      }
    case 'EARLY_LEAVE':
      return { label: 'Về sớm', class: 'bg-primary/10 text-primary' }
    case 'LATE_AND_EARLY_LEAVE':
      return {
        label: 'Muộn + sớm',
        class: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
      }
    case 'ON_LEAVE':
    case 'LEAVE':
      return {
        label: 'Nghỉ phép',
        class: 'bg-sky-500/10 text-sky-500 border border-sky-500/20',
      }
    case 'HOLIDAY':
      return { label: 'Ngày lễ', class: 'bg-surface text-secondary-text' }
    case 'MISSING_CHECKOUT':
      return {
        label: 'Thiếu checkout',
        class: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
      }
    case 'INCOMPLETE':
      return {
        label: 'Chưa đủ công',
        class: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
      }
    default:
      return { label: status, class: 'bg-muted text-secondary-text' }
  }
}

const profileStatusLabel = computed(() => {
  switch ((employeeSummary.value.status ?? '').toUpperCase()) {
    case 'ACTIVE':
      return 'Đang làm việc'
    case 'INACTIVE':
      return 'Ngưng hoạt động'
    default:
      return employeeSummary.value.status || 'Chưa cập nhật'
  }
})

const isLoading = computed(
  () =>
    historyQuery.isLoading.value ||
    scheduleQuery.isLoading.value ||
    (canLoadEmployeeProfile.value && employeeQuery.isLoading.value),
)

const hasError = computed(() => historyQuery.isError.value || scheduleQuery.isError.value)

const retryQueries = () => {
  historyQuery.refetch()
  scheduleQuery.refetch()

  if (employeeQuery.isError.value) {
    employeeQuery.refetch()
  }
}

const openEmployeeProfile = () => {
  if (!hasValidEmployeeId.value) return
  router.push(`/employees/${employeeId.value}`)
}
</script>

<template>
  <div class="space-y-5 lg:space-y-6">
    <PageHeader
      :title="employeeSummary.fullName"
      description="Theo dõi bảng công theo tháng, lịch áp dụng và trạng thái từng ngày của nhân viên."
    >
      <template #actions>
        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" class="gap-2" @click="router.back()">
            <ArrowLeft class="h-4 w-4" />
            Quay lại
          </Button>
          <Button
            v-if="canOpenEmployeeProfile"
            variant="outline"
            class="gap-2"
            @click="openEmployeeProfile"
          >
            <UserRound class="h-4 w-4" />
            Hồ sơ nhân viên
          </Button>
          <div
            class="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm shrink-0"
          >
            <Button variant="ghost" size="icon" class="h-8 w-8 rounded-lg" @click="prevMonth">
              <ChevronLeft class="h-4 w-4" />
            </Button>
            <div class="min-w-33 px-3 text-center text-xs font-semibold text-primary-text">
              {{ monthLabel }}
            </div>
            <Button variant="ghost" size="icon" class="h-8 w-8 rounded-lg" @click="nextMonth">
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </template>
    </PageHeader>

    <div v-if="isLoading" class="flex h-64 items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>

    <div
      v-else-if="hasError"
      class="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
    >
      <p>Không thể tải bảng công tháng của nhân viên này.</p>
      <Button variant="outline" class="mt-4" @click="retryQueries">Thử lại</Button>
    </div>

    <template v-else>
      <section
        class="overflow-hidden rounded-2xl border border-border-standard bg-card shadow-sm dark:border-border dark:bg-card"
      >
        <div class="relative p-6">
          <div
            class="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent"
          ></div>

          <div class="relative grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_340px]">
            <div class="flex items-start gap-4">
              <div
                class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-lg font-bold text-primary"
              >
                {{ getInitials(employeeSummary.fullName) }}
              </div>

              <div class="space-y-3">
                <div>
                  <p class="text-xs font-semibold text-tertiary-text">Bảng công nhân viên</p>
                  <h2 class="mt-1 text-2xl font-semibold tracking-normal text-primary-text">
                    {{ employeeSummary.fullName }}
                  </h2>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <code
                    class="rounded-md border border-border-subtle bg-surface px-2.5 py-1 font-mono text-xs font-semibold text-secondary-text dark:border-border dark:bg-elevated"
                  >
                    {{ employeeSummary.employeeCode || `ID ${employeeId}` }}
                  </code>
                  <Badge
                    variant="outline"
                    class="border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-300"
                  >
                    {{ monthLabel }}
                  </Badge>
                  <Badge
                    variant="outline"
                    class="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                  >
                    {{ profileStatusLabel }}
                  </Badge>
                </div>

                <p class="text-sm leading-6 text-secondary-text">
                  {{ employeeSummary.departmentName || 'Chưa phân bổ phòng ban' }}
                  <span class="text-tertiary-text">•</span>
                  {{ employeeSummary.positionName || 'Chưa gán chức vụ' }}
                </p>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div
                class="rounded-xl border border-border-standard bg-surface/70 px-4 py-3 dark:border-border dark:bg-elevated/60"
              >
                <div class="flex items-start gap-3">
                  <div class="rounded-lg bg-primary/10 p-2 text-primary">
                    <FileText class="h-4 w-4" />
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-tertiary-text">Mã nhân viên</p>
                    <p class="mt-1 text-sm font-semibold text-primary-text">
                      {{ employeeSummary.employeeCode || 'Chưa cập nhật' }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="rounded-xl border border-border-standard bg-surface/70 px-4 py-3 dark:border-border dark:bg-elevated/60"
              >
                <div class="flex items-start gap-3">
                  <div class="rounded-lg bg-primary/10 p-2 text-primary">
                    <Building2 class="h-4 w-4" />
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-tertiary-text">Phòng ban</p>
                    <p class="mt-1 text-sm font-semibold text-primary-text">
                      {{ employeeSummary.departmentName || 'Chưa cập nhật' }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="rounded-xl border border-border-standard bg-surface/70 px-4 py-3 dark:border-border dark:bg-elevated/60"
              >
                <div class="flex items-start gap-3">
                  <div class="rounded-lg bg-primary/10 p-2 text-primary">
                    <Briefcase class="h-4 w-4" />
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-tertiary-text">Thông tin thêm</p>
                    <p class="mt-1 text-sm font-semibold text-primary-text">
                      {{ employeeSummary.joinDate ? formatDisplayDate(employeeSummary.joinDate) : 'Chưa có ngày vào làm' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card class="overflow-hidden rounded-xl border-border-subtle bg-card shadow-none">
          <CardContent class="flex items-center gap-4 p-4 sm:p-5">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-current/20 bg-emerald-500/10 text-emerald-500"
            >
              <CheckCircle2 class="h-5 w-5" />
            </div>
            <div>
              <p class="mb-1 text-xs font-medium leading-none text-tertiary-text">Đúng giờ</p>
              <p class="text-2xl font-semibold leading-none text-primary-text tabular-nums">
                {{ summary.present }}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card class="overflow-hidden rounded-xl border-border-subtle bg-card shadow-none">
          <CardContent class="flex items-center gap-4 p-4 sm:p-5">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-current/20 bg-amber-500/10 text-amber-500"
            >
              <Clock class="h-5 w-5" />
            </div>
            <div>
              <p class="mb-1 text-xs font-medium leading-none text-tertiary-text">Đi muộn</p>
              <p class="text-2xl font-semibold leading-none text-primary-text tabular-nums">
                {{ summary.late }}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card class="overflow-hidden rounded-xl border-border-subtle bg-card shadow-none">
          <CardContent class="flex items-center gap-4 p-4 sm:p-5">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-current/20 bg-rose-500/10 text-rose-500"
            >
              <XCircle class="h-5 w-5" />
            </div>
            <div>
              <p class="mb-1 text-xs font-medium leading-none text-tertiary-text">Vắng mặt</p>
              <p class="text-2xl font-semibold leading-none text-primary-text tabular-nums">
                {{ summary.absent }}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card class="overflow-hidden rounded-xl border-border-subtle bg-card shadow-none">
          <CardContent class="flex items-center gap-4 p-4 sm:p-5">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-current/20 bg-sky-500/10 text-sky-500"
            >
              <CalendarDays class="h-5 w-5" />
            </div>
            <div>
              <p class="mb-1 text-xs font-medium leading-none text-tertiary-text">Nghỉ phép</p>
              <p class="text-2xl font-semibold leading-none text-primary-text tabular-nums">
                {{ summary.leave }}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div v-if="logs.length === 0" class="rounded-xl border border-border bg-card px-6 py-10 text-center shadow-none">
        <p class="text-sm font-semibold text-primary-text">
          Chưa có dữ liệu bảng công trong tháng này.
        </p>
        <p class="mt-2 text-sm text-secondary-text">
          Nhân viên chưa có lịch làm việc hiệu lực hoặc chưa phát sinh bản ghi chấm công.
        </p>
      </div>

      <template v-else>
        <div class="space-y-2 lg:hidden">
          <div class="px-1 pb-1">
            <p class="text-sm font-semibold text-primary-text">Chi tiết theo ngày</p>
          </div>
          <div
            v-for="row in logs"
            :key="'m-' + row.id"
            class="rounded-xl border bg-card px-4 py-3 transition-colors"
            :class="row.isToday ? 'border-primary/40 bg-primary/5' : 'border-border-subtle'"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  v-if="row.isToday"
                  class="h-8 w-1 shrink-0 rounded-full bg-primary"
                ></div>
                <div>
                  <div class="flex items-center gap-2">
                    <span
                      class="text-sm font-semibold"
                      :class="row.isToday ? 'text-primary' : 'text-primary-text'"
                    >
                      {{ row.dayLabel }}, {{ row.date }}/{{ row.month }}
                    </span>
                    <span
                      v-if="row.isToday"
                      class="inline-flex h-5 items-center rounded-full bg-primary px-2 text-[10px] font-semibold text-primary-foreground"
                    >
                      Hôm nay
                    </span>
                  </div>
                  <span v-if="row.shift !== '—'" class="text-xs text-tertiary-text">
                    {{ row.shift }}
                  </span>
                </div>
              </div>
              <Badge
                :class="[
                  getStatusBadge(row.status, row.lateMinutes, row.isToday).class,
                  'h-6 rounded-lg px-2.5 text-[11px] font-semibold whitespace-nowrap',
                ]"
              >
                {{ getStatusBadge(row.status, row.lateMinutes, row.isToday).label }}
              </Badge>
            </div>

            <div
              v-if="row.displayCheckIn !== '—' || row.displayCheckOut !== '—'"
              class="mt-2.5 flex gap-4"
            >
              <div class="flex-1 rounded-lg bg-surface/60 px-3 py-2">
                <span
                  class="block text-[10px] font-medium uppercase tracking-wider text-tertiary-text"
                >
                  Giờ vào
                </span>
                <code
                  v-if="row.displayCheckIn !== '—'"
                  class="text-sm font-semibold tabular-nums text-primary-text"
                >
                  {{ row.displayCheckIn }}
                </code>
                <span v-else class="text-sm text-muted-foreground/50">--:--:--</span>
              </div>
              <div class="flex-1 rounded-lg bg-surface/60 px-3 py-2">
                <span
                  class="block text-[10px] font-medium uppercase tracking-wider text-tertiary-text"
                >
                  Giờ ra
                </span>
                <code
                  v-if="row.displayCheckOut !== '—'"
                  class="text-sm font-semibold tabular-nums text-primary-text"
                >
                  {{ row.displayCheckOut }}
                </code>
                <span v-else class="text-sm text-muted-foreground/50">--:--:--</span>
              </div>
            </div>
          </div>
        </div>

        <div
          class="hidden overflow-hidden rounded-xl border border-border-standard bg-card shadow-none lg:block"
        >
          <div class="border-b border-border-subtle bg-surface/40 px-4 py-3">
            <p class="text-sm font-semibold text-primary-text">Chi tiết theo ngày</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-border bg-surface/50">
                  <th class="px-5 py-3 text-left text-xs font-semibold text-secondary-text">Ngày</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-secondary-text">Ca làm việc</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-secondary-text">Giờ vào</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-secondary-text">Giờ ra</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-secondary-text">Trạng thái</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-subtle">
                <tr
                  v-for="row in logs"
                  :key="'d-' + row.id"
                  class="group transition-colors hover:bg-elevated/60"
                  :class="{ 'bg-primary/5': row.isToday }"
                >
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <div
                        v-if="row.isToday"
                        class="h-9 w-1.5 shrink-0 rounded-full bg-primary"
                      ></div>
                      <div class="flex flex-col text-left">
                        <div class="flex items-center gap-2">
                          <span
                            class="text-sm font-semibold leading-none"
                            :class="row.isToday ? 'text-primary' : 'text-primary-text'"
                          >
                            {{ row.date }}/{{ row.month }}
                          </span>
                          <div
                            v-if="row.isToday"
                            class="flex h-5 items-center rounded-full bg-primary px-2 text-[10px] font-semibold text-primary-foreground"
                          >
                            Hôm nay
                          </div>
                        </div>
                        <span class="mt-1 text-xs font-medium text-tertiary-text">
                          {{ row.dayLabel }}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td class="px-5 py-4">
                    <span
                      class="text-sm font-medium"
                      :class="
                        row.shift !== '—' && row.shift !== 'Ngày nghỉ'
                          ? 'text-primary-text'
                          : 'text-tertiary-text'
                      "
                    >
                      {{ row.shift }}
                    </span>
                  </td>

                  <td class="px-5 py-4">
                    <code
                      v-if="row.displayCheckIn !== '—'"
                      class="rounded-lg bg-surface px-2.5 py-1 font-mono text-xs font-semibold text-secondary-text"
                    >
                      {{ row.displayCheckIn }}
                    </code>
                    <span v-else class="font-mono text-xs text-muted-foreground/50">
                      --:--:--
                    </span>
                  </td>

                  <td class="px-5 py-4">
                    <code
                      v-if="row.displayCheckOut !== '—'"
                      class="rounded-lg bg-surface px-2.5 py-1 font-mono text-xs font-semibold text-secondary-text"
                    >
                      {{ row.displayCheckOut }}
                    </code>
                    <span v-else class="font-mono text-xs text-muted-foreground/50">
                      --:--:--
                    </span>
                  </td>

                  <td class="px-5 py-4">
                    <Badge
                      :class="[
                        getStatusBadge(row.status, row.lateMinutes, row.isToday).class,
                        'h-7 rounded-lg px-3 text-xs font-semibold whitespace-nowrap',
                      ]"
                    >
                      {{ getStatusBadge(row.status, row.lateMinutes, row.isToday).label }}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
