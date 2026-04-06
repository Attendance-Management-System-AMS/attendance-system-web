<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, FileText, XCircle, AlertCircle, HelpCircle } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const monthLabel = computed(() =>
  new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(new Date(currentYear.value, currentMonth.value, 1)),
)

const prevMonth = () => { if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- } else currentMonth.value-- }
const nextMonth = () => { if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ } else currentMonth.value++ }

type AttendanceStatus = 'present' | 'late' | 'absent' | 'incomplete' | 'off' | 'holiday'

interface DayLog {
  date: string
  dayLabel: string
  shift: string
  shiftTime: string
  checkIn: string | null
  checkOut: string | null
  totalHours: number | null
  status: AttendanceStatus
  lateMinutes?: number
}

const mockLogs: DayLog[] = [
  { date: '01/04', dayLabel: 'T3', shift: 'Ca hành chính', shiftTime: '08:00-17:00', checkIn: '07:58', checkOut: '17:05', totalHours: 9.12, status: 'present' },
  { date: '02/04', dayLabel: 'T4', shift: 'Ca hành chính', shiftTime: '08:00-17:00', checkIn: '08:18', checkOut: '17:00', totalHours: 8.7, status: 'late', lateMinutes: 18 },
  { date: '03/04', dayLabel: 'T5', shift: 'Ca hành chính', shiftTime: '08:00-17:00', checkIn: '08:01', checkOut: '17:30', totalHours: 9.48, status: 'present' },
  { date: '04/04', dayLabel: 'T6', shift: 'Ca hành chính', shiftTime: '08:00-17:00', checkIn: '07:55', checkOut: null, totalHours: null, status: 'incomplete' },
  { date: '05/04', dayLabel: 'T7', shift: '—', shiftTime: '—', checkIn: null, checkOut: null, totalHours: null, status: 'off' },
  { date: '06/04', dayLabel: 'CN', shift: '—', shiftTime: '—', checkIn: null, checkOut: null, totalHours: null, status: 'off' },
  { date: '07/04', dayLabel: 'T2', shift: 'Ca hành chính', shiftTime: '08:00-17:00', checkIn: '08:00', checkOut: '17:00', totalHours: 9.0, status: 'present' },
  { date: '08/04', dayLabel: 'T3', shift: 'Ca hành chính', shiftTime: '08:00-17:00', checkIn: null, checkOut: null, totalHours: null, status: 'absent' },
  { date: '09/04', dayLabel: 'T4', shift: 'Ca hành chính', shiftTime: '08:00-17:00', checkIn: '08:05', checkOut: '17:10', totalHours: 9.08, status: 'present' },
  { date: '10/04', dayLabel: 'T5', shift: 'Ca hành chính', shiftTime: '08:00-17:00', checkIn: '08:02', checkOut: '17:00', totalHours: 8.97, status: 'present' },
]

