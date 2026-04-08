<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  X,
  Search,
  Plus,
  Calendar as CalendarIcon,
  CalendarDays,
  Users,
  Clock,
  TrendingUp,
} from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import PageHeader from '@/components/ui/PageHeader.vue'

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

const selectedEmployeeId = ref<number | null>(null)
const selectedEmployee = computed(() =>
  employees.value.find((e: Employee) => e.id === selectedEmployeeId.value),
)

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

const appliesToDate = (schedule: Schedule, ymd: string): boolean => {
  if (schedule.isActive === false) return false
  const currentDateStr = ymd.slice(0, 10)
  if (schedule.date) return normalizeYmd(schedule.date) === currentDateStr

  const effectiveFromStr = normalizeYmd(schedule.effectiveFrom)
  if (schedule.dayOfWeek === undefined || schedule.dayOfWeek === null || !effectiveFromStr)
    return false
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
  <div class="space-y-6 p-4 sm:p-6">
    <PageHeader
      title="Lịch làm việc"
      description="Quản lý phân công ca hàng tuần • Hệ thống thời gian thực"
    >
      <template #actions>
        <div class="flex flex-wrap items-center gap-4">
          <!-- Date Navigator -->
          <div class="flex items-center bg-card rounded-xl border border-border p-1 shadow-none dark:bg-slate-900 dark:border-slate-800">
            <Button
              variant="ghost"
              size="icon"
              @click="movePeriod(-1)"
              class="h-9 w-9 hover:bg-muted dark:hover:bg-slate-800"
            >
              <ChevronLeft class="h-4 w-4" />
            </Button>

            <div class="px-6 flex flex-col items-center min-w-[180px] border-x border-border dark:border-slate-800">
              <span class="text-sm font-black text-primary tabular-nums tracking-tight">{{
                weekRangeLabel
              }}</span>
              <button
                @click="currentDate = new Date()"
                class="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
              >
                Tuần hiện tại
              </button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              @click="movePeriod(1)"
              class="h-9 w-9 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>

          <Button
            as-child
            class="h-11 px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-[11px] rounded-xl gap-2 text-primary-foreground"
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
      <Card
        v-for="s in [
          { label: 'Tổng số ca', value: 124, icon: CalendarDays },
          { label: 'Nhân viên', value: 48, icon: Users },
          { label: 'Giờ công', value: '1,024h', icon: Clock },
          { label: 'Kế hoạch', value: 'đ 52M', icon: TrendingUp },
        ]"
        :key="s.label"
        class="border-border shadow-none p-5 sm:p-6 hover:bg-secondary transition-all group rounded-lg bg-card"
      >
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{
              s.label
            }}</span>
            <div
              class="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-slate-400 border border-border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all"
            >
              <component :is="s.icon" class="h-5 w-5" />
            </div>
          </div>
          <span
            class="text-2xl font-black text-slate-900 tabular-nums group-hover:text-primary transition-colors"
            >{{ s.value }}</span
          >
        </div>
      </Card>
    </div>

    <!-- Filter & Search Bar -->
    <div
      class="flex flex-wrap items-center justify-between gap-4 p-5 bg-card rounded-lg border border-border"
    >
      <div class="flex flex-wrap items-center gap-4">
        <div class="relative group w-full sm:w-64">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors"
          />
          <input
            v-model="searchQuery"
            placeholder="Tìm tên hoặc mã nhân viên..."
            class="h-10 pl-10 pr-4 rounded-xl border border-slate-100 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-primary transition-all w-full"
          />
        </div>
        <select
          v-model="filterDepartment"
          class="h-10 rounded-xl border border-slate-100 bg-white px-4 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-primary transition-all"
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
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
                  >Nhân viên</span
                >
              </th>
              <th
                v-for="day in weekDays"
                :key="day.ymd"
                :class="[
                  'px-4 py-4 text-center border-r border-border min-w-[150px]',
                  day.isToday ? 'bg-muted/50' : '',
                ]"
              >
                <div class="flex flex-col items-center">
                  <span
                    class="text-[10px] font-black uppercase tracking-widest"
                    :class="day.isToday ? 'text-primary' : 'text-slate-400'"
                    >{{ day.dayLabel }}</span
                  >
                  <span
                    class="text-xl font-black mt-1"
                    :class="day.isToday ? 'text-primary' : 'text-slate-800'"
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
              class="group hover:bg-slate-50/50 transition-colors cursor-pointer"
              @click="selectedEmployeeId = employee.id"
            >
              <td class="sticky left-0 z-10 bg-card border-r border-border px-6 py-5">
                <div class="flex items-center gap-4">
                  <Avatar class="h-10 w-10 border border-slate-100 shadow-sm">
                    <AvatarImage :src="`/api/avatar/${employee.id}`" />
                    <AvatarFallback class="bg-slate-50 text-slate-400 text-[11px] font-black">
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
                      class="text-sm font-black text-slate-800 truncate group-hover:text-primary transition-colors uppercase leading-none"
                    >
                      {{ employee.fullName }}
                    </p>
                    <p class="text-[10px] text-slate-400 font-medium leading-relaxed">
                      {{ employee.departmentName || 'Phòng ban tự do' }}
                    </p>
                  </div>
                </div>
              </td>
              <td
                v-for="day in weekDays"
                :key="day.ymd"
                :class="[
                  'px-3 py-5 align-top border-r border-border text-center',
                  day.isToday ? 'bg-muted/50' : '',
                ]"
              >
                <div class="space-y-2 flex flex-col items-center">
                  <div
                    v-for="s in getSchedulesForEmployeeDate(employee, day.ymd)"
                    :key="s.id"
                    class="w-full text-[10px] font-black p-2.5 rounded-xl border text-center transition-all shadow-sm group-hover:shadow-md"
                    :class="getShiftBadgeStyle(s.shift?.name)"
                  >
                    <p class="uppercase tracking-tight leading-none mb-1.5">{{ s.shift?.name }}</p>
                    <p class="font-mono text-[9px] opacity-70">
                      {{ s.shift?.startTime?.slice(0, 5) }} - {{ s.shift?.endTime?.slice(0, 5) }}
                    </p>
                  </div>
                </div>
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
      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
        >Trang {{ currentPage }} / {{ totalPagesCount }}</span
      >
      <div class="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="currentPage--"
          class="h-10 px-6 rounded-xl font-black uppercase text-[10px]"
          >Trước</Button
        >
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === totalPagesCount"
          @click="currentPage++"
          class="h-10 px-6 rounded-xl font-black uppercase text-[10px]"
          >Sau</Button
        >
      </div>
    </div>

    <!-- Detail Side Panel -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-x-full"
        leave-to-class="translate-x-full"
        leave-active-class="transition duration-200 ease-in"
      >
        <div
          v-if="selectedEmployee"
          class="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-card shadow-2xl border-l border-border flex flex-col"
        >
          <!-- Side Header -->
          <div class="p-6 border-b border-border flex items-center justify-between bg-card">
            <div class="flex items-center gap-4">
              <div
                class="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20"
              >
                <CalendarIcon class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-900 tracking-tight uppercase">
                  Chi tiết lịch biểu
                </h3>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Thời gian thực • {{ weekRangeLabel }}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              @click="selectedEmployeeId = null"
              class="h-9 w-9 rounded-full bg-muted hover:bg-emphasis transition-colors"
            >
              <X class="h-5 w-5 text-slate-500" />
            </Button>
          </div>

          <!-- Side Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-8 bg-card">
            <!-- Profile Info -->
            <div
              class="flex flex-col items-center text-center p-8 rounded-xl border border-border bg-card shadow-none"
            >
              <Avatar class="h-24 w-24 border-4 border-white shadow-2xl mb-6">
                <AvatarFallback class="bg-primary text-primary-foreground text-2xl font-black">
                  {{
                    selectedEmployee.fullName
                      .split(' ')
                      .map((n: string) => n[0])
                      .slice(-2)
                      .join('')
                      .toUpperCase()
                  }}
                </AvatarFallback>
              </Avatar>
              <h4
                class="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none"
              >
                {{ selectedEmployee.fullName }}
              </h4>
              <Badge
                variant="secondary"
                class="mt-3 bg-primary/10 text-primary border-none font-black tabular-nums h-7 px-4 rounded-full uppercase text-[10px] tracking-widest"
                >{{ selectedEmployee.employeeCode }}</Badge
              >
              <p class="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {{ selectedEmployee.departmentName || 'Công ty CP TimeMaster' }}
              </p>
            </div>

            <!-- Week Schedule Detail -->
            <div class="space-y-5">
              <h5 class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 pl-2">
                Lịch làm việc trong tuần
              </h5>
              <div class="space-y-3">
                <div
                  v-for="day in weekDays"
                  :key="day.ymd"
                  class="flex items-center gap-5 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all group"
                >
                  <div class="w-14 text-center border-r border-border pr-5 shrink-0">
                    <p
                      class="text-[10px] font-black uppercase tracking-widest"
                      :class="day.isToday ? 'text-primary' : 'text-slate-400'"
                    >
                      {{ day.dayLabel }}
                    </p>
                    <p
                      class="text-xl font-black mt-1 leading-none"
                      :class="day.isToday ? 'text-primary' : 'text-slate-800'"
                    >
                      {{ day.dayNumber }}
                    </p>
                  </div>
                  <div class="flex-1">
                    <div
                      v-if="getSchedulesForEmployeeDate(selectedEmployee, day.ymd).length"
                      class="space-y-2"
                    >
                      <div
                        v-for="s in getSchedulesForEmployeeDate(selectedEmployee, day.ymd)"
                        :key="s.id"
                        class="flex items-center justify-between"
                      >
                        <span class="text-xs font-black text-slate-800 uppercase tracking-tight">{{
                          s.shift?.name
                        }}</span>
                        <Badge
                          variant="outline"
                          class="text-[10px] font-mono border-slate-100 text-slate-500 bg-slate-50"
                          >{{ s.shift?.startTime?.slice(0, 5) }} —
                          {{ s.shift?.endTime?.slice(0, 5) }}</Badge
                        >
                      </div>
                    </div>
                    <p v-else class="text-[11px] font-bold text-slate-300 tracking-tight">
                      Nghỉ ca / Chưa phân bổ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Side Footer -->
          <div class="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-4">
            <Button
              class="h-12 bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[11px] text-primary-foreground gap-2 rounded-lg shadow-lg shadow-primary/20"
            >
              <Edit3 class="h-4 w-4" /> Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              class="h-12 font-black uppercase tracking-widest text-[11px] text-slate-500 gap-2 rounded-lg border-slate-100 hover:bg-slate-50 transition-all"
            >
              <Eye class="h-4 w-4" /> Lịch sử
            </Button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
