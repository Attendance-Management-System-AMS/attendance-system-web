<script setup lang="ts">
import PageHeader from '@/shared/ui/PageHeader.vue'
import { ref } from 'vue'
import { BarChart3, Download, TrendingUp, Users, ArrowUpRight, ArrowDownRight, PieChart } from 'lucide-vue-next'
import FilterSelect from '@/shared/ui/FilterSelect.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

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
    { label: 'Tổng ngày công', value: '2,576', change: '+4.2%', trend: 'up', color: 'text-indigo-600', bg: 'bg-indigo-50/50 dark:bg-indigo-950/20' },
    { label: 'Tỷ lệ đúng giờ', value: '94.2%', change: '+1.8%', trend: 'up', color: 'text-emerald-600', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20' },
    { label: 'Số giờ làm thêm', value: '142h', change: '-12%', trend: 'down', color: 'text-violet-600', bg: 'bg-violet-50/50 dark:bg-violet-950/20' },
    { label: 'Tổng vắng mặt', value: '45', change: '-8%', trend: 'down', color: 'text-rose-600', bg: 'bg-rose-50/50 dark:bg-rose-950/20' },
]

const deptPerformance = [
    { dept: 'Nhân sự', rate: 97, count: 12 },
    { dept: 'Tài chính', rate: 96, count: 8 },
    { dept: 'Công nghệ', rate: 94, count: 25 },
    { dept: 'Vận hành', rate: 88, count: 18 },
    { dept: 'Kinh doanh', rate: 85, count: 30 },
]

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

const statusBreakdown = [
    { label: 'Đúng giờ', count: 2418, percent: 80, color: 'bg-indigo-500' },
    { label: 'Đi trễ', count: 424, percent: 14, color: 'bg-amber-400' },
    { label: 'Nghỉ phép', count: 182, percent: 6, color: 'bg-slate-300' },
]

const getRateColor = (rate: number) => {
    if (rate >= 95) return 'bg-emerald-500'
    if (rate >= 90) return 'bg-indigo-500'
    return 'bg-amber-500'
}
</script>

