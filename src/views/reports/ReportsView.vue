<script setup lang="ts">
import { ref } from 'vue'
const filterPeriod = ref('month')
const filterDept = ref('')

const periods = [
    { label: 'Tuần này', value: 'week' },
    { label: 'Tháng này', value: 'month' },
    { label: 'Quý này', value: 'quarter' },
    { label: 'Năm nay', value: 'year' },
]

const departments = [
    { label: 'Nhân sự', value: 'hr' },
    { label: 'Công nghệ', value: 'it' },
    { label: 'Tài chính', value: 'finance' },
    { label: 'Kinh doanh', value: 'sales' },
]

const summaryStats = [
    { label: 'Tổng ngày công', value: '2,576', change: '+4.2%', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/50' },
    { label: 'Tỷ lệ đúng giờ', value: '94.2%', change: '+1.8%', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
    { label: 'Tổng đi trễ', value: '87', change: '-12%', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/50' },
    { label: 'Tổng vắng mặt', value: '45', change: '-8%', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/50' },
]

// Department performance data
const deptPerformance = [
    { dept: 'Nhân sự', rate: 97, count: 12 },
    { dept: 'Tài chính', rate: 96, count: 8 },
    { dept: 'IT', rate: 94, count: 25 },
    { dept: 'Công nghệ', rate: 91, count: 25 },
    { dept: 'Vận hành', rate: 88, count: 18 },
    { dept: 'Kinh doanh', rate: 85, count: 30 },
]

// Daily trend data (March 2026)
const dailyTrend = [
    { label: '1/3', present: 118, total: 128 },
    { label: '3/3', present: 122, total: 128 },
    { label: '5/3', present: 115, total: 128 },
    { label: '7/3', present: 125, total: 128 },
    { label: '10/3', present: 119, total: 128 },
    { label: '12/3', present: 121, total: 128 },
    { label: '14/3', present: 116, total: 128 },
    { label: '16/3', present: 112, total: 128 },
]

const getRateColor = (rate: number) => {
    if (rate >= 95) return 'bg-emerald-500'
    if (rate >= 90) return 'bg-indigo-500'
    if (rate >= 80) return 'bg-amber-500'
    return 'bg-rose-500'
}

// Status breakdown for pie-like display
const statusBreakdown = [
    { label: 'Đúng giờ', count: 2418, percent: 80, color: 'bg-emerald-500' },
    { label: 'Đi trễ', count: 424, percent: 14, color: 'bg-amber-500' },
    { label: 'Nghỉ phép', count: 182, percent: 6, color: 'bg-slate-300' },
    { label: 'Vắng mặt', count: 87, percent: 3, color: 'bg-rose-500' },
]

// Late reasons
const lateReasons = [
    { reason: 'Kẹt xe, giao thông', count: 42, percent: 48 },
    { reason: 'Ngủ quên', count: 22, percent: 25 },
    { reason: 'Bệnh đột xuất', count: 13, percent: 15 },
    { reason: 'Việc cá nhân', count: 7, percent: 8 },
    { reason: 'Khác', count: 3, percent: 4 },
]
</script>

<template>
    <div class="space-y-6">
        <PageHeader title="Báo cáo & Phân tích" description="Tổng hợp và phân tích dữ liệu chấm công">
            <template #actions>
                <button
                    class="flex items-center gap-2 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors dark:shadow-none">
                    <Download class="h-4 w-4" />
                    Xuất báo cáo
                </button>
            </template>
        </PageHeader>

        <!-- Filters -->
        <div class="flex items-center gap-3">
            <FilterSelect v-model="filterPeriod" label="Thời gian" :options="periods" />
            <FilterSelect v-model="filterDept" label="Phòng ban" :options="departments" />
        </div>

        <!-- Summary stats -->
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div v-for="stat in summaryStats" :key="stat.label"
                :class="['rounded-2xl border border-slate-200 p-5 shadow-sm dark:border-slate-800', stat.bg]">
                <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">{{ stat.label }}</p>
                <div class="mt-3 flex items-end justify-between">
                    <p :class="['text-2xl font-black', stat.color]">{{ stat.value }}</p>
                    <span class="flex items-center gap-1 text-xs font-bold text-emerald-500">
                        <TrendingUp class="h-3 w-3" />
                        {{ stat.change }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Charts row -->
        <div class="grid gap-6 lg:grid-cols-2">
            <!-- Daily trend chart -->
            <div
                class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-2.5">
                        <div
                            class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
                            <BarChart3 class="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Xu hướng có mặt</h3>
                            <p class="text-xs text-slate-400">Tháng 3/2026</p>
                        </div>
                    </div>
                </div>

                <!-- CSS Bar chart -->
                <div class="flex items-end gap-2 h-36">
                    <div v-for="d in dailyTrend" :key="d.label" class="flex flex-1 flex-col items-center gap-2">
                        <div class="relative w-full flex flex-col justify-end h-28 rounded-t-sm overflow-hidden">
                            <div class="absolute inset-0 rounded-sm bg-slate-100 dark:bg-slate-800"></div>
                            <div class="absolute bottom-0 w-full rounded-sm bg-indigo-500 transition-all duration-500"
                                :style="{ height: `${(d.present / d.total) * 100}%` }"></div>
                            <div class="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-1">
                                <span class="text-[9px] font-bold text-white">{{ d.present }}</span>
                            </div>
                        </div>
                        <span class="text-[9px] font-bold text-slate-400">{{ d.label }}</span>
                    </div>
                </div>
            </div>

            <!-- Department performance -->
            <div
                class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div class="flex items-center gap-2.5 mb-6">
                    <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950">
                        <Users class="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 class="text-sm font-bold text-slate-900 dark:text-white">Hiệu suất theo phòng ban</h3>
                        <p class="text-xs text-slate-400">Tỷ lệ đi làm đúng giờ</p>
                    </div>
                </div>

                <div class="space-y-3.5">
                    <div v-for="d in deptPerformance" :key="d.dept" class="flex items-center gap-3">
                        <span class="w-24 text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0">{{ d.dept
                            }}</span>
                        <div class="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                            <div :class="['h-full rounded-full transition-all duration-700', getRateColor(d.rate)]"
                                :style="{ width: `${d.rate}%` }"></div>
                        </div>
                        <span
                            :class="['text-xs font-bold min-w-9 text-right', d.rate >= 95 ? 'text-emerald-600' : d.rate >= 90 ? 'text-indigo-600' : 'text-amber-600']">
                            {{ d.rate }}%
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom row -->
        <div class="grid gap-6 lg:grid-cols-2">
            <!-- Status breakdown -->
            <div
                class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-5">Phân bố trạng thái</h3>

                <!-- Stacked bar -->
                <div class="flex h-4 w-full overflow-hidden rounded-full mb-5">
                    <div v-for="s in statusBreakdown" :key="s.label" :class="['h-full transition-all', s.color]"
                        :style="{ width: `${s.percent}%` }"></div>
                </div>

                <div class="space-y-2.5">
                    <div v-for="s in statusBreakdown" :key="s.label" class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <div :class="['h-2.5 w-2.5 rounded-full', s.color]"></div>
                            <span class="text-sm text-slate-600 dark:text-slate-300">{{ s.label }}</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-sm font-bold text-slate-900 dark:text-white">{{ s.count.toLocaleString()
                                }}</span>
                            <span class="text-xs font-bold text-slate-400 min-w-8 text-right">{{ s.percent
                                }}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Late reasons -->
            <div
                class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-5">Nguyên nhân đi trễ</h3>
                <div class="space-y-3">
                    <div v-for="r in lateReasons" :key="r.reason" class="space-y-1.5">
                        <div class="flex items-center justify-between text-xs">
                            <span class="font-medium text-slate-600 dark:text-slate-300">{{ r.reason }}</span>
                            <span class="font-bold text-slate-900 dark:text-white">{{ r.count }} lần ({{ r.percent
                                }}%)</span>
                        </div>
                        <div class="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                            <div class="h-full rounded-full bg-amber-400 transition-all duration-500"
                                :style="{ width: `${r.percent}%` }"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
