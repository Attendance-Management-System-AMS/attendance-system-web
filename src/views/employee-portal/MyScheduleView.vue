<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Coffee, FileText } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const monthLabel = computed(() =>
  new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(new Date(currentYear.value, currentMonth.value, 1)),
)
const prevMonth = () => { if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- } else currentMonth.value-- }
const nextMonth = () => { if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ } else currentMonth.value++ }

const scheduleMap: Record<string, { name: string; start: string; end: string; color: string; short: string }> = {
  '2026-04-01': { name: 'Ca hành chính', start: '08:00', end: '17:00', color: 'indigo', short: 'HC' },
  '2026-04-02': { name: 'Ca hành chính', start: '08:00', end: '17:00', color: 'indigo', short: 'HC' },
  '2026-04-03': { name: 'Ca hành chính', start: '08:00', end: '17:00', color: 'indigo', short: 'HC' },
  '2026-04-04': { name: 'Ca hành chính', start: '08:00', end: '17:00', color: 'indigo', short: 'HC' },
  '2026-04-07': { name: 'Ca hành chính', start: '08:00', end: '17:00', color: 'indigo', short: 'HC' },
  '2026-04-08': { name: 'Ca hành chính', start: '08:00', end: '17:00', color: 'indigo', short: 'HC' },
  '2026-04-09': { name: 'Ca hành chính', start: '08:00', end: '17:00', color: 'indigo', short: 'HC' },
  '2026-04-10': { name: 'Ca hành chính', start: '08:00', end: '17:00', color: 'indigo', short: 'HC' },
  '2026-04-11': { name: 'Ca hành chính', start: '08:00', end: '17:00', color: 'indigo', short: 'HC' },
  '2026-04-14': { name: 'Ca sáng', start: '07:00', end: '12:00', color: 'amber', short: 'SA' },
  '2026-04-15': { name: 'Ca sáng', start: '07:00', end: '12:00', color: 'amber', short: 'SA' },
  '2026-04-16': { name: 'Ca sáng', start: '07:00', end: '12:00', color: 'amber', short: 'SA' },
  '2026-04-17': { name: 'Ca sáng', start: '07:00', end: '12:00', color: 'amber', short: 'SA' },
  '2026-04-18': { name: 'Ca sáng', start: '07:00', end: '12:00', color: 'amber', short: 'SA' },
  '2026-04-21': { name: 'Ca hành chính', start: '08:00', end: '17:00', color: 'indigo', short: 'HC' },
  '2026-04-22': { name: 'Ca hành chính', start: '08:00', end: '17:00', color: 'indigo', short: 'HC' },
  '2026-04-23': { name: 'Ca hành chính', start: '08:00', end: '17:00', color: 'indigo', short: 'HC' },
  '2026-04-24': { name: 'Ca đêm', start: '22:00', end: '06:00', color: 'violet', short: 'ĐÊM' },
  '2026-04-25': { name: 'Ca đêm', start: '22:00', end: '06:00', color: 'violet', short: 'ĐÊM' },
}
const holidayMap: Record<string, string> = { '2026-04-30': 'Nghỉ lễ' }

const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  let startDow = firstDay.getDay() - 1; if (startDow < 0) startDow = 6
  const days = []
  for (let i = 0; i < startDow; i++) days.push({ date: null, key: `pad-${i}` })
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dow = new Date(currentYear.value, currentMonth.value, d).getDay()
    const key = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ date: d, key, isToday: key === todayKey, isWeekend: dow === 0 || dow === 6, schedule: scheduleMap[key] ?? null, holiday: holidayMap[key] ?? null })
  }
  return days
})

const selectedKey = ref<string | null>(null)
const selectedShift = computed(() => selectedKey.value ? scheduleMap[selectedKey.value] ?? null : null)
const selectedDate = computed(() => selectedKey.value ?? null)
const selectDay = (day: { date: number | null; key: string; isWeekend?: boolean }) => {
  if (!day.date || day.isWeekend) return
  selectedKey.value = selectedKey.value === day.key ? null : day.key
}

const colorMap: Record<string, string> = {
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  amber:  'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
}
</script>

