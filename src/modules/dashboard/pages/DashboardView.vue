<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
    CheckCircle2,
    Clock,
    Download,
    UserCheck,
    Users,
    UserX,
} from 'lucide-vue-next'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import DataTable from '@/shared/ui/DataTable.vue'
import StatCard from '@/shared/ui/StatCard.vue'
import { useAttendance } from '@/modules/attendance/composables/useAttendance'

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

const todayFilter = computed(() => ({ date: formatLocalDate(now.value) }))
const { attendanceQuery } = useAttendance(todayFilter)
const isLoading = computed(() => attendanceQuery.isLoading.value)

const columns = [
    { key: 'name', label: 'Nhân viên' },
    { key: 'shift', label: 'Ca làm' },
    { key: 'checkIn', label: 'Giờ vào' },
    { key: 'checkOut', label: 'Giờ ra' },
    { key: 'status', label: 'Trạng thái' },
]

function formatLocalDate(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function formatTime(value?: string | null) {
    if (!value) return '--'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value.slice(11, 16) || '--'
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function normalizeStatus(status?: string | null) {
    const value = String(status ?? '').toUpperCase()
    if (value === 'PRESENT') return 'present'
    if (value === 'LATE' || value === 'LATE_AND_EARLY_LEAVE') return 'late'
    if (value === 'ABSENT') return 'absent'
    if (value === 'ON_LEAVE') return 'leave'
    if (value === 'MISSING_CHECKOUT') return 'working'
    return value ? value.toLowerCase() : 'absent'
}

const rows = computed(() => attendanceQuery.data.value ?? [])
const presentCount = computed(() =>
    rows.value.filter((row) => ['PRESENT', 'LATE', 'EARLY_LEAVE', 'LATE_AND_EARLY_LEAVE', 'MISSING_CHECKOUT'].includes(String(row.status))).length,
)
const lateCount = computed(() =>
    rows.value.filter((row) => ['LATE', 'LATE_AND_EARLY_LEAVE'].includes(String(row.status))).length,
)
const absentCount = computed(() =>
    rows.value.filter((row) => String(row.status).toUpperCase() === 'ABSENT').length,
)
const totalCount = computed(() => rows.value.length)
const presentRate = computed(() => totalCount.value ? `${Math.round((presentCount.value / totalCount.value) * 100)}%` : '0%')

const statCards = computed(() => [
    { label: 'Tổng nhân viên', value: String(totalCount.value), change: 'Theo dữ liệu hôm nay', changeType: 'neutral' as const, icon: Users, color: 'indigo' as const },
    { label: 'Có mặt hôm nay', value: String(presentCount.value), change: presentRate.value, changeType: 'positive' as const, icon: UserCheck, color: 'emerald' as const },
    { label: 'Đi trễ', value: String(lateCount.value), change: 'Từ bảng công', changeType: lateCount.value ? 'negative' as const : 'positive' as const, icon: Clock, color: 'amber' as const },
    { label: 'Vắng mặt', value: String(absentCount.value), change: 'Từ bảng công', changeType: absentCount.value ? 'negative' as const : 'positive' as const, icon: UserX, color: 'rose' as const },
])

const attendanceData = computed(() =>
    rows.value.slice(0, 8).map((row) => ({
        name: row.employee?.fullName ?? `NV #${row.employeeId ?? ''}`,
        dept: row.employee?.departmentName ?? '--',
        shift: row.shiftName ?? row.employee?.positionName ?? '--',
        checkIn: formatTime(row.checkInTime),
        checkOut: formatTime(row.checkOutTime),
        status: normalizeStatus(row.status),
    })),
)

const weeklyData = computed(() => {
    const todayLabel = new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(now.value)
    return [{ day: todayLabel, present: presentCount.value, total: Math.max(totalCount.value, 1) }]
})
</script>

<template>
    <div class="space-y-6">
        <PageHeader title="Dashboard" description="Tổng quan chấm công hệ thống TimeMaster">
            <template #actions>
                <Button variant="outline" as-child class="gap-2">
                    <RouterLink to="/export">
                        <Download class="h-4 w-4" />
                        Xuất báo cáo
                    </RouterLink>
                </Button>
            </template>
        </PageHeader>

        <!-- Stat cards -->
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard v-for="card in statCards" :key="card.label" v-bind="card" :loading="isLoading" />
        </div>

        <div class="grid gap-6 xl:grid-cols-3">
            <!-- Attendance table using DataTable -->
            <div class="xl:col-span-2">
                <Card class="overflow-hidden">
                    <CardHeader class="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-slate-900/50 py-4">
                        <div>
                            <CardTitle class="text-sm font-bold">Chấm công hôm nay</CardTitle>
                            <p class="text-[10px] text-slate-400 mt-0.5">Cập nhật lúc {{ timeString }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="relative flex h-2 w-2">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live</span>
                        </div>
                    </CardHeader>
                    <DataTable :columns="columns" :rows="attendanceData" :loading="isLoading">
                        <template #cell-name="{ row }">
                            <div class="flex items-center gap-3">
                                <Avatar class="h-8 w-8">
                                    <AvatarFallback class="bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                                        {{ row.name.split(' ').pop()?.charAt(0) }}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ row.name }}</p>
                                    <p class="text-[10px] text-slate-400 font-medium">{{ row.dept }}</p>
                                </div>
                            </div>
                        </template>
                        <template #cell-status="{ row }">
                            <Badge 
                                :variant="row.status === 'present' ? 'default' : row.status === 'late' ? 'outline' : 'secondary'"
                                class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                :class="{
                                    'bg-emerald-50 text-emerald-600 border-none': row.status === 'present',
                                    'bg-amber-50 text-amber-600 border-none': row.status === 'late',
                                    'bg-slate-100 text-slate-500 border-none': row.status === 'absent' || row.status === 'leave'
                                }"
                            >
                                {{ row.status === 'present' ? 'Đúng giờ' : row.status === 'late' ? 'Muộn' : row.status === 'working' ? 'Đang làm' : 'Vắng' }}
                            </Badge>
                        </template>
                    </DataTable>
                </Card>
            </div>

            <div class="space-y-4">
                <!-- Live clock widget -->
                <Card>
                    <CardHeader class="py-4">
                        <CardTitle class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thời gian thực</CardTitle>
                    </CardHeader>
                    <CardContent class="text-center">
                        <div class="rounded-xl bg-slate-50 dark:bg-slate-800 py-6">
                            <p class="text-4xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400 font-mono">
                                {{ timeString }}
                            </p>
                            <p class="mt-2 text-xs font-bold text-slate-400">{{ dateString }}</p>
                        </div>
                        <Button class="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 dark:shadow-none gap-2">
                            <CheckCircle2 class="h-4 w-4" />
                            Check-in ngay
                        </Button>
                    </CardContent>
                </Card>

                <!-- Weekly chart widget -->
                <Card>
                    <CardHeader class="py-4">
                        <CardTitle class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tỷ lệ có mặt tuần này</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="flex items-end gap-2 h-24">
                            <div v-for="d in weeklyData" :key="d.day" class="flex flex-1 flex-col items-center gap-1.5">
                                <div class="relative w-full h-16 rounded-t bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div class="absolute bottom-0 w-full bg-indigo-500 transition-all duration-700"
                                        :style="{ height: `${(d.present / d.total) * 100}%` }"></div>
                                </div>
                                <span class="text-[9px] font-bold text-slate-400">{{ d.day }}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 <!-- Notification widget -->
                <Card>
                    <CardHeader class="py-4">
                        <CardTitle class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thông báo nhanh</CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-3">
                        <div class="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50">
                            <div class="h-2 w-2 rounded-full bg-amber-500"></div>
                            <p class="text-[11px] font-bold text-amber-700 dark:text-amber-400">5 đơn xin nghỉ chờ phê duyệt</p>
                        </div>
                        <div class="flex items-center gap-3 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
                            <div class="h-2 w-2 rounded-full bg-indigo-500"></div>
                            <p class="text-[11px] font-bold text-indigo-700 dark:text-indigo-400">Tỷ lệ đúng giờ: 96%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</template>
