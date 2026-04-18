<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { useMyAttendance } from '@/modules/attendance/composables/useMyAttendance'

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

interface UserShift {
  name: string
  start: string
  end: string
  short: string
}

// Map dayOfWeek (1-7, 8=CN) to shift info from API
const scheduleMapByDay = computed(() => {
  const map: Record<number, UserShift> = {}
  if (!scheduleQuery.data.value) return map

  scheduleQuery.data.value.forEach(item => {
    map[item.dayOfWeek] = {
      name: item.shiftName,
      start: item.startTime.substring(0, 5),
      end: item.endTime.substring(0, 5),
      short: item.shiftName.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2)
    }
  })
  return map
})

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
      schedule: scheduleMapByDay.value[normalizedDow] ?? null,
    })
  }
  return days
})

const selectedKey = ref<string | null>(todayKey)
const selectedDayData = computed(() => calendarDays.value.find(d => d.key === selectedKey.value))
const selectedShift = computed(() => selectedDayData.value?.schedule)

const selectDay = (day: CalendarDay) => {
  if (day.date) selectedKey.value = day.key
}
</script>

<template>
  <div class="space-y-6">
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
        <div class="px-4 text-[11px] font-semibold  tracking-normal text-primary-text dark:text-primary-text min-w-[140px] text-center">
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

    <div v-else class="grid lg:grid-cols-3 gap-6">
      <!-- Calendar Grid -->
      <Card class="lg:col-span-2 overflow-hidden border-border shadow-none">
        <div class="grid grid-cols-7 border-b bg-surface/50 dark:bg-card/50">
          <div v-for="d in ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']" :key="d"
            class="py-3 text-center text-[10px] font-semibold  tracking-normal text-tertiary-text">
            {{ d }}
          </div>
        </div>
        <div class="grid grid-cols-7">
          <div v-for="day in calendarDays" :key="day.key" @click="selectDay(day)"
            :class="[
              'relative min-h-[80px] p-2 border-b border-r border-border-subtle dark:border-border transition-all cursor-pointer',
              day.isToday ? 'bg-primary/10 dark:bg-primary/10/20' : '',
              selectedKey === day.key ? 'bg-primary/10 dark:bg-primary/10 ring-1 ring-inset ring-primary' : '',
              !day.date ? 'bg-surface/20 pointer-events-none' : ''
            ]">
            <span v-if="day.date"
              :class="['text-xs font-bold', day.isToday ? 'text-primary' : 'text-secondary-text dark:text-tertiary-text']">
              {{ day.date }}
            </span>

            <div v-if="day.schedule" class="mt-2">
              <Badge class="w-full text-[9px] font-bold px-1.2 py-0 h-4 justify-center bg-primary/10 text-primary border-none">
                {{ day.schedule.short }}
              </Badge>
            </div>
            <div v-if="day.isWeekend && day.date && !day.schedule" class="mt-2">
               <Badge variant="secondary" class="w-full text-[9px] font-bold px-1.2 py-0 h-4 justify-center opacity-50 border-none">OFF</Badge>
            </div>
          </div>
        </div>
      </Card>

      <!-- Sidebar Info -->
      <div class="space-y-4">
        <Card class="border-primary/20 dark:border-primary/20/50 bg-primary/10 dark:bg-primary/10/10 shadow-none">
          <CardHeader class="py-4">
            <CardTitle class="text-[10px] font-bold  tracking-normal text-primary">Chi tiết ngày {{ selectedKey?.split('-').reverse().join('/') }}</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="selectedShift" class="space-y-4">
              <h3 class="text-xl font-semibold text-primary-text dark:text-primary-text">{{ selectedShift.name }}</h3>
              <div class="grid gap-3">
                <div class="flex items-center gap-3 p-3 rounded-lg bg-card dark:bg-background border border-primary/20 dark:border-primary/20/50">
                   <Clock class="h-4 w-4 text-primary" />
                   <div>
                     <p class="text-[10px] font-bold text-tertiary-text  tracking-normal">Thời gian</p>
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
        <Card class="shadow-none border-border">
          <CardHeader class="py-4">
            <CardTitle class="text-[10px] font-bold  tracking-normal text-tertiary-text">Ca làm việc của bạn</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
             <div v-if="scheduleQuery.data.value?.length === 0" class="text-xs text-tertiary-text italic">Chưa có dữ liệu ca làm việc</div>
             <div v-for="item in scheduleQuery.data.value" :key="item.id" class="flex items-center justify-between text-xs font-bold">
               <div class="flex items-center gap-3">
                 <Badge class="h-4 w-10 bg-primary/10 text-primary border-none p-0 flex justify-center text-[8px]">
                   {{ item.shiftName.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2) }}
                 </Badge>
                 <span class="text-secondary-text dark:text-tertiary-text">{{ item.shiftName }}</span>
               </div>
               <span class="text-tertiary-text font-mono">{{ item.startTime.substring(0, 5) }}-{{ item.endTime.substring(0, 5) }}</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
