<script setup lang="ts">
import { computed } from 'vue'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  ClipboardList,
  Timer,
  TrendingUp,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { useMyAttendance } from '@/modules/attendance/composables/useMyAttendance'
import { useMyLeaves } from '@/modules/leaves/composables/useMyLeaves'

const { user } = useAuth()

const today = new Date()

// Helper functions to replace date-fns
const formatDateStr = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
const getStartOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
const getEndOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0)

const filters = computed(() => ({
  fromDate: formatDateStr(getStartOfMonth(today)),
  toDate: formatDateStr(getEndOfMonth(today)),
  page: 0,
  size: 100,
}))

const { historyQuery, todayQuery, scheduleQuery } = useMyAttendance(filters)
const { leavesQuery } = useMyLeaves()

const userProfile = computed(() => ({
  fullName: user.value?.fullName || 'Nhân viên'
}))

const todayKey = formatDateStr(today)
const todayDayOfWeek = today.getDay() === 0 ? 7 : today.getDay()

const formatTime = (value?: string | null) => {
  if (!value) return '--:--'
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

const getAttendanceTimestamp = (key: 'checkIn' | 'checkOut') => {
  const record = todayQuery.data.value
  if (!record) return null
  return key === 'checkIn'
    ? record.checkIn || record.checkInTime || record.check_in_time || null
    : record.checkOut || record.checkOutTime || record.check_out_time || null
}

const todayStatus = computed(() => {
  const status = String(todayQuery.data.value?.status || '').toUpperCase()
  switch (status) {
    case 'PRESENT':
      return { label: 'Đúng giờ', tone: 'text-emerald-400', helper: 'Bạn đã hoàn tất check-in hôm nay.' }
    case 'LATE':
      return { label: 'Đi muộn', tone: 'text-amber-400', helper: 'Hôm nay có ghi nhận đi muộn.' }
    case 'ABSENT':
      return { label: 'Vắng mặt', tone: 'text-rose-400', helper: 'Chưa có bản ghi chấm công hợp lệ.' }
    case 'ON_LEAVE':
      return { label: 'Nghỉ phép', tone: 'text-sky-400', helper: 'Hôm nay bạn đang có lịch nghỉ phép.' }
    case 'MISSING_CHECKOUT':
      return { label: 'Thiếu giờ ra', tone: 'text-rose-400', helper: 'Bạn đã vào ca nhưng chưa ghi nhận giờ ra.' }
    default:
      return { label: 'Chưa chấm công', tone: 'text-primary', helper: 'Sẵn sàng ghi nhận ca làm hôm nay.' }
  }
})

const currentShift = computed(() => {
  const schedules = scheduleQuery.data.value ?? []
  return schedules
    .filter((item) => item.isActive && item.dayOfWeek === todayDayOfWeek)
    .filter((item) => item.effectiveFrom <= todayKey && (!item.effectiveTo || item.effectiveTo >= todayKey))
    .sort((left, right) => right.effectiveFrom.localeCompare(left.effectiveFrom))[0] ?? null
})

const workingDaysInMonth = computed(() => {
  const start = getStartOfMonth(today)
  const end = getEndOfMonth(today)
  let count = 0
  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    const dow = day.getDay()
    if (dow !== 0 && dow !== 6) count++
  }
  return count
})

const attendanceStats = computed(() => {
  const data = historyQuery.data.value?.content || []
  const present = data.filter(l => l.status === 'PRESENT').length
  const late = data.filter(l => l.status === 'LATE').length
  return { present, late }
})

const stats = computed(() => [
  { label: 'Công', value: `${attendanceStats.value.present}/${workingDaysInMonth.value}`, icon: CheckCircle2, status: 'Ngày làm dự kiến' },
  { label: 'Muộn', value: String(attendanceStats.value.late), icon: Clock, status: 'Số lần' },
  { label: 'Đơn từ', value: String(leavesQuery.data.value?.totalElements || 0), icon: ClipboardList, status: 'Tổng đơn đã gửi' },
  { label: 'Trạng thái', value: todayStatus.value.label, icon: TrendingUp, status: 'Hôm nay' },
])

const dailyBars = computed(() => {
  const data = historyQuery.data.value?.content || []
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const key = formatDateStr(date)
    const label = new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date)
    const row = data.find((item) => item.workDate === key)
    return {
      label,
      value: row?.checkIn || row?.checkInTime || row?.check_in_time ? 100 : 0,
    }
  })
  return days
})

