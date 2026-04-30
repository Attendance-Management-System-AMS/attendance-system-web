<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { useMyAttendance } from '@/modules/attendance/composables/useMyAttendance'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

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

const { scheduleQuery } = useMyAttendance()

const scheduleErrorMessage = computed(() =>
  scheduleQuery.isError.value
    ? getApiErrorMessage(
        scheduleQuery.error.value,
        'Không tải được lịch làm việc của bạn. Kiểm tra lại liên kết tài khoản nhân viên.',
      )
    : '',
)

interface UserShift {
  id: number
  dayOfWeek: number
  effectiveFrom: string
  effectiveTo?: string | null
  name: string
  start: string
  end: string
  short: string
}

const normalizedSchedules = computed<UserShift[]>(() =>
  (scheduleQuery.data.value ?? [])
    .filter(
      (item) =>
        item.isActive &&
        item.dayOfWeek != null &&
        item.effectiveFrom &&
        item.shiftName &&
        item.startTime &&
        item.endTime,
    )
    .map((item) => ({
      id: item.id,
      dayOfWeek: item.dayOfWeek,
      effectiveFrom: item.effectiveFrom,
      effectiveTo: item.effectiveTo ?? null,
      name: item.shiftName,
      start: item.startTime.substring(0, 5),
      end: item.endTime.substring(0, 5),
      short: item.shiftName
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2),
    })),
)

function toDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year ?? today.getFullYear(), (month ?? 1) - 1, day ?? 1)
}

function isScheduleActiveOnDate(item: UserShift, dateObj: Date) {
  const startTime = toDateOnly(item.effectiveFrom).getTime()
  if (startTime > dateObj.getTime()) {
    return false
  }

  if (!item.effectiveTo) {
    return true
  }

  return toDateOnly(item.effectiveTo).getTime() >= dateObj.getTime()
}

function resolveScheduleForDate(dateObj: Date) {
  const normalizedDow = dateObj.getDay() === 0 ? 7 : dateObj.getDay()

  return normalizedSchedules.value
    .filter((item) => item.dayOfWeek === normalizedDow)
    .filter((item) => isScheduleActiveOnDate(item, dateObj))
    .sort((left, right) => right.effectiveFrom.localeCompare(left.effectiveFrom))[0] ?? null
}

const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

interface CalendarDay {
  date: number | null
  key: string
  isToday?: boolean
  isWeekend?: boolean
  schedule?: UserShift | null
}

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  
  // startDow: 0 for Mon, 1 for Tue... 6 for Sun
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const days: CalendarDay[] = []
  for (let i = 0; i < startDow; i++) days.push({ date: null, key: `pad-${i}` })
  
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateObj = new Date(currentYear.value, currentMonth.value, d)
    // Backend quy ước: 1=Thứ 2 ... 7=Chủ nhật.
    const normalizedDow = dateObj.getDay() === 0 ? 7 : dateObj.getDay()

    const key = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      date: d,
      key,
      isToday: key === todayKey,
      isWeekend: dateObj.getDay() === 0 || dateObj.getDay() === 6,
      schedule: resolveScheduleForDate(dateObj),
    })
  }
  return days
})

const visibleSchedules = computed(() => {
  const monthStart = new Date(currentYear.value, currentMonth.value, 1)
  const monthEnd = new Date(currentYear.value, currentMonth.value + 1, 0)
  const schedulesByDay = new Map<number, UserShift>()

  normalizedSchedules.value
    .filter((item) => toDateOnly(item.effectiveFrom).getTime() <= monthEnd.getTime())
    .filter((item) => !item.effectiveTo || toDateOnly(item.effectiveTo).getTime() >= monthStart.getTime())
    .sort((left, right) => right.effectiveFrom.localeCompare(left.effectiveFrom))
    .forEach((item) => {
      if (!schedulesByDay.has(item.dayOfWeek)) {
        schedulesByDay.set(item.dayOfWeek, item)
      }
    })

  return Array.from(schedulesByDay.values()).sort((left, right) => left.dayOfWeek - right.dayOfWeek)
})

const selectedKey = ref<string | null>(todayKey)
const selectedDayData = computed(() => calendarDays.value.find(d => d.key === selectedKey.value))
const selectedShift = computed(() => selectedDayData.value?.schedule)

const selectDay = (day: CalendarDay) => {
  if (day.date) selectedKey.value = day.key
}
</script>

