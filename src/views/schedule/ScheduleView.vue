<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight, Edit3, Eye, X, Search, Plus, Calendar as CalendarIcon } from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import { useEmployees } from '@/composables/useEmployees'
import { useSchedules } from '@/composables/useSchedules'
import { useShifts } from '@/composables/useShifts'
import { useDepartments } from '@/composables/useDepartments'
import type { Schedule } from '@/types/schedule'
import type { Shift } from '@/types/shift'
import type { Employee } from '@/types/employee'
import type { Department } from '@/types/department'
import type { Page } from '@/types/api'

interface ScheduleWithShift extends Schedule {
  shift?: Shift
}

const { employeesQuery } = useEmployees()
const { shiftsQuery } = useShifts()
const { departmentsQuery } = useDepartments()
const { schedulesQuery } = useSchedules(null, { size: 1000 })

const employees = computed<Employee[]>(() => employeesQuery.data.value?.content ?? [])
const shifts = computed<Shift[]>(() => (shiftsQuery.data.value ?? []) as Shift[])
const schedules = computed<Schedule[]>(() => {
  const data = schedulesQuery.data.value as Page<Schedule> | undefined
  return data?.content ?? []
})
const departments = computed<Department[]>(() => {
  const data = departmentsQuery.data.value as Page<Department> | undefined
  return data?.content ?? []
})

const currentDate = ref(new Date())
const itemsPerPage = 20
const currentPage = ref(1)
const searchQuery = ref('')
const filterDepartment = ref('')

const selectedEmployeeId = ref<number | null>(null)
const selectedEmployee = computed(() => employees.value.find((e: Employee) => e.id === selectedEmployeeId.value))

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

