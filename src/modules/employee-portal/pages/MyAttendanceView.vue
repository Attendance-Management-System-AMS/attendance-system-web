<script setup lang="ts">
import { computed, ref } from 'vue'
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

const logs = computed(() => {
  const apiData = (historyQuery.data.value?.content || []) as Attendance[]
  const scheduleData = (scheduleQuery.data.value || []) as EmployeeScheduleResponse[]
  const daysInMonth = getEndOfMonth(currentYear.value, currentMonth.value).getDate()
  const allDays = []
  const todayStr = formatDateStr(new Date())

  for (let i = 1; i <= daysInMonth; i++) {
    const dateObj = new Date(currentYear.value, currentMonth.value, i)
    const dateStr = formatDateStr(dateObj)

    const logEntry = apiData.find((item) => {
      const itemDate = item.workDate ? formatDateStr(new Date(item.workDate)) : null
      return itemDate === dateStr
    })

    const checkInValue = getAttendanceTimestamp(logEntry, 'checkIn')
    const checkOutValue = getAttendanceTimestamp(logEntry, 'checkOut')

    const checkInDate = checkInValue ? new Date(checkInValue) : null
    const checkOutDate = checkOutValue ? new Date(checkOutValue) : null

    allDays.push({
      id: logEntry?.id || `empty-${dateStr}`,
      date: new Intl.DateTimeFormat('vi-VN', { day: '2-digit' }).format(dateObj),
      month: new Intl.DateTimeFormat('vi-VN', { month: '2-digit' }).format(dateObj),
      dayLabel: new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(dateObj),
      dateObj: dateObj,
      shift: (() => {
        const jsDay = dateObj.getDay()
        const backendDay = jsDay === 0 ? 7 : jsDay
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
      status: resolveAttendanceStatus(logEntry, dateStr, todayStr),
      lateMinutes: logEntry?.lateMinutes || 0,
      isToday: dateStr === todayStr,
    })
  }

  return allDays
})

const summary = computed(() => {
  const data = (historyQuery.data.value?.content || []) as Attendance[]
  const todayStr = formatDateStr(new Date())
  const statusOf = (logEntry: Attendance) => {
    const dateStr = logEntry.workDate ? formatDateStr(new Date(logEntry.workDate)) : ''
    return resolveAttendanceStatus(logEntry, dateStr, todayStr)
  }

  return {
    present: data.filter((l) => statusOf(l) === 'PRESENT').length,
    late: data.filter((l) => statusOf(l) === 'LATE').length,
    absent: data.filter((l) => statusOf(l) === 'ABSENT').length,
    incomplete: data.filter((l) => ['EARLY_LEAVE', 'MISSING_CHECKOUT'].includes(statusOf(l))).length,
  }
})

const getStatusBadge = (status: string, lateMinutes: number, isToday: boolean) => {
  if (!status) {
    if (isToday) return { label: 'Đang đợi', class: 'bg-primary/10 text-primary' }
    return { label: 'Trống', class: 'bg-surface text-tertiary-text italic' }
  }

  switch (String(status || '').toUpperCase()) {
    case 'PRESENT':
      return { label: 'Đúng giờ', class: 'bg-emerald-50 text-emerald-600' }
    case 'LATE':
      return { label: `Muộn (${lateMinutes || 0}p)`, class: 'bg-amber-50 text-amber-600' }
    case 'ABSENT':
      return { label: 'Vắng mặt', class: 'bg-rose-50 text-rose-600' }
    case 'EARLY_LEAVE':
      return { label: 'Về sớm', class: 'bg-primary/10 text-primary' }
    case 'LATE_AND_EARLY_LEAVE':
      return { label: 'Muộn + sớm', class: 'bg-amber-50 text-amber-600' }
    case 'ON_LEAVE':
      return { label: 'Nghỉ phép', class: 'bg-surface text-secondary-text' }
    case 'HOLIDAY':
      return { label: 'Ngày lễ', class: 'bg-surface text-secondary-text' }
    case 'MISSING_CHECKOUT':
      return { label: 'Thiếu ra', class: 'bg-rose-50 text-rose-600' }
    default:
      return { label: status, class: 'bg-muted text-secondary-text' }
  }
}
</script>

<template>
  <div class="space-y-4 lg:space-y-6 px-0 md:px-0 font-bold">
    <PageHeader
      title="Bảng công tháng"
      description="Lịch sử chi tiết chấm công."
      class="px-4 md:px-0"
    >
      <template #actions>
        <div
          class="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm shrink-0"
        >
          <Button variant="ghost" size="icon" @click="prevMonth" class="h-8 w-8 rounded-lg">
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <div
            class="px-2 text-[10px] md:text-xs font-semibold  tracking-normal text-primary-text min-w-[100px] md:min-w-[120px] text-center"
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
    <div v-else class="grid grid-cols-4 gap-2 md:gap-4 px-4 md:px-0">
      <Card
        v-for="item in [
          {
            label: 'Đúng giờ',
            labelShort: 'Đúng',
            value: summary.present,
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50/50',
          },
          {
            label: 'Đi muộn',
            labelShort: 'Muộn',
            value: summary.late,
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-50/50',
          },
          {
            label: 'Vắng mặt',
            labelShort: 'Vắng',
            value: summary.absent,
            icon: XCircle,
            color: 'text-rose-500',
            bg: 'bg-rose-50/50',
          },
          {
            label: 'Về sớm',
            labelShort: 'Sớm',
            value: summary.incomplete,
            icon: HelpCircle,
            color: 'text-primary',
            bg: 'bg-primary/10/50',
          },
        ]"
        :key="item.label"
        class="border-none shadow-sm rounded-lg md:rounded-lg overflow-hidden"
      >
        <CardContent
          class="p-2 md:p-5 flex flex-col md:flex-row items-center md:gap-4 text-center md:text-left"
        >
          <div
            :class="[
              item.bg,
              item.color,
              'h-7 w-7 md:h-10 md:w-10 rounded-lg md:rounded-lg flex items-center justify-center border border-current opacity-20 hidden md:flex',
            ]"
          >
            <component :is="item.icon" class="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <div>
            <p
              class="text-[7px] md:text-[10px] font-semibold text-tertiary-text  tracking-normal md:tracking-normal leading-none mb-1"
            >
              <span class="md:hidden">{{ item.labelShort }}</span>
              <span class="hidden md:inline">{{ item.label }}</span>
            </p>
            <p class="text-xs md:text-xl font-semibold text-primary-text leading-none">
              {{ item.value }}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Main Attendance Table -->
    <div
      v-if="!historyQuery.isLoading.value && !scheduleQuery.isLoading.value"
      class="overflow-hidden md:rounded-lg border-y md:border border-border bg-card shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-surface/50 border-b border-border">
              <th
                class="px-3 md:px-6 py-3 text-left text-[10px] md:text-[11px] font-semibold  tracking-normal text-secondary-text"
              >
                Ngày
              </th>
              <th
                class="hidden md:table-cell px-6 py-3 text-left text-[11px] font-semibold  tracking-normal text-secondary-text"
              >
                Ca làm việc
              </th>
              <th
                class="px-3 md:px-6 py-3 text-left text-[10px] md:text-[11px] font-semibold  tracking-normal text-secondary-text"
              >
                <span class="md:hidden">Check In/Out</span>
                <span class="hidden md:inline">Giờ vào</span>
              </th>
              <th
                class="hidden md:table-cell px-6 py-3 text-left text-[11px] font-semibold  tracking-normal text-secondary-text"
              >
                Giờ ra
              </th>
              <th
                class="px-3 md:px-6 py-3 text-center text-[10px] md:text-[11px] font-semibold  tracking-normal text-secondary-text"
              >
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-center md:text-left">
            <tr
              v-for="row in logs"
              :key="row.id"
              class="group hover:bg-surface/50 transition-colors"
              :class="{ 'bg-primary/10/20': row.isToday }"
            >
              <!-- Date Column -->
              <td class="px-3 md:px-6 py-3">
                <div class="flex items-center gap-2 md:gap-3">
                  <div
                    v-if="row.isToday"
                    class="w-1 md:w-1.5 h-6 md:h-8 bg-primary rounded-full shrink-0"
                  ></div>
                  <div class="flex flex-col text-left">
                    <div class="flex items-center gap-1.5 md:gap-2">
                      <span
                        class="text-xs md:text-sm font-semibold  leading-none"
                        :class="row.isToday ? 'text-primary' : 'text-primary-text'"
                      >
                        {{ row.date }}<span class="md:hidden">/{{ row.month }}</span>
                      </span>
                      <div
                        v-if="row.isToday"
                        class="h-3 md:h-4 px-1 flex items-center bg-primary text-[6px] md:text-[8px] font-semibold text-white rounded border-none  whitespace-nowrap"
                      >
                        Nay
                      </div>
                    </div>
                    <span
                      class="text-[8px] md:text-[10px] font-bold text-tertiary-text  tracking-normal mt-0.5 md:mt-1"
                      >{{ row.dayLabel }}</span
                    >
                  </div>
                </div>
              </td>

              <!-- Shift Column -->
              <td class="hidden md:table-cell px-6 py-3">
                <span
                  class="text-xs font-semibold "
                  :class="row.shift !== '—' && row.shift !== 'Ngày nghỉ' ? 'text-primary-text' : 'text-tertiary-text'"
                >
                  {{ row.shift }}
                </span>
              </td>

              <!-- Time In/Out Column -->
              <td class="px-3 md:px-6 py-2 md:py-3 text-left">
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center gap-1.5">
                    <span
                      class="md:hidden text-[6px] font-semibold text-tertiary-text  w-5 shrink-0"
                      >Vào:</span
                    >
                    <code
                      v-if="row.displayCheckIn !== '—'"
                      class="text-[9px] md:text-[11px] font-mono font-semibold bg-surface md:bg-muted px-1 md:px-2 py-0.5 md:py-1 rounded text-secondary-text"
                    >
                      {{ row.displayCheckIn }}
                    </code>
                    <span v-else class="text-muted-foreground/40 font-mono text-[9px] md:text-xs"
                      >--:--:--</span
                    >
                  </div>
                  <div class="md:hidden flex items-center gap-1.5 border-t border-border-subtle pt-1.5">
                    <span class="text-[6px] font-semibold text-tertiary-text  w-5 shrink-0"
                      >Ra :</span
                    >
                    <code
                      v-if="row.displayCheckOut !== '—'"
                      class="text-[9px] font-mono font-semibold bg-surface px-1 py-0.5 rounded text-secondary-text"
                    >
                      {{ row.displayCheckOut }}
                    </code>
                    <span v-else class="text-muted-foreground/40 font-mono text-[9px]">--:--:--</span>
                  </div>
                </div>
              </td>

              <!-- Out Column (Desktop only) -->
              <td class="hidden md:table-cell px-6 py-3">
                <code
                  v-if="row.displayCheckOut !== '—'"
                  class="text-[11px] font-mono font-semibold bg-muted px-2 py-1 rounded-lg text-secondary-text"
                >
                  {{ row.displayCheckOut }}
                </code>
                <span v-else class="text-muted-foreground/40 font-mono text-xs">--:--:--</span>
              </td>

              <!-- Status Column -->
              <td class="px-3 md:px-6 py-3 text-center">
                <Badge
                  :class="[
                    getStatusBadge(row.status, row.lateMinutes, row.isToday).class,
                    'h-5 md:h-6 px-1 md:px-3 rounded md:rounded-lg font-semibold  text-[7px] md:text-[9px] tracking-normal border-none whitespace-nowrap',
                  ]"
                >
                  <span class="md:hidden text-[6px]">{{
                    getStatusBadge(row.status, row.lateMinutes, row.isToday).label.substring(0, 4)
                  }}</span>
                  <span class="hidden md:inline">{{
                    getStatusBadge(row.status, row.lateMinutes, row.isToday).label
                  }}</span>
                </Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