<template>
  <div class="min-h-screen space-y-4 px-4 py-4 sm:px-6 sm:py-6">

    <!-- Header + Nav -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-black text-slate-900 dark:text-white">Lịch của tôi</h1>
        <p class="text-xs text-slate-500">Lịch làm việc cá nhân theo tháng</p>
      </div>
      <div class="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900">
        <button @click="prevMonth" class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800">
          <ChevronLeft class="h-4 w-4" />
        </button>
        <span class="min-w-[110px] text-center text-xs font-bold capitalize text-slate-700 dark:text-white">{{ monthLabel }}</span>
        <button @click="nextMonth" class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800">
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Calendar Card -->
    <div class="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
      <!-- Day-of-week headers -->
      <div class="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
        <div v-for="d in ['T2','T3','T4','T5','T6','T7','CN']" :key="d" class="py-2.5 text-center text-[10px] font-bold uppercase" :class="['T7','CN'].includes(d) ? 'text-rose-400' : 'text-slate-400'">{{ d }}</div>
      </div>

      <!-- Grid  -->
      <div class="grid grid-cols-7">
        <div
          v-for="day in calendarDays"
          :key="day.key"
          @click="selectDay(day)"
          :class="[
            'relative min-h-[52px] sm:min-h-[72px] p-1 border-b border-r border-slate-100 dark:border-slate-800 transition-colors',
            day.date && !day.isWeekend ? 'cursor-pointer' : '',
            day.isWeekend ? 'bg-slate-50/60 dark:bg-slate-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-indigo-50',
            day.isToday ? 'bg-indigo-50/80 dark:bg-indigo-950/30' : '',
            selectedKey === day.key ? 'ring-2 ring-inset ring-indigo-500' : '',
          ]"
        >
          <div v-if="day.date">
            <!-- Date number -->
            <div class="flex justify-between items-start mb-0.5">
              <span :class="['inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold', day.isToday ? 'bg-indigo-600 text-white' : day.isWeekend ? 'text-rose-400' : 'text-slate-600 dark:text-slate-300']">{{ day.date }}</span>
            </div>

            <!-- Holiday badge -->
            <div v-if="day.holiday" class="mt-0.5 rounded bg-rose-100 px-1 py-0.5 text-[8px] sm:text-[9px] font-bold text-rose-600 dark:bg-rose-950/40 truncate">
              {{ day.holiday }}
            </div>

            <!-- Shift badge: short code on mobile, full name on desktop -->
            <div v-else-if="day.schedule" :class="['mt-0.5 rounded px-1 py-0.5 text-[8px] sm:text-[9px] font-bold truncate', colorMap[day.schedule.color]]">
              <!-- Mobile: short code -->
              <span class="sm:hidden">{{ day.schedule.short }}</span>
              <!-- Desktop: name -->
              <span class="hidden sm:inline">{{ day.schedule.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend: compact horizontal scrollable -->
    <div class="flex gap-3 overflow-x-auto pb-0.5 text-[11px] scrollbar-hide">
      <span class="flex shrink-0 items-center gap-1.5 text-slate-500"><span class="h-2.5 w-2.5 rounded-sm bg-indigo-500"></span>HC (08:00-17:00)</span>
      <span class="flex shrink-0 items-center gap-1.5 text-slate-500"><span class="h-2.5 w-2.5 rounded-sm bg-amber-500"></span>Sáng (07:00-12:00)</span>
      <span class="flex shrink-0 items-center gap-1.5 text-slate-500"><span class="h-2.5 w-2.5 rounded-sm bg-violet-500"></span>Đêm (22:00-06:00)</span>
      <span class="flex shrink-0 items-center gap-1.5 text-slate-500"><span class="h-2.5 w-2.5 rounded-sm bg-rose-400"></span>Nghỉ lễ</span>
    </div>

    <!-- Selected day detail — below calendar on mobile -->
    <Transition name="slide-up">
      <div v-if="selectedKey" class="rounded-2xl border border-indigo-200 bg-white shadow-sm dark:border-indigo-900 dark:bg-slate-900">
        <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <p class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Chi tiết — {{ selectedDate }}</p>
          <button @click="selectedKey = null" class="text-slate-400 hover:text-slate-600"><ChevronRight class="h-4 w-4 rotate-90" /></button>
        </div>
        <div v-if="selectedShift" class="p-4 space-y-3">
          <p class="text-base font-black text-slate-900 dark:text-white">{{ selectedShift.name }}</p>
          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <Clock class="h-4 w-4 text-indigo-500 shrink-0" />
              <div>
                <p class="text-[10px] text-slate-400">Giờ làm</p>
                <p class="font-mono text-sm font-bold text-slate-900 dark:text-white">{{ selectedShift.start }}—{{ selectedShift.end }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <Coffee class="h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <p class="text-[10px] text-slate-400">Nghỉ trưa</p>
                <p class="font-mono text-sm font-bold text-slate-900 dark:text-white">12:00—13:00</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="p-4 text-center">
          <p class="text-sm text-slate-400 italic">Ngày này chưa có ca được gán.</p>
          <RouterLink to="/my/requests" class="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <FileText class="h-3 w-3" />Gửi yêu cầu
          </RouterLink>
        </div>
      </div>
    </Transition>

    <!-- Monthly summary (compact) -->
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p class="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Tóm tắt tháng</p>
      <div class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-sm bg-indigo-500"></span><span class="text-slate-600 dark:text-slate-400">Ca hành chính</span></div>
          <span class="font-bold text-indigo-700 dark:text-indigo-400">14 ngày</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-sm bg-amber-500"></span><span class="text-slate-600 dark:text-slate-400">Ca sáng</span></div>
          <span class="font-bold text-amber-700 dark:text-amber-400">5 ngày</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-sm bg-violet-500"></span><span class="text-slate-600 dark:text-slate-400">Ca đêm</span></div>
          <span class="font-bold text-violet-700 dark:text-violet-400">2 ngày</span>
        </div>
        <div class="flex items-center justify-between border-t border-slate-100 pt-2 text-sm dark:border-slate-800">
          <div class="flex items-center gap-2"><CheckCircle2 class="h-3.5 w-3.5 text-emerald-500" /><span class="font-medium text-slate-700 dark:text-slate-300">Tổng</span></div>
          <span class="font-black text-slate-900 dark:text-white">21 ngày</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(12px); }
</style>