<template>
    <div class="space-y-6">
        <PageHeader title="Phân tích & Báo cáo" description="Phân tích chuyên sâu dữ liệu chấm công và hiệu suất">
            <template #actions>
                <Button class="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none font-bold">
                    <Download class="h-4 w-4" />
                    Tải báo cáo (PDF)
                </Button>
            </template>
        </PageHeader>

        <!-- Filters -->
        <div class="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50 p-2 rounded-xl border border-border">
            <FilterSelect v-model="filterPeriod" label="Khoảng thời gian" :options="periods" />
            <FilterSelect v-model="filterDept" label="Bộ phận" :options="departments" />
        </div>

        <!-- Summary stats -->
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card v-for="stat in summaryStats" :key="stat.label" :class="['border-none shadow-none overflow-hidden', stat.bg]">
                <CardContent class="p-5">
                    <div class="flex justify-between items-start">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ stat.label }}</p>
                        <div :class="['flex items-center gap-0.5 text-[10px] font-black', stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600']">
                            <component :is="stat.trend === 'up' ? ArrowUpRight : ArrowDownRight" class="h-3 w-3" />
                            {{ stat.change }}
                        </div>
                    </div>
                    <p :class="['text-2xl font-black mt-3 transition-all', stat.color]">{{ stat.value }}</p>
                </CardContent>
            </Card>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
            <!-- Daily trend -->
            <Card class="border-border shadow-none overflow-hidden">
                <CardHeader class="flex flex-row items-center gap-3 border-b bg-slate-50/30 py-4">
                    <div class="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                        <BarChart3 class="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle class="text-[10px] font-black uppercase tracking-widest text-slate-500">Xu hướng có mặt</CardTitle>
                        <p class="text-[11px] font-bold text-slate-400 mt-0.5">Dữ liệu theo ngày · Tháng 3/2026</p>
                    </div>
                </CardHeader>
                <CardContent class="pt-8">
                    <div class="flex items-end gap-2 h-36">
                        <div v-for="d in dailyTrend" :key="d.label" class="flex flex-1 flex-col items-center gap-3">
                            <div class="relative w-full flex flex-col justify-end h-28 bg-slate-100/50 dark:bg-slate-800/50 rounded-t-md overflow-hidden group">
                                <div class="w-full bg-indigo-500 transition-all duration-700 group-hover:bg-indigo-600"
                                    :style="{ height: `${(d.present / d.total) * 100}%` }">
                                    <div class="absolute inset-0 bg-linear-to-b from-white/20 to-transparent"></div>
                                </div>
                                <div class="absolute bottom-1 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span class="text-[9px] font-black text-white leading-none">{{ d.present }}</span>
                                </div>
                            </div>
                            <span class="text-[9px] font-bold text-slate-400 uppercase">{{ d.label }}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Department performance -->
            <Card class="border-border shadow-none overflow-hidden">
                <CardHeader class="flex flex-row items-center gap-3 border-b bg-slate-50/30 py-4">
                    <div class="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
                        <Users class="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle class="text-[10px] font-black uppercase tracking-widest text-slate-500">Hiệu suất phòng ban</CardTitle>
                        <p class="text-[11px] font-bold text-slate-400 mt-0.5">Tỷ lệ đi làm đúng giờ trung bình</p>
                    </div>
                </CardHeader>
                <CardContent class="pt-6">
                    <div class="space-y-4">
                        <div v-for="d in deptPerformance" :key="d.dept" class="flex items-center gap-4">
                            <span class="w-24 text-[11px] font-black text-slate-500 uppercase shrink-0 transition-colors">{{ d.dept }}</span>
                            <div class="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                                <div :class="['h-full transition-all duration-1000', getRateColor(d.rate)]"
                                    :style="{ width: `${d.rate}%` }">
                                    <div class="h-full w-full bg-linear-to-r from-white/10 to-transparent"></div>
                                </div>
                            </div>
                            <span :class="['text-xs font-black min-w-9 text-right tabular-nums', d.rate >= 95 ? 'text-emerald-600' : 'text-indigo-600']">
                                {{ d.rate }}%
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Bottom section -->
        <div class="grid gap-6 lg:grid-cols-2">
            <Card class="border-border shadow-none overflow-hidden">
                <CardHeader class="flex flex-row items-center gap-3 border-b bg-slate-50/30 py-4">
                    <div class="h-9 w-9 rounded-xl bg-violet-50 dark:bg-violet-950 flex items-center justify-center text-violet-600 shadow-sm border border-violet-100 dark:border-violet-900/50">
                        <PieChart class="h-5 w-5" />
                    </div>
                    <CardTitle class="text-[10px] font-black uppercase tracking-widest text-slate-500">Cơ cấu trạng thái công</CardTitle>
                </CardHeader>
                <CardContent class="pt-6">
                    <div class="flex h-3 w-full overflow-hidden rounded-full mb-6 bg-slate-100 dark:bg-slate-800 shadow-inner">
                        <div v-for="s in statusBreakdown" :key="s.label" :class="['h-full transition-all duration-700', s.color]"
                            :style="{ width: `${s.percent}%` }"></div>
                    </div>
                    <div class="grid grid-cols-3 gap-4">
                        <div v-for="s in statusBreakdown" :key="s.label" class="space-y-1">
                            <div class="flex items-center gap-2">
                                <div :class="['h-2 w-2 rounded-full', s.color]"></div>
                                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ s.label }}</span>
                            </div>
                            <p class="text-sm font-black text-slate-700 dark:text-slate-200">{{ s.percent }}% <span class="text-[10px] text-slate-400 font-medium ml-1">({{ s.count }})</span></p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card class="border-indigo-100 dark:border-indigo-900 border-dashed bg-indigo-50/10 shadow-none flex flex-col justify-center p-8">
                <div class="text-center space-y-3">
                    <div class="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 mx-auto">
                        <TrendingUp class="h-6 w-6" />
                    </div>
                    <h3 class="text-lg font-black text-slate-800 dark:text-white">Dự báo nhân lực tháng sau</h3>
                    <p class="text-sm text-slate-500 leading-relaxed px-4">Dựa trên dữ liệu lịch sử, dự kiến tỷ lệ vắng mặt sẽ <span class="text-emerald-600 font-bold">giảm 15%</span> vào tháng sau nhờ đợt nghỉ lễ kéo dài.</p>
                </div>
            </Card>
        </div>
    </div>
</template>