<template>
  <div class="space-y-5 lg:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-primary-text dark:text-primary-text tracking-normal">Lịch làm việc</h1>
        <p class="text-[10px]  font-bold tracking-normal text-tertiary-text mt-1">Lịch phân ca cá nhân theo tháng</p>
      </div>

      <div class="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm">
        <Button variant="ghost" size="icon" @click="prevMonth" class="h-8 w-8">
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <div class="px-4 text-[11px] font-semibold  tracking-normal text-primary-text dark:text-primary-text min-w-35 text-center">
          {{ monthLabel }}
        </div>
        <Button variant="ghost" size="icon" @click="nextMonth" class="h-8 w-8">
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <div v-if="scheduleQuery.isLoading.value" class="flex h-64 items-center justify-center">
       <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <Card v-else-if="scheduleQuery.isError.value" class="border-rose-200 bg-rose-50 shadow-none dark:border-rose-900/40 dark:bg-rose-950/20">
      <CardContent class="py-10 text-center">
        <CalendarIcon class="mx-auto mb-3 h-8 w-8 text-rose-500" />
        <p class="text-sm font-semibold text-rose-700 dark:text-rose-300">Không tải được lịch làm việc</p>
        <p class="mt-2 text-sm text-rose-600 dark:text-rose-400">
          {{ scheduleErrorMessage }}
        </p>
      </CardContent>
    </Card>

    <div v-else class="grid gap-6 lg:grid-cols-3">
      <!-- Calendar Grid -->
      <Card class="overflow-hidden border-border-standard shadow-none lg:col-span-2">
        <div class="grid grid-cols-7 border-b border-border-subtle bg-surface/50">
          <div v-for="d in ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']" :key="d"
            class="py-3 text-center text-xs font-semibold text-tertiary-text">
            {{ d }}
          </div>
        </div>
        <div class="grid grid-cols-7">
          <div v-for="day in calendarDays" :key="day.key" @click="selectDay(day)"
            :class="[
              'relative min-h-[76px] cursor-pointer border-b border-r border-border-subtle p-1.5 transition-all hover:bg-elevated/60 sm:min-h-[96px] sm:p-2.5',
              day.isToday ? 'bg-primary/5' : '',
              selectedKey === day.key ? 'bg-primary/10 ring-1 ring-inset ring-primary' : '',
              !day.date ? 'bg-surface/20 pointer-events-none' : ''
            ]">
            <span v-if="day.date"
              :class="['text-xs font-bold', day.isToday ? 'text-primary' : 'text-secondary-text dark:text-tertiary-text']">
              {{ day.date }}
            </span>

            <div v-if="day.schedule" class="mt-2">
              <Badge class="h-5 w-full justify-center rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0 text-[10px] font-semibold text-primary">
                {{ day.schedule.short }}
              </Badge>
            </div>
            <div v-if="day.isWeekend && day.date && !day.schedule" class="mt-2">
               <Badge variant="secondary" class="h-5 w-full justify-center rounded-md border-none px-1.5 py-0 text-[10px] font-semibold opacity-60">OFF</Badge>
            </div>
          </div>
        </div>
      </Card>

      <!-- Sidebar Info -->
      <div class="space-y-4">
        <Card class="border-primary/20 bg-primary/10 shadow-none">
          <CardHeader class="py-4">
            <CardTitle class="text-xs font-semibold text-primary">Chi tiết ngày {{ selectedKey?.split('-').reverse().join('/') }}</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="selectedShift" class="space-y-4">
              <h3 class="text-xl font-semibold text-primary-text dark:text-primary-text">{{ selectedShift.name }}</h3>
              <div class="grid gap-3">
                <div class="flex items-center gap-3 rounded-lg border border-primary/20 bg-card p-3">
                   <Clock class="h-4 w-4 text-primary" />
                   <div>
                     <p class="text-xs font-medium text-tertiary-text">Thời gian</p>
                     <p class="text-sm font-semibold text-primary-text dark:text-primary-text">{{ selectedShift.start }} — {{ selectedShift.end }}</p>
                   </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8">
               <CalendarIcon class="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
               <p class="text-sm font-bold text-tertiary-text">Ngày này chưa có lịch làm việc</p>
            </div>
          </CardContent>
        </Card>

        <!-- Legend Card -->
        <Card class="border-border-standard shadow-none">
          <CardHeader class="py-4">
            <CardTitle class="text-xs font-semibold text-tertiary-text">Ca làm việc của bạn</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
             <div v-if="visibleSchedules.length === 0" class="text-xs text-tertiary-text italic">Chưa có dữ liệu ca làm việc trong tháng này</div>
             <div v-for="item in visibleSchedules" :key="item.id" class="flex items-center justify-between rounded-lg border border-border-subtle bg-surface/40 px-3 py-2 text-xs font-medium">
               <div class="flex items-center gap-3">
                 <Badge class="flex h-5 w-10 justify-center border border-primary/20 bg-primary/10 p-0 text-[9px] text-primary">
                   {{ item.short }}
                 </Badge>
                 <span class="text-secondary-text dark:text-tertiary-text">{{ item.name }}</span>
               </div>
               <span class="text-tertiary-text font-mono">{{ item.start }}-{{ item.end }}</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
