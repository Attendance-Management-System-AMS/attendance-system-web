<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
    CheckCircle2,
    Clock,
    Download,
    UserCheck,
    Users,
    UserX,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import StatCard from '@/components/ui/StatCard.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import TableSkeleton from '@/components/ui/TableSkeleton.vue'

// Mock loading state
const isLoading = ref(true)
onMounted(() => {
    setTimeout(() => {
        isLoading.value = false
    }, 2000)
})

// Live clock
const now = ref(new Date())
let timer: number | undefined
onMounted(() => (timer = window.setInterval(() => (now.value = new Date()), 1000)))
onUnmounted(() => clearInterval(timer))

const timeString = computed(() =>
    new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(now.value),
)
const dateString = computed(() =>
    new Intl.DateTimeFormat('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(now.value),
)

const statCards = [
    { label: 'Tổng nhân viên', value: '128', change: '+3 tháng này', changeType: 'positive' as const, icon: Users, color: 'indigo' as const },
    { label: 'Có mặt hôm nay', value: '112', change: '87.5%', changeType: 'positive' as const, icon: UserCheck, color: 'emerald' as const },
    { label: 'Đi trễ', value: '9', change: '-2 so với hôm qua', changeType: 'positive' as const, icon: Clock, color: 'amber' as const },
    { label: 'Vắng mặt', value: '7', change: '+1 so với hôm qua', changeType: 'negative' as const, icon: UserX, color: 'rose' as const },
]

type StatusKey = 'present' | 'late' | 'absent' | 'working' | 'leave'

interface AttendanceRow {
    name: string
    dept: string
    shift: string
    checkIn: string
    checkOut: string
    status: StatusKey
}

const attendanceData: AttendanceRow[] = [
    { name: 'Trần Minh Anh', dept: 'Nhân sự', shift: 'Ca sáng', checkIn: '07:58', checkOut: '17:30', status: 'present' },
    { name: 'Nguyễn Đức Dũng', dept: 'Công nghệ', shift: 'Ca sáng', checkIn: '08:22', checkOut: '18:00', status: 'late' },
    { name: 'Lê Hoài Nam', dept: 'Tài chính', shift: 'Ca sáng', checkIn: '07:55', checkOut: '17:30', status: 'present' },
    { name: 'Phạm Thị Thủy', dept: 'Kinh doanh', shift: 'Ca sáng', checkIn: '--', checkOut: '--', status: 'leave' },
    { name: 'Ngô Phương Linh', dept: 'Vận hành', shift: 'Ca chiều', checkIn: '13:00', checkOut: '--', status: 'working' },
    { name: 'Võ Minh Khoa', dept: 'IT', shift: 'Ca chiều', checkIn: '--', checkOut: '--', status: 'absent' },
]

// Weekly bar chart data
const weeklyData = [
    { day: 'T2', present: 115, total: 128 },
    { day: 'T3', present: 120, total: 128 },
    { day: 'T4', present: 109, total: 128 },
    { day: 'T5', present: 118, total: 128 },
    { day: 'T6', present: 112, total: 128 },
    { day: 'T7', present: 45, total: 128 },
    { day: 'CN', present: 20, total: 128 },
]
</script>

<template>
    <div class="space-y-6">
        <PageHeader title="Dashboard" description="Tổng quan chấm công hệ thống TimeMaster">
            <template #actions>
                <RouterLink
                    to="/export"
                    class="flex items-center gap-2 h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/80 hover:text-indigo-700 transition-all dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
                >
                    <Download class="h-4 w-4" />
                    Xuất báo cáo
                </RouterLink>
            </template>
        </PageHeader>

        <!-- Stat cards -->
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard v-for="card in statCards" :key="card.label" :label="card.label" :value="card.value"
                :change="card.change" :change-type="card.changeType" :icon="card.icon" :color="card.color"
                :loading="isLoading" />
        </div>

        <!-- Main content: table + side widgets -->
        <div class="grid gap-6 xl:grid-cols-3">
            <!-- Attendance table -->
            <div class="xl:col-span-2">
                <div
                    class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                    <div
                        class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h2 class="text-sm font-bold text-slate-900 dark:text-white">Chấm công hôm nay</h2>
                            <p class="text-xs text-slate-400 mt-0.5">Cập nhật lúc {{ timeString }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="flex h-2 w-2 rounded-full bg-emerald-500">
                                <span
                                    class="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            </span>
                            <span class="text-xs text-slate-500">Live</span>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <TableSkeleton v-if="isLoading" :rows="6" :cols="4" has-avatar-column />
                        <table v-else class="w-full">
                            <thead>
                                <tr class="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800">
                                    <th
                                        class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Nhân viên</th>
                                    <th
                                        class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Ca làm</th>
                                    <th
                                        class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Giờ vào</th>
                                    <th
                                        class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Giờ ra</th>
                                    <th
                                        class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr v-for="row in attendanceData" :key="row.name"
                                    class="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50">
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                                                {{ row.name.split(' ').pop()?.charAt(0) }}
                                            </div>
                                            <div>
                                                <p class="text-sm font-medium text-slate-900 dark:text-white">{{
                                                    row.name }}</p>
                                                <p class="text-xs text-slate-400">{{ row.dept }}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ row.shift }}
                                    </td>
                                    <td class="px-4 py-3 font-mono text-sm text-slate-700 dark:text-slate-300">{{
                                        row.checkIn }}
                                    </td>
                                    <td class="px-4 py-3 font-mono text-sm text-slate-700 dark:text-slate-300">{{
                                        row.checkOut
                                    }}</td>
                                    <td class="px-4 py-3">
                                        <StatusBadge :status="row.status" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Side widgets -->
            <div class="space-y-4">
                <!-- Live clock -->
                <div
                    class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Thời gian thực</h3>
                    <div class="rounded-xl bg-slate-50 dark:bg-slate-800 px-4 py-5 text-center">
                        <p class="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">{{
                            timeString }}
                        </p>
                        <p class="mt-1 text-xs text-slate-400">{{ dateString }}</p>
                    </div>
                    <button
                        class="mt-4 flex w-full items-center justify-center gap-2 h-10 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors dark:shadow-none">
                        <CheckCircle2 class="h-4 w-4" />
                        Check-in ngay
                    </button>
                </div>

                <!-- Weekly chart -->
                <div
                    class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Tỷ lệ có mặt tuần này
                    </h3>
                    <div class="flex items-end gap-1.5 h-28">
                        <div v-for="d in weeklyData" :key="d.day" class="flex flex-1 flex-col items-center gap-1">
                            <div
                                class="relative flex w-full flex-col items-center justify-end h-20 rounded-t-sm overflow-hidden">
                                <div class="w-full rounded-sm bg-slate-100 dark:bg-slate-800 absolute inset-0"></div>
                                <div class="absolute bottom-0 w-full rounded-sm bg-indigo-500 transition-all duration-500"
                                    :style="{ height: `${(d.present / d.total) * 100}%` }"></div>
                            </div>
                            <span class="text-[9px] font-bold text-slate-400">{{ d.day }}</span>
                        </div>
                    </div>
                </div>

                <!-- Quick notifications -->
                <div
                    class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Thông báo nhanh</h3>
                    <div class="space-y-2">
                        <div
                            class="rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900 px-3 py-2.5">
                            <p class="text-xs font-medium text-amber-700 dark:text-amber-400">5 đơn xin nghỉ chờ phê
                                duyệt</p>
                        </div>
                        <div
                            class="rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 px-3 py-2.5">
                            <p class="text-xs font-medium text-indigo-700 dark:text-indigo-400">Tỷ lệ đúng giờ tuần này:
                                96%</p>
                        </div>
                        <div
                            class="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-2.5">
                            <p class="text-xs font-medium text-slate-600 dark:text-slate-300">3 nhân viên mới cần cập
                                nhật hồ sơ
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