const recentActivities = computed(() => {
  const activities = []
  if (todayQuery.data.value?.status) {
    activities.push({
      id: 'today',
      title: `Chấm công hôm nay: ${todayQuery.data.value.status}`,
      time: 'Hôm nay',
      category: 'Chấm công',
    })
  }
  const latestLeave = leavesQuery.data.value?.content?.[0]
  if (latestLeave) {
    activities.push({
      id: `leave-${latestLeave.id}`,
      title: `Đơn nghỉ ${latestLeave.status}`,
      time: latestLeave.fromDate ? new Date(latestLeave.fromDate).toLocaleDateString('vi-VN') : 'Gần đây',
      category: 'Đơn từ',
    })
  }
  return activities
})
</script>

<template>
  <div class=" space-y-6">
    <PageHeader
      :title="`Xin chào, ${userProfile.fullName.split(' ').pop()}!`"
      :description="new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })"
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <Button as-child variant="outline" size="sm" class="h-8 text-xs font-semibold gap-2">
            <RouterLink to="/my/attendance">
              Xem bảng công
            </RouterLink>
          </Button>
          <Button as-child size="sm" class="h-8 bg-primary hover:bg-primary/90 text-xs font-semibold gap-2">
            <RouterLink to="/kiosk">
            <Timer class="h-3 w-3" />
              Chấm công
            </RouterLink>
          </Button>
        </div>
      </template>
    </PageHeader>

    <Card class="overflow-hidden border-border-standard bg-card shadow-none">
      <div class="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.4fr_1fr]">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent)]"></div>
        <div class="relative space-y-5">
          <div class="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
            Trạng thái hôm nay
          </div>
          <div>
            <p class="text-sm font-medium text-secondary-text">{{ todayStatus.helper }}</p>
            <h2 class="mt-2 text-3xl font-semibold text-primary-text sm:text-4xl">
              <span :class="todayStatus.tone">{{ todayStatus.label }}</span>
            </h2>
          </div>
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-lg border border-border-subtle bg-background/50 p-3">
              <p class="text-[11px] font-medium text-tertiary-text">Giờ vào</p>
              <p class="mt-1 font-mono text-lg font-semibold text-primary-text">{{ formatTime(getAttendanceTimestamp('checkIn')) }}</p>
            </div>
            <div class="rounded-lg border border-border-subtle bg-background/50 p-3">
              <p class="text-[11px] font-medium text-tertiary-text">Giờ ra</p>
              <p class="mt-1 font-mono text-lg font-semibold text-primary-text">{{ formatTime(getAttendanceTimestamp('checkOut')) }}</p>
            </div>
            <div class="rounded-lg border border-border-subtle bg-background/50 p-3">
              <p class="text-[11px] font-medium text-tertiary-text">Ca hôm nay</p>
              <p class="mt-1 truncate text-lg font-semibold text-primary-text">{{ currentShift?.shiftName || 'Chưa có ca' }}</p>
            </div>
          </div>
        </div>

        <div class="relative flex flex-col justify-between rounded-xl border border-primary/20 bg-primary/10 p-5">
          <div>
            <CalendarDays class="h-8 w-8 text-primary" />
            <h3 class="mt-4 text-xl font-semibold text-primary-text">
              {{ currentShift?.startTime?.substring(0, 5) || '--:--' }} - {{ currentShift?.endTime?.substring(0, 5) || '--:--' }}
            </h3>
            <p class="mt-2 text-sm text-secondary-text">
              {{ currentShift ? 'Theo lịch phân ca đang hiệu lực hôm nay.' : 'Bạn chưa có lịch làm việc hiệu lực trong hôm nay.' }}
            </p>
          </div>
          <Button as-child variant="ghost" class="mt-5 justify-between rounded-lg bg-card/70 text-primary hover:bg-card">
            <RouterLink to="/my/schedule">
              Xem lịch cá nhân
              <ArrowRight class="h-4 w-4" />
            </RouterLink>
          </Button>
        </div>
      </div>
    </Card>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <Card
        v-for="stat in stats"
        :key="stat.label"
        class="border-border-subtle shadow-none p-4 sm:p-6 hover:bg-surface transition-all group rounded-lg"
      >
        <div class="flex flex-col">
          <span class="text-[10px] font-semibold text-tertiary-text  tracking-normal">{{
            stat.label
          }}</span>
          <div class="mt-3 flex items-end justify-between">
            <span
              class="text-2xl sm:text-3xl font-semibold text-primary-text tabular-nums leading-none group-hover:text-primary transition-colors"
              >{{ stat.value }}</span>
            <div
              class="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-secondary-text border border-border-standard group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all"
            >
              <component :is="stat.icon" class="h-4 w-4" />
            </div>
          </div>
          <p class="mt-4 text-[9px] font-bold text-tertiary-text  leading-none">{{ stat.status }}</p>
        </div>
      </Card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content: Attendance Chart Simulation -->
      <Card class="lg:col-span-2 border-border-subtle shadow-none overflow-hidden rounded-lg">
        <CardHeader class="p-4 sm:p-6 border-b border-border-subtle bg-card">
          <div class="flex items-center justify-between">
            <div>
              <CardTitle
                class="text-[10px] font-semibold text-secondary-text  tracking-normal leading-none"
                >Biểu đồ chuyên cần</CardTitle
              >
              <p class="mt-2 text-xs font-semibold text-primary-text ">
                Dữ liệu chấm công 7 ngày gần nhất
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent class="p-4 sm:p-8">
          <div class="h-[200px] flex items-end justify-between gap-2 sm:gap-4 px-2">
            <div
              v-for="bar in dailyBars"
              :key="bar.label"
              class="flex-1 flex flex-col items-center gap-4 group"
            >
              <div
                class="w-full bg-surface rounded-lg relative overflow-hidden h-full flex flex-col justify-end"
              >
                <div
                    class="bg-primary group-hover:bg-primary/80 transition-all rounded-t-xl"
                    :style="{ height: `${bar.value}%` }"
                >
                  <div class="absolute top-0 inset-x-0 h-1 bg-card/30"></div>
                </div>
              </div>
              <span class="text-[10px] font-semibold text-tertiary-text  tracking-normal">{{
                bar.label
              }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Side Content -->
      <div class="space-y-6">
        <!-- Dashboard shortcuts -->
        <Card class="border-border-subtle shadow-none p-5 rounded-lg bg-card">
          <div class="flex items-center gap-4">
            <div
              class="h-14 w-14 shrink-0 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-sm"
            >
              <Star class="h-7 w-7" />
            </div>
            <div>
              <p
                class="text-[10px] font-semibold text-tertiary-text  tracking-normal leading-none"
              >
                Lịch làm việc
              </p>
              <h4 class="text-xl font-semibold text-primary-text mt-2 leading-none">Xem lịch trực</h4>
              <RouterLink to="/my/schedule"
                class="inline-block text-[9px] font-bold text-primary mt-1.5  cursor-pointer hover:underline"
              >
                Đi tới lịch biểu
              </RouterLink>
            </div>
          </div>
        </Card>

        <!-- Activities -->
        <Card class="border-border-subtle shadow-none overflow-hidden rounded-lg">
          <CardHeader class="p-5 border-b border-border-subtle bg-card">
            <CardTitle
              class="text-[10px] font-semibold text-secondary-text  tracking-normal leading-none"
              >Thông báo & Sự kiện</CardTitle
            >
          </CardHeader>
          <CardContent class="p-0">
            <div class="divide-y divide-slate-50">
              <div
                v-for="act in recentActivities"
                :key="act.id"
                class="p-4 hover:bg-surface transition-colors cursor-pointer group"
              >
                <div class="flex gap-4">
                  <div class="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-xs font-semibold text-primary-text leading-snug  truncate group-hover:text-primary transition-colors"
                    >
                      {{ act.title }}
                    </p>
                    <div class="flex items-center justify-between mt-1.5">
                      <p class="text-[9px] font-bold text-tertiary-text  tracking-normal">
                        {{ act.category }}
                      </p>
                      <p class="text-[9px] font-semibold text-tertiary-text  leading-none">
                        {{ act.time }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              as-child
              class="w-full rounded-none border-t border-border-subtle py-4 text-[10px] font-semibold text-tertiary-text  tracking-normal hover:text-primary transition-colors"
            >
              <RouterLink to="/my/attendance">Xem chi tiết <ChevronRight class="ml-2 h-3 w-3" /></RouterLink>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