const weekStart = computed(() => startOfWeekMonday(currentDate.value))
const weekDays = computed(() => {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(weekStart.value, i)
    return {
      ymd: fmtYmd(d),
      dayLabel: fmtDayLabel(d),
      dayNumber: d.getDate(),
      isToday: fmtYmd(d) === fmtYmd(new Date()),
      isWeekend: d.getDay() === 0 || d.getDay() === 6
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

const filteredEmployees = computed(() => {
  let filtered = employees.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter((e: Employee) => e.fullName.toLowerCase().includes(q) || e.employeeCode.toLowerCase().includes(q))
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

const appliesToDate = (schedule: Schedule, ymd: string): boolean => {
  if (schedule.isActive === false) return false
  const currentDateStr = ymd.slice(0, 10)
  if (schedule.date) return normalizeYmd(schedule.date) === currentDateStr

  const effectiveFromStr = normalizeYmd(schedule.effectiveFrom)
  if (schedule.dayOfWeek === undefined || schedule.dayOfWeek === null || !effectiveFromStr) return false
  if (currentDateStr < effectiveFromStr) return false

  const parsedDate = new Date(ymd)
  const weekday = parsedDate.getDay()
  const currentDayOfWeek = weekday === 0 ? 8 : weekday + 1
  return Number(schedule.dayOfWeek) === Number(currentDayOfWeek)
}

const getSchedulesForEmployeeDate = (employee: Employee, date: string): ScheduleWithShift[] => {
  return enrichedSchedules.value.filter(
    (s) => String(s.employeeId) === String(employee.id) && appliesToDate(s, date),
  )
}

const getShiftBadgeStyle = (shiftName?: string) => {
  const name = (shiftName ?? '').toLowerCase()
  if (name.includes('hành chính')) return 'bg-indigo-50 text-indigo-600 border-indigo-100'
  if (name.includes('sáng')) return 'bg-emerald-50 text-emerald-600 border-emerald-100'
  if (name.includes('chiều')) return 'bg-amber-50 text-amber-600 border-amber-100'
  if (name.includes('đêm')) return 'bg-violet-50 text-violet-600 border-violet-100'
  return 'bg-slate-50 text-slate-500 border-slate-100'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div class="space-y-1">
            <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Lịch làm việc</h1>
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-0.5">Quản lý phân công ca hàng tuần</p>
        </div>

        <div class="flex flex-wrap items-center gap-4">
            <!-- Navigation & Date Range Group -->
            <div class="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-border p-1 shadow-sm">
                <Button variant="ghost" size="icon" @click="movePeriod(-1)" class="h-8 w-8 hover:bg-slate-50">
                    <ChevronLeft class="h-4 w-4" />
                </Button>
                
                <div class="px-4 flex flex-col items-center min-w-[160px] border-x border-slate-100 dark:border-slate-800">
                    <span class="text-[13px] font-black text-indigo-600 tabular-nums tracking-tight">{{ weekRangeLabel }}</span>
                    <button @click="currentDate = new Date()" class="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors">Hôm nay</button>
                </div>

                <Button variant="ghost" size="icon" @click="movePeriod(1)" class="h-8 w-8 hover:bg-slate-50">
                    <ChevronRight class="h-4 w-4" />
                </Button>
            </div>

            <!-- Global Actions -->
            <div class="flex items-center gap-2">
                <Button as-child class="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none font-bold rounded-xl gap-2">
                    <RouterLink to="/schedule/assignments">
                        <Plus class="h-4 w-4" />
                        Phân công ca
                    </RouterLink>
                </Button>
            </div>
        </div>
    </div>

    <!-- Filter Bar -->
    <div class="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-border/50">
        <div class="flex flex-wrap items-center gap-3">
            <div class="relative group">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                    v-model="searchQuery"
                    placeholder="Tìm nhân viên..."
                    class="h-9 pl-9 pr-4 rounded-xl border border-border bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all w-full sm:w-48"
                />
            </div>
            <select v-model="filterDepartment" class="h-9 rounded-xl border border-border bg-white dark:bg-slate-950 px-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                <option value="">Tất cả phòng ban</option>
                <option v-for="d in departments" :key="d.id" :value="String(d.id)">{{ d.name }}</option>
            </select>
        </div>
        
        <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span class="size-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Dữ liệu thời gian thực
        </div>
    </div>

    <Card class="overflow-hidden border-border shadow-none">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <th class="sticky left-0 z-20 w-60 bg-slate-50 dark:bg-slate-900 border-r border-border px-6 py-4 text-left">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Nhân viên</span>
              </th>
              <th v-for="day in weekDays" :key="day.ymd"
                :class="['px-4 py-3 text-center border-r border-border min-w-[140px]', day.isToday ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : '']">
                <div class="flex flex-col items-center">
                    <span class="text-[9px] font-black uppercase tracking-widest" :class="day.isToday ? 'text-indigo-600' : 'text-slate-400'">{{ day.dayLabel }}</span>
                    <span class="text-lg font-black mt-0.5" :class="day.isToday ? 'text-indigo-600' : 'text-slate-800 dark:text-slate-200'">{{ day.dayNumber }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="employee in paginatedEmployees" :key="employee.id"
                class="group hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors cursor-pointer"
                @click="selectedEmployeeId = employee.id">
              <td class="sticky left-0 z-10 bg-white dark:bg-slate-950 border-r border-border px-6 py-4">
                <div class="flex items-center gap-3">
                   <Avatar class="h-9 w-9 border border-indigo-50">
                      <AvatarImage :src="`/api/avatar/${employee.id}`" />
                      <AvatarFallback class="bg-indigo-50 text-indigo-600 text-[10px] font-black">
                        {{ employee.fullName.split(' ').map((n: string) => n[0]).slice(-2).join('').toUpperCase() }}
                      </AvatarFallback>
                   </Avatar>
                   <div class="min-w-0">
                      <p class="text-sm font-black text-slate-800 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{{ employee.fullName }}</p>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ employee.departmentName || '—' }}</p>
                   </div>
                </div>
              </td>
              <td v-for="day in weekDays" :key="day.ymd"
                :class="['px-3 py-4 align-top border-r border-border text-center', day.isToday ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : '']">
                <div class="space-y-1.5 flex flex-col items-center">
                    <div v-for="s in getSchedulesForEmployeeDate(employee, day.ymd)" :key="s.id"
                        class="w-full text-[10px] font-black p-2 rounded-lg border text-center transition-all shadow-sm hover:shadow-md"
                        :class="getShiftBadgeStyle(s.shift?.name)">
                        <p class="uppercase tracking-tight leading-none mb-1">{{ s.shift?.name }}</p>
                        <p class="font-mono text-[9px] opacity-70">{{ s.shift?.startTime?.slice(0,5) }}-{{ s.shift?.endTime?.slice(0,5) }}</p>
                    </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <div v-if="totalPagesCount > 1" class="flex justify-between items-center bg-card p-4 rounded-xl border border-border">
         <span class="text-xs font-bold text-slate-400 uppercase">Trang {{ currentPage }} / {{ totalPagesCount }}</span>
         <div class="flex gap-2">
            <Button variant="outline" size="sm" :disabled="currentPage === 1" @click="currentPage--">Trước</Button>
            <Button variant="outline" size="sm" :disabled="currentPage === totalPagesCount" @click="currentPage++">Sau</Button>
         </div>
    </div>

    <!-- Side Panel -->
    <Teleport to="body">
       <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="translate-x-full" leave-to-class="translate-x-full" leave-active-class="transition duration-200 ease-in">
          <div v-if="selectedEmployee" class="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white dark:bg-slate-950 shadow-2xl border-l border-border flex flex-col">
             <div class="p-6 border-b flex items-center justify-between">
                <div class="flex items-center gap-3">
                   <div class="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                      <CalendarIcon class="h-5 w-5" />
                   </div>
                   <h3 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">Chi tiết lịch biểu</h3>
                </div>
                <Button variant="ghost" size="icon" @click="selectedEmployeeId = null" class="h-8 w-8"><X class="h-5 w-5" /></Button>
             </div>

             <div class="flex-1 overflow-y-auto p-6 space-y-6">
                <!-- Profile Mini -->
                <div class="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-border">
                   <Avatar class="h-20 w-20 border-4 border-white dark:border-slate-800 shadow-xl mb-4">
                      <AvatarFallback class="bg-indigo-600 text-white text-2xl font-black">
                        {{ selectedEmployee.fullName.split(' ').map((n: string) => n[0]).slice(-2).join('').toUpperCase() }}
                      </AvatarFallback>
                   </Avatar>
                   <h4 class="text-xl font-black text-slate-800 dark:text-white">{{ selectedEmployee.fullName }}</h4>
                   <Badge variant="secondary" class="mt-2 bg-indigo-100 text-indigo-600 border-none font-bold tabular-nums dark:bg-indigo-950">{{ selectedEmployee.employeeCode }}</Badge>
                </div>

                <div class="space-y-4">
                   <h5 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ca làm việc trong tuần</h5>
                   <div class="space-y-3">
                      <div v-for="day in weekDays" :key="day.ymd" class="flex items-center gap-4 p-3 rounded-xl border border-border bg-white dark:bg-slate-900 hover:border-indigo-200 transition-colors">
                         <div class="w-12 text-center text-[10px] font-black uppercase tracking-tight text-slate-400 border-r pr-3">{{ day.dayLabel }}<br><span class="text-slate-800 dark:text-slate-200">{{ day.dayNumber }}</span></div>
                         <div class="flex-1">
                            <div v-if="getSchedulesForEmployeeDate(selectedEmployee, day.ymd).length" class="space-y-1">
                               <div v-for="s in getSchedulesForEmployeeDate(selectedEmployee, day.ymd)" :key="s.id" class="flex items-center justify-between">
                                  <span class="text-xs font-black text-slate-700 dark:text-slate-200">{{ s.shift?.name }}</span>
                                  <Badge variant="outline" class="text-[9px] font-mono border-slate-200">{{ s.shift?.startTime?.slice(0,5) }} — {{ s.shift?.endTime?.slice(0,5) }}</Badge>
                               </div>
                            </div>
                            <p v-else class="text-[11px] font-bold text-slate-300 italic">Nghỉ / Chưa gán ca</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div class="p-6 border-t bg-slate-50/30 dark:bg-slate-900/30 flex gap-3">
                <Button class="flex-1 bg-indigo-600 hover:bg-indigo-700 font-bold gap-2"><Edit3 class="h-4 w-4" /> Chỉnh sửa</Button>
                <Button variant="outline" class="flex-1 font-bold gap-2"><Eye class="h-4 w-4" /> Lịch sử</Button>
             </div>
          </div>
       </Transition>
    </Teleport>
  </div>
</template>
