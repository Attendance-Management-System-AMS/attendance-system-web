<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { CheckCircle2, Clock3, Plane, Timer, UserCheck, Users } from 'lucide-vue-next'
import AttendanceTable from '@/components/attendance/AttendanceTable.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Attendance } from '@/types/attendance'

const now = ref(new Date())
let timer: number | undefined

const timeString = computed(() =>
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now.value),
)

const dateString = computed(() =>
  new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(now.value),
)

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    window.clearInterval(timer)
  }
})

const statCards = [
  {
    label: 'Tổng nhân sự',
    value: '128',
    change: 'Đang làm việc tại 6 phòng ban',
    icon: Users,
    color: 'indigo' as const,
  },
  {
    label: 'Có mặt',
    value: '112',
    change: 'Tỷ lệ đúng giờ 94%',
    changeType: 'positive' as const,
    icon: UserCheck,
    color: 'emerald' as const,
  },
  {
    label: 'Đi muộn',
    value: '9',
    change: 'Trễ dưới 15 phút',
    changeType: 'negative' as const,
    icon: Timer,
    color: 'amber' as const,
  },
  {
    label: 'Nghỉ phép',
    value: '7',
    change: 'Đã duyệt trong tuần',
    icon: Plane,
    color: 'rose' as const,
  },
]

const attendanceRecords: Attendance[] = [
  {
    id: 'att-001',
    employee: {
      id: 'emp-001',
      name: 'Trần Minh Anh',
      role: 'Chuyên viên nhân sự',
      department: 'Nhân sự',
      avatarUrl:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&auto=format&fit=facearea',
    },
    checkIn: '08:05',
    checkOut: '17:30',
    status: 'Có mặt',
  },
  {
    id: 'att-002',
    employee: {
      id: 'emp-002',
      name: 'Nguyễn Đức Dũng',
      role: 'Trưởng nhóm kỹ thuật',
      department: 'Công nghệ',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=facearea',
    },
    checkIn: '08:20',
    checkOut: '17:45',
    status: 'Đi muộn',
  },
  {
    id: 'att-003',
    employee: {
      id: 'emp-003',
      name: 'Lê Hoài Nam',
      role: 'Kế toán tổng hợp',
      department: 'Tài chính',
      avatarUrl:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=facearea',
    },
    checkIn: '08:00',
    checkOut: '17:30',
    status: 'Có mặt',
  },
  {
    id: 'att-004',
    employee: {
      id: 'emp-004',
      name: 'Phạm Thị Thủy',
      role: 'Nhân viên kinh doanh',
      department: 'Kinh doanh',
      avatarUrl:
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=200&auto=format&fit=facearea',
    },
    checkIn: '--',
    checkOut: '--',
    status: 'Nghỉ phép',
  },
  {
    id: 'att-005',
    employee: {
      id: 'emp-005',
      name: 'Ngô Phương Linh',
      role: 'Chuyên viên vận hành',
      department: 'Vận hành',
      avatarUrl:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&auto=format&fit=facearea',
    },
    checkIn: '08:10',
    checkOut: '17:25',
    status: 'Có mặt',
  },
]
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard v-for="card in statCards" :key="card.label" :label="card.label" :value="card.value"
        :change="card.change" :change-type="card.changeType" :icon="card.icon" :color="card.color" />
    </div>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card class="border-slate-200">
        <CardHeader class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle class="text-lg font-semibold text-slate-900">
              Lịch sử chấm công hôm nay
            </CardTitle>
            <p class="text-sm text-slate-500">Cập nhật lúc {{ timeString }} • {{ dateString }}</p>
          </div>
          <Button variant="outline" class="w-full lg:w-auto"> Xuất báo cáo </Button>
        </CardHeader>
        <CardContent>
          <AttendanceTable :items="attendanceRecords" />
        </CardContent>
      </Card>

      <div class="space-y-6">
        <Card class="border-slate-200">
          <CardHeader>
            <CardTitle class="text-lg font-semibold text-slate-900"> Đồng hồ làm việc </CardTitle>
            <p class="text-sm text-slate-500">Theo giờ Việt Nam (GMT+7)</p>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-8 text-center">
              <div class="flex items-center justify-center gap-2 text-slate-500">
                <Clock3 class="size-4" />
                <span class="text-xs uppercase tracking-wide">Thời gian hiện tại</span>
              </div>
              <p class="mt-4 text-4xl font-semibold text-slate-900">
                {{ timeString }}
              </p>
              <p class="mt-1 text-sm text-slate-500">{{ dateString }}</p>
            </div>

            <Button class="w-full bg-blue-600 text-white hover:bg-blue-700">
              <CheckCircle2 class="size-4" />
              Check-in
            </Button>

            <Separator />

            <div class="space-y-3 text-sm text-slate-600">
              <div class="flex items-center justify-between">
                <span>Ca sáng</span>
                <span class="font-medium text-slate-900">08:00 - 12:00</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Ca chiều</span>
                <span class="font-medium text-slate-900">13:30 - 17:30</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Thời gian tiêu chuẩn</span>
                <span class="font-medium text-slate-900">8 giờ/ngày</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="border-slate-200">
          <CardHeader>
            <CardTitle class="text-lg font-semibold text-slate-900"> Thông báo nhanh </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3 text-sm text-slate-600">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              3 nhân viên mới cần cập nhật hồ sơ trong ngày hôm nay.
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              Đã có 5 đơn xin nghỉ phép chờ phê duyệt.
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              Tỷ lệ chấm công đúng giờ tuần này đạt 96%.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