const statusConfig: Record<AttendanceStatus, { label: string; bg: string; text: string; dot: string; icon: unknown }> = {
  present: { label: 'Đúng giờ', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', icon: CheckCircle2 },
  late:    { label: 'Đi muộn', bg: 'bg-amber-50 dark:bg-amber-950/30',   text: 'text-amber-700 dark:text-amber-400',   dot: 'bg-amber-500',   icon: Clock },
  absent:  { label: 'Vắng mặt', bg: 'bg-rose-50 dark:bg-rose-950/30',    text: 'text-rose-700 dark:text-rose-400',     dot: 'bg-rose-500',    icon: XCircle },
  incomplete: { label: 'Thiếu DL', bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-700 dark:text-violet-400', dot: 'bg-violet-500', icon: HelpCircle },
  off:     { label: 'Cuối tuần', bg: 'bg-slate-50 dark:bg-slate-800',    text: 'text-slate-400',                        dot: 'bg-slate-300',   icon: AlertCircle },
  holiday: { label: 'Nghỉ lễ', bg: 'bg-rose-50 dark:bg-rose-950/30',     text: 'text-rose-500',                         dot: 'bg-rose-400',    icon: AlertCircle },
}

const summary = computed(() => {
  const working = mockLogs.filter(l => l.status !== 'off' && l.status !== 'holiday')
  return {
    present: working.filter(l => l.status === 'present').length,
    late: working.filter(l => l.status === 'late').length,
    absent: working.filter(l => l.status === 'absent').length,
    incomplete: working.filter(l => l.status === 'incomplete').length,
    totalHours: working.reduce((sum, l) => sum + (l.totalHours ?? 0), 0).toFixed(1),
  }
})

// Selected log row for mobile detail
const expandedRow = ref<string | null>(null)
const toggleRow = (date: string) => {
  expandedRow.value = expandedRow.value === date ? null : date
}
</script>

<template>
  <div class="min-h-screen space-y-4 px-4 py-4 sm:px-6 sm:py-6">

    <!-- Header + Month Nav compact -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-black text-slate-900 dark:text-white">Bảng công của tôi</h1>
        <p class="text-xs text-slate-500">Lịch sử chấm công chi tiết</p>
      </div>
      <div class="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900">
        <button @click="prevMonth" class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800">
          <ChevronLeft class="h-4 w-4" />
        </button>
        <span class="min-w-[100px] text-center text-xs font-bold text-slate-700 dark:text-white capitalize">{{ monthLabel }}</span>
        <button @click="nextMonth" class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800">
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Summary strip: scrollable on mobile, 5-col flex -->
    <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <div class="flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 min-w-[90px]">
        <p class="text-[9px] font-bold uppercase text-slate-400">Đúng giờ</p>
        <p class="text-2xl font-black text-emerald-600">{{ summary.present }}</p>
      </div>
      <div class="flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 min-w-[90px]">
        <p class="text-[9px] font-bold uppercase text-slate-400">Đi muộn</p>
        <p class="text-2xl font-black text-amber-600">{{ summary.late }}</p>
      </div>
      <div class="flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 min-w-[90px]">
        <p class="text-[9px] font-bold uppercase text-slate-400">Vắng mặt</p>
        <p class="text-2xl font-black text-rose-600">{{ summary.absent }}</p>
      </div>
      <div class="flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 min-w-[90px]">
        <p class="text-[9px] font-bold uppercase text-slate-400">Thiếu DL</p>
        <p class="text-2xl font-black text-violet-600">{{ summary.incomplete }}</p>
      </div>
      <div class="flex-shrink-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/30 min-w-[90px]">
        <p class="text-[9px] font-bold uppercase text-emerald-600">Tổng giờ</p>
        <p class="text-2xl font-black text-emerald-700 dark:text-emerald-400">{{ summary.totalHours }}<span class="text-sm">h</span></p>
      </div>
    </div>

    <!-- Mobile: Card List -->
    <div class="block sm:hidden space-y-2">
      <div
        v-for="log in mockLogs"
        :key="log.date"
        @click="log.status !== 'off' && toggleRow(log.date)"
        :class="['rounded-2xl border bg-white transition-all dark:bg-slate-900', log.status === 'off' ? 'opacity-40 border-slate-100 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800 active:scale-[0.99] cursor-pointer', expandedRow === log.date ? 'shadow-md' : 'shadow-sm']"
      >
        <!-- Card Row -->
        <div class="flex items-center gap-3 px-4 py-3">
          <!-- Status dot + date -->
          <div class="flex flex-col items-center gap-1 shrink-0 w-10">
            <span :class="['h-2.5 w-2.5 rounded-full', statusConfig[log.status].dot]"></span>
            <p class="text-xs font-black text-slate-900 dark:text-white">{{ log.date.split('/')[0] }}</p>
            <p class="text-[9px] text-slate-400">{{ log.dayLabel }}</p>
          </div>

          <!-- Main info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-sm font-bold text-slate-900 dark:text-white">{{ log.shift }}</p>
              <span v-if="log.status !== 'off'" :class="['rounded-full px-2 py-0.5 text-[10px] font-bold', statusConfig[log.status].bg, statusConfig[log.status].text]">
                {{ statusConfig[log.status].label }}
                <span v-if="log.lateMinutes"> ({{ log.lateMinutes }}ph)</span>
              </span>
            </div>
            <div class="mt-0.5 flex gap-3 font-mono text-xs text-slate-500">
              <span>▶ {{ log.checkIn ?? '—' }}</span>
              <span>◼ {{ log.checkOut ?? '—' }}</span>
              <span v-if="log.totalHours" class="font-bold text-slate-700 dark:text-slate-300">{{ log.totalHours }}h</span>
            </div>
          </div>

          <!-- Action -->
          <RouterLink
            v-if="log.status === 'incomplete' || log.status === 'absent'"
            to="/my/requests"
            @click.stop
            class="shrink-0 rounded-xl bg-violet-100 p-2 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
          >
            <FileText class="h-4 w-4" />
          </RouterLink>
        </div>

        <!-- Expanded detail -->
        <Transition name="expand">
          <div v-if="expandedRow === log.date" class="border-t border-slate-100 dark:border-slate-800 px-4 py-3">
            <div class="grid grid-cols-2 gap-y-2 text-xs">
              <div><p class="text-slate-400">Ca làm</p><p class="font-semibold text-slate-700 dark:text-slate-300">{{ log.shift }}</p></div>
              <div><p class="text-slate-400">Giờ ca</p><p class="font-mono font-semibold text-slate-700 dark:text-slate-300">{{ log.shiftTime }}</p></div>
              <div><p class="text-slate-400">Chấm vào</p><p class="font-mono font-bold text-slate-900 dark:text-white">{{ log.checkIn ?? '—' }}</p></div>
              <div><p class="text-slate-400">Chấm ra</p><p class="font-mono font-bold text-slate-900 dark:text-white">{{ log.checkOut ?? '—' }}</p></div>
              <div><p class="text-slate-400">Tổng giờ</p><p class="font-black text-slate-900 dark:text-white">{{ log.totalHours ? `${log.totalHours}h` : '—' }}</p></div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Desktop: Table -->
    <div class="hidden sm:block rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800">
              <th class="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Ngày</th>
              <th class="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Ca làm</th>
              <th class="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Giờ vào</th>
              <th class="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Giờ ra</th>
              <th class="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Tổng</th>
              <th class="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Trạng thái</th>
              <th class="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="log in mockLogs" :key="log.date" :class="['transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30', log.status === 'off' ? 'opacity-40' : '']">
              <td class="px-5 py-3">
                <p class="text-sm font-bold text-slate-900 dark:text-white">{{ log.date }}</p>
                <p class="text-xs text-slate-400">{{ log.dayLabel }}</p>
              </td>
              <td class="px-5 py-3">
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ log.shift }}</p>
                <p class="text-xs font-mono text-slate-400">{{ log.shiftTime }}</p>
              </td>
              <td class="px-5 py-3 font-mono text-sm" :class="log.checkIn ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'">{{ log.checkIn ?? '—' }}</td>
              <td class="px-5 py-3 font-mono text-sm" :class="log.checkOut ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'">{{ log.checkOut ?? '—' }}</td>
              <td class="px-5 py-3 font-mono text-sm font-bold" :class="log.totalHours ? 'text-slate-900 dark:text-white' : 'text-slate-300'">{{ log.totalHours ? `${log.totalHours}h` : '—' }}</td>
              <td class="px-5 py-3">
                <div v-if="log.status !== 'off'" :class="['inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', statusConfig[log.status].bg, statusConfig[log.status].text]">
                  <component :is="statusConfig[log.status].icon" class="h-3.5 w-3.5" />
                  {{ statusConfig[log.status].label }}
                  <span v-if="log.lateMinutes">({{ log.lateMinutes }}ph)</span>
                </div>
              </td>
              <td class="px-5 py-3">
                <RouterLink
                  v-if="log.status === 'incomplete' || log.status === 'absent'"
                  to="/my/requests"
                  class="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[11px] font-bold text-violet-700 hover:bg-violet-100 transition-colors dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-400"
                >
                  <FileText class="h-3 w-3" />
                  Gửi đơn
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.expand-enter-active, .expand-leave-active { transition: all 0.2s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 200px; }
</style>
