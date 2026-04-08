<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight, Clock, Coffee, Calendar as CalendarIcon } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

interface UserShift {
  name: string
  start: string
  end: string
  short: string
}

const scheduleMap: Record<string, UserShift> = {
  '2026-04-01': { name: 'Ca hành chính', start: '08:00', end: '17:00', short: 'HC' },
  '2026-04-02': { name: 'Ca hành chính', start: '08:00', end: '17:00', short: 'HC' },
  '2026-04-07': { name: 'Ca sáng', start: '07:00', end: '12:00', short: 'SA' },
  '2026-04-08': { name: 'Ca sáng', start: '07:00', end: '12:00', short: 'SA' },
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
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6
  const days: CalendarDay[] = []
  for (let i = 0; i < startDow; i++) days.push({ date: null, key: `pad-${i}` })
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dow = new Date(currentYear.value, currentMonth.value, d).getDay()
    const key = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      date: d,
      key,
      isToday: key === todayKey,
      isWeekend: dow === 0 || dow === 6,
      schedule: scheduleMap[key] ?? null,
    })
  }
  return days
})

const selectedKey = ref<string | null>(todayKey)
const selectedShift = computed(() => selectedKey.value ? scheduleMap[selectedKey.value] : null)

const selectDay = (day: CalendarDay) => {
  if (day.date) selectedKey.value = day.key
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Lịch làm việc</h1>
        <p class="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Lịch phân ca cá nhân theo tháng</p>
      </div>

      <div class="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
        <Button variant="ghost" size="icon" @click="prevMonth" class="h-8 w-8">
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <div class="px-4 text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 min-w-[140px] text-center">
          {{ monthLabel }}
        </div>
        <Button variant="ghost" size="icon" @click="nextMonth" class="h-8 w-8">
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Calendar Grid -->
      <Card class="lg:col-span-2 overflow-hidden border-border shadow-none">
        <div class="grid grid-cols-7 border-b bg-slate-50/50 dark:bg-slate-900/50">
          <div v-for="d in ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']" :key="d"
            class="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            {{ d }}
          </div>
        </div>
        <div class="grid grid-cols-7">
          <div v-for="day in calendarDays" :key="day.key" @click="selectDay(day)"
            :class="[
              'relative min-h-[80px] p-2 border-b border-r border-slate-100 dark:border-slate-800 transition-all cursor-pointer',
              day.isToday ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : '',
              selectedKey === day.key ? 'bg-indigo-50/80 dark:bg-indigo-950/40 ring-1 ring-inset ring-indigo-500' : '',
              !day.date ? 'bg-slate-50/20 pointer-events-none' : ''
            ]">
            <span v-if="day.date"
              :class="['text-xs font-bold', day.isToday ? 'text-indigo-600' : 'text-slate-600 dark:text-slate-400']">
              {{ day.date }}
            </span>

            <div v-if="day.schedule" class="mt-2">
              <Badge class="w-full text-[9px] font-bold px-1.2 py-0 h-4 justify-center bg-indigo-100 text-indigo-700 border-none">
                {{ day.schedule.short }}
              </Badge>
            </div>
            <div v-if="day.isWeekend && day.date" class="mt-2">
               <Badge variant="secondary" class="w-full text-[9px] font-bold px-1.2 py-0 h-4 justify-center opacity-50 border-none">OFF</Badge>
            </div>
          </div>
        </div>
      </Card>

      <!-- Sidebar Info -->
      <div class="space-y-4">
        <Card class="border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/10 shadow-none">
          <CardHeader class="py-4">
            <CardTitle class="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Chi tiết ngày {{ selectedKey?.split('-').reverse().join('/') }}</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="selectedShift" class="space-y-4">
              <h3 class="text-xl font-black text-slate-900 dark:text-white">{{ selectedShift.name }}</h3>
              <div class="grid gap-3">
                <div class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-indigo-100 dark:border-indigo-900/50">
                  <Clock class="h-4 w-4 text-indigo-500" />
                  <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Thời gian</p>
                    <p class="text-sm font-black text-slate-800 dark:text-slate-200">{{ selectedShift.start }} — {{ selectedShift.end }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-indigo-100 dark:border-indigo-900/50">
                  <Coffee class="h-4 w-4 text-amber-500" />
                  <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Nghỉ trưa</p>
                    <p class="text-sm font-black text-slate-800 dark:text-slate-200">12:00 — 13:00</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8">
               <CalendarIcon class="h-8 w-8 text-slate-200 mx-auto mb-2" />
               <p class="text-sm font-bold text-slate-400">Ngày này chưa có lịch làm việc</p>
            </div>
          </CardContent>
        </Card>

        <!-- Legend Card -->
        <Card class="shadow-none border-border">
          <CardHeader class="py-4">
            <CardTitle class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Chú thích</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
             <div class="flex items-center justify-between text-xs font-bold">
               <div class="flex items-center gap-3">
                 <Badge class="h-4 w-10 bg-indigo-100 text-indigo-700 border-none p-0 flex justify-center text-[9px]">HC</Badge>
                 <span class="text-slate-600 dark:text-slate-400">Ca hành chính</span>
               </div>
               <span class="text-slate-400 font-mono">08:00-17:00</span>
             </div>
             <div class="flex items-center justify-between text-xs font-bold">
               <div class="flex items-center gap-3">
                 <Badge class="h-4 w-10 bg-indigo-100 text-indigo-700 border-none p-0 flex justify-center text-[9px]">SA</Badge>
                 <span class="text-slate-600 dark:text-slate-400">Ca sáng</span>
               </div>
               <span class="text-slate-400 font-mono">07:00-12:00</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
