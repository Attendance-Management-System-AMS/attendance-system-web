<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-vue-next'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { useMyAttendance } from '@/modules/attendance/composables/useMyAttendance'
import type { Attendance } from '@/modules/attendance/types/attendance.types'
import type { EmployeeScheduleResponse } from '@/modules/schedules/types/schedule.types'

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const router = useRouter()

const handleCorrection = (dateObj: Date) => {
  const d = formatDateStr(dateObj)
  router.push({ path: '/my/requests', query: { type: 'AC', date: d } })
}

const formatDateStr = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
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
  }
})

const { historyQuery, scheduleQuery } = useMyAttendance(filters)

const monthLabel = computed(() =>
  new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(
    new Date(currentYear.value, currentMonth.value, 1),
  ),
)

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else currentMonth.value--
}
const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else currentMonth.value++
}

const getAttendanceTimestamp = (logEntry: Attendance | undefined, key: 'checkIn' | 'checkOut') => {
  if (!logEntry) return null
  return key === 'checkIn'
    ? logEntry.checkIn || logEntry.checkInTime || logEntry.check_in_time || null
    : logEntry.checkOut || logEntry.checkOutTime || logEntry.check_out_time || null
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

const canCreateCorrection = (status: string) =>
  ['ABSENT', 'INCOMPLETE', 'MISSING_CHECKOUT'].includes(String(status || '').toUpperCase())

const logs = computed(() => {
  const apiData = (historyQuery.data.value?.content || []) as Attendance[]
  const scheduleData = (scheduleQuery.data.value || []) as EmployeeScheduleResponse[]
  const daysInMonth = getEndOfMonth(currentYear.value, currentMonth.value).getDate()
  const allDays = []
  const todayStr = formatDateStr(new Date())

  for (let i = 1; i <= daysInMonth; i++) {
    const dateObj = new Date(currentYear.value, currentMonth.value, i)
    const dateStr = formatDateStr(dateObj)
    const dayOfWeek = dateObj.getDay() // 0 = CN, 6 = T7
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    const logEntry = apiData.find((item) => {
      const itemDate = item.workDate ? formatDateStr(new Date(item.workDate)) : null
      return itemDate === dateStr
    })

    const checkInValue = getAttendanceTimestamp(logEntry, 'checkIn')
    const checkOutValue = getAttendanceTimestamp(logEntry, 'checkOut')

    const checkInDate = checkInValue ? new Date(checkInValue) : null
    const checkOutDate = checkOutValue ? new Date(checkOutValue) : null

    const hasSchedule = (() => {
      const backendDay = dayOfWeek === 0 ? 7 : dayOfWeek
      return scheduleData.some(
        (s) =>
          s.dayOfWeek === backendDay &&
          s.isActive &&
          s.effectiveFrom <= dateStr &&
          (!s.effectiveTo || s.effectiveTo >= dateStr),
      )
    })()

    if (isWeekend && !logEntry && !hasSchedule) continue

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
      dateObj: dateObj,
      isWeekend,
      shift: (() => {
        const backendDay = dayOfWeek === 0 ? 7 : dayOfWeek
        const matchedSchedule = scheduleData
          .filter(
            (s) =>
              s.dayOfWeek === backendDay &&
              s.isActive &&
              s.effectiveFrom <= dateStr &&
              (!s.effectiveTo || s.effectiveTo >= dateStr),
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
      canCreateCorrection: canCreateCorrection(resolvedStatus),
      isToday: dateStr === todayStr,
    })
  }

  return allDays.reverse()
})

const summary = computed(() => {
  const data = logs.value

  return {
    present: data.filter((row) => row.status === 'PRESENT').length,
    late: data.filter((row) => row.status === 'LATE').length,
    absent: data.filter((row) => row.status === 'ABSENT').length,
    correctionNeeded: data.filter((row) => ['INCOMPLETE', 'MISSING_CHECKOUT'].includes(row.status)).length,
  }
})

const getStatusBadge = (status: string, lateMinutes: number, isToday: boolean) => {
  if (!status) {
    if (isToday) return { label: 'Đang đợi', class: 'bg-primary/10 text-primary' }
    return { label: 'Trống', class: 'bg-surface text-tertiary-text italic' }
  }

  switch (String(status || '').toUpperCase()) {
    case 'PRESENT':
      return { label: 'Đúng giờ', class: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' }
    case 'LATE':
      return { label: `Muộn (${lateMinutes || 0}p)`, class: 'bg-amber-500/10 text-amber-500 border border-amber-500/20' }
    case 'ABSENT':
      return { label: 'Vắng mặt', class: 'bg-rose-500/10 text-rose-500 border border-rose-500/20' }
    case 'EARLY_LEAVE':
      return { label: 'Về sớm', class: 'bg-primary/10 text-primary' }
    case 'LATE_AND_EARLY_LEAVE':
      return { label: 'Muộn + sớm', class: 'bg-amber-500/10 text-amber-500 border border-amber-500/20' }
    case 'ON_LEAVE':
      return { label: 'Nghỉ phép', class: 'bg-surface text-secondary-text' }
    case 'HOLIDAY':
      return { label: 'Ngày lễ', class: 'bg-surface text-secondary-text' }
    case 'MISSING_CHECKOUT':
      return { label: 'Thiếu ra', class: 'bg-rose-500/10 text-rose-500 border border-rose-500/20' }
    case 'LEAVE':
      return { label: 'Nghỉ phép', class: 'bg-sky-500/10 text-sky-500 border border-sky-500/20' }
    case 'INCOMPLETE':
      return { label: 'Chưa đủ', class: 'bg-orange-500/10 text-orange-500 border border-orange-500/20' }
    default:
      return { label: status, class: 'bg-muted text-secondary-text' }
  }
}
</script>

<template>
  <div class="space-y-5 lg:space-y-6">
    <PageHeader
      title="Bảng công tháng"
      description="Theo dõi ca làm, giờ vào/ra và trạng thái từng ngày."
    >
      <template #actions>
        <div
          class="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm shrink-0"
        >
          <Button variant="ghost" size="icon" @click="prevMonth" class="h-8 w-8 rounded-lg">
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <div
            class="min-w-33 px-3 text-center text-xs font-semibold text-primary-text"
          >
            {{ monthLabel }}
          </div>
          <Button variant="ghost" size="icon" @click="nextMonth" class="h-8 w-8 rounded-lg">
            <ChevronRight class="h-4 w-4" />
          </Button>
        </div>
      </template>
    </PageHeader>

    <div
      v-if="historyQuery.isLoading.value || scheduleQuery.isLoading.value"
      class="flex h-64 items-center justify-center"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Summary Statistics -->
    <div v-else class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card
        v-for="item in [
          {
            label: 'Đúng giờ',
            value: summary.present,
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Đi muộn',
            value: summary.late,
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Vắng mặt',
            value: summary.absent,
            icon: XCircle,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
          },
          {
            label: 'Thiếu công',
            value: summary.correctionNeeded,
            icon: HelpCircle,
            color: 'text-primary',
            bg: 'bg-primary/10',
          },
        ]"
        :key="item.label"
        class="overflow-hidden rounded-xl border-border-subtle bg-card shadow-none"
      >
        <CardContent
          class="flex items-center gap-4 p-4 sm:p-5"
        >
          <div
            :class="[
              item.bg,
              item.color,
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-current/20',
            ]"
          >
            <component :is="item.icon" class="h-5 w-5" />
          </div>
          <div>
            <p
              class="mb-1 text-xs font-medium leading-none text-tertiary-text"
            >
              {{ item.label }}
            </p>
            <p class="text-2xl font-semibold leading-none text-primary-text tabular-nums">
              {{ item.value }}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Main Attendance Detail -->
    <div
      v-if="!historyQuery.isLoading.value && !scheduleQuery.isLoading.value"
    >
      <!-- ===== MOBILE: Card List (visible < lg) ===== -->
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
          <!-- Row 1: Date + Status -->
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
                <span
                  v-if="row.shift !== '—'"
                  class="text-xs text-tertiary-text"
                >{{ row.shift }}</span>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1.5">
              <Badge
                :class="[
                  getStatusBadge(row.status, row.lateMinutes, row.isToday).class,
                  'h-6 rounded-lg px-2.5 text-[11px] font-semibold whitespace-nowrap',
                ]"
              >
                {{ getStatusBadge(row.status, row.lateMinutes, row.isToday).label }}
              </Badge>
              <Button 
                v-if="row.canCreateCorrection"
                variant="outline" 
                size="sm" 
                class="h-6 text-[10px] px-2 whitespace-nowrap"
                @click="handleCorrection(row.dateObj)"
              >
                Giải trình
              </Button>
            </div>
          </div>

          <!-- Row 2: Check-in / Check-out (only show if there's data) -->
          <div
            v-if="row.displayCheckIn !== '—' || row.displayCheckOut !== '—'"
            class="mt-2.5 flex gap-4"
          >
            <div class="flex-1 rounded-lg bg-surface/60 px-3 py-2">
              <span class="block text-[10px] font-medium uppercase tracking-wider text-tertiary-text">Giờ vào</span>
              <code
                v-if="row.displayCheckIn !== '—'"
                class="text-sm font-semibold tabular-nums text-primary-text"
              >{{ row.displayCheckIn }}</code>
              <span v-else class="text-sm text-muted-foreground/50">--:--:--</span>
            </div>
            <div class="flex-1 rounded-lg bg-surface/60 px-3 py-2">
              <span class="block text-[10px] font-medium uppercase tracking-wider text-tertiary-text">Giờ ra</span>
              <code
                v-if="row.displayCheckOut !== '—'"
                class="text-sm font-semibold tabular-nums text-primary-text"
              >{{ row.displayCheckOut }}</code>
              <span v-else class="text-sm text-muted-foreground/50">--:--:--</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== DESKTOP: Table (visible >= lg) ===== -->
      <div class="hidden lg:block overflow-hidden rounded-xl border border-border-standard bg-card shadow-none">
        <div class="border-b border-border-subtle bg-surface/40 px-4 py-3">
          <p class="text-sm font-semibold text-primary-text">Chi tiết theo ngày</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-surface/50 border-b border-border">
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
                <!-- Date Column -->
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
                      <span class="mt-1 text-xs font-medium text-tertiary-text">{{ row.dayLabel }}</span>
                    </div>
                  </div>
                </td>

                <!-- Shift Column -->
                <td class="px-5 py-4">
                  <span
                    class="text-sm font-medium"
                    :class="row.shift !== '—' && row.shift !== 'Ngày nghỉ' ? 'text-primary-text' : 'text-tertiary-text'"
                  >
                    {{ row.shift }}
                  </span>
                </td>

                <!-- Time In Column -->
                <td class="px-5 py-4">
                  <code
                    v-if="row.displayCheckIn !== '—'"
                    class="rounded-lg bg-surface px-2.5 py-1 font-mono text-xs font-semibold text-secondary-text"
                  >
                    {{ row.displayCheckIn }}
                  </code>
                  <span v-else class="font-mono text-xs text-muted-foreground/50">--:--:--</span>
                </td>

                <!-- Out Column -->
                <td class="px-5 py-4">
                  <code
                    v-if="row.displayCheckOut !== '—'"
                    class="rounded-lg bg-surface px-2.5 py-1 font-mono text-xs font-semibold text-secondary-text"
                  >
                    {{ row.displayCheckOut }}
                  </code>
                  <span v-else class="font-mono text-xs text-muted-foreground/50">--:--:--</span>
                </td>

                <!-- Status Column -->
                <td class="px-5 py-4">
                  <div class="flex items-center gap-2">
                    <Badge
                      :class="[
                        getStatusBadge(row.status, row.lateMinutes, row.isToday).class,
                        'h-7 rounded-lg px-3 text-xs font-semibold whitespace-nowrap',
                      ]"
                    >
                      {{ getStatusBadge(row.status, row.lateMinutes, row.isToday).label }}
                    </Badge>
                    <Button 
                      v-if="row.canCreateCorrection"
                      variant="outline" 
                      size="sm" 
                      class="h-7 text-[10px] px-2 whitespace-nowrap"
                      @click="handleCorrection(row.dateObj)"
                    >
                      Giải trình
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
