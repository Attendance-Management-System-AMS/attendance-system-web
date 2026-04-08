<script setup lang="ts">
import {
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  CalendarDays,
  Bell,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const monthSummary = {
  workedDays: 18,
  totalDays: 22,
  lateCount: 2,
  leaveBalance: 12,
  totalHours: 156.5,
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header - Compact -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Bảng tin</h1>
        <p class="text-[9px] uppercase font-bold tracking-widest text-slate-400 mt-1">Tổng quan hoạt động</p>
      </div>
    </div>

    <!-- Quick Stats - Square & Responsive -->
    <div class="grid grid-cols-4 gap-2 lg:gap-6">
      <Card class="border-none bg-indigo-50/50 dark:bg-indigo-950/20 shadow-none rounded-md aspect-square sm:aspect-auto">
        <CardContent class="p-1.5 sm:p-6 lg:p-8 flex flex-col items-center justify-center sm:items-start h-full text-center sm:text-left">
          <div class="mb-1 sm:mb-4 text-indigo-600">
            <CheckCircle2 class="h-5 w-5 sm:h-8 sm:w-8" />
          </div>
          <p class="text-[7px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-tighter sm:tracking-widest leading-none mb-0.5 sm:mb-2">Công</p>
          <div class="flex items-baseline gap-0.5 sm:gap-1">
            <span class="text-sm sm:text-3xl font-black text-slate-900 dark:text-white">{{ monthSummary.workedDays }}</span>
            <span class="text-[7px] sm:text-sm font-bold text-slate-400">/{{ monthSummary.totalDays }}</span>
          </div>
        </CardContent>
      </Card>

       <Card class="border-none bg-amber-50/50 dark:bg-amber-950/20 shadow-none rounded-md aspect-square sm:aspect-auto">
        <CardContent class="p-1.5 sm:p-6 lg:p-8 flex flex-col items-center justify-center sm:items-start h-full text-center sm:text-left">
          <div class="mb-1 sm:mb-4 text-amber-600">
            <Clock class="h-5 w-5 sm:h-8 sm:w-8" />
          </div>
          <p class="text-[7px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-tighter sm:tracking-widest leading-none mb-0.5 sm:mb-2">Muộn</p>
          <p class="text-sm sm:text-3xl font-black text-slate-900 dark:text-white">{{ monthSummary.lateCount }}</p>
        </CardContent>
      </Card>

       <Card class="border-none bg-emerald-50/50 dark:bg-emerald-950/20 shadow-none rounded-md aspect-square sm:aspect-auto">
        <CardContent class="p-1.5 sm:p-6 lg:p-8 flex flex-col items-center justify-center sm:items-start h-full text-center sm:text-left">
          <div class="mb-1 sm:mb-4 text-emerald-600">
            <Star class="h-5 w-5 sm:h-8 sm:w-8" />
          </div>
          <p class="text-[7px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-tighter sm:tracking-widest leading-none mb-0.5 sm:mb-2">Phép</p>
          <p class="text-sm sm:text-3xl font-black text-slate-900 dark:text-white">{{ monthSummary.leaveBalance }}</p>
        </CardContent>
      </Card>

      <Card class="border-none bg-violet-50/50 dark:bg-violet-950/20 shadow-none rounded-md aspect-square sm:aspect-auto">
        <CardContent class="p-1.5 sm:p-6 lg:p-8 flex flex-col items-center justify-center sm:items-start h-full text-center sm:text-left">
          <div class="mb-1 sm:mb-4 text-violet-600">
            <TrendingUp class="h-5 w-5 sm:h-8 sm:w-8" />
          </div>
          <p class="text-[7px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-tighter sm:tracking-widest leading-none mb-0.5 sm:mb-2">Tổng h</p>
          <p class="text-sm sm:text-3xl font-black text-slate-900 dark:text-white">{{ monthSummary.totalHours }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- Bottom Content - Responsive -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      <!-- Schedule -->
      <Card class="lg:col-span-2 shadow-none border-border">
        <CardHeader class="py-2.5 px-3 sm:py-4 sm:px-6 bg-slate-50/50 dark:bg-slate-900/50 border-b">
          <div class="flex items-center justify-between">
            <CardTitle class="text-[11px] sm:text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <CalendarDays class="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
              Lịch làm việc hôm nay
            </CardTitle>
            <Badge variant="outline" class="text-[9px] sm:text-[10px] font-bold border-slate-200">9/4 Thứ Tư</Badge>
          </div>
        </CardHeader>
        <CardContent class="p-3 sm:p-6 lg:p-8">
          <div class="rounded-md sm:rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/10 p-2.5 sm:p-6 flex items-center gap-3 sm:gap-6">
            <div class="h-9 w-9 sm:h-14 sm:w-14 shrink-0 rounded bg-white dark:bg-slate-900 flex items-center justify-center border border-indigo-50 shadow-sm">
              <Clock class="h-4 w-4 sm:h-7 sm:w-7 text-indigo-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[8px] sm:text-[11px] font-bold text-indigo-600 uppercase tracking-widest leading-none mb-1">Ca hành chính</p>
              <p class="text-sm sm:text-2xl font-black text-slate-900 dark:text-white leading-none">08:00 — 17:30</p>
            </div>
            <Badge class="bg-indigo-600 text-[8px] sm:text-[10px] px-1.5 sm:px-3 h-4 sm:h-6 font-bold">VĂN PHÒNG CHÍNH</Badge>
          </div>
          <div class="grid grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-6">
            <div class="p-2 sm:p-4 rounded-md border border-slate-100 bg-slate-50/50 flex flex-col items-center sm:items-start">
              <span class="text-[7px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Vào lúc</span>
              <span class="text-xs sm:text-base font-bold text-slate-700">07:55 AM</span>
            </div>
            <div class="p-2 sm:p-4 rounded-md border border-slate-100 bg-slate-50/50 flex flex-col items-center sm:items-start">
              <span class="text-[7px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ra lúc</span>
              <span class="text-xs sm:text-base font-bold text-slate-700">17:35 PM</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Notifications -->
      <Card class="shadow-none border-border h-full">
        <CardHeader class="py-2.5 px-3 sm:py-4 sm:px-6 bg-slate-50/50 dark:bg-slate-900/50 border-b">
          <CardTitle class="text-[11px] sm:text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Bell class="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
            Tin nội bộ
          </CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <div class="divide-y divide-slate-100 dark:divide-slate-800">
            <div v-for="i in 3" :key="i" class="p-2.5 sm:p-5 hover:bg-slate-50 transition-colors">
              <div class="flex gap-2 sm:gap-4">
                <div class="h-1 w-1 sm:h-1.5 sm:w-1.5 mt-1.5 rounded-full bg-indigo-600 shrink-0"></div>
                <div class="min-w-0">
                  <div class="flex items-center justify-between gap-2 mb-1">
                    <p class="text-[8px] sm:text-[10px] font-bold text-indigo-600/70 uppercase tracking-widest">Nhân sự</p>
                    <span class="text-[8px] sm:text-[10px] font-medium text-slate-400">2h trước</span>
                  </div>
                  <h4 class="text-[11px] sm:text-sm font-bold text-slate-900 dark:text-white truncate">Nghỉ lễ Giỗ tổ Hùng Vương</h4>
                  <p class="text-[10px] sm:text-[12px] text-slate-500 line-clamp-1 mt-1">Cán bộ công nhân viên được nghỉ 01 ngày (Thứ Năm, 18/04)...</p>
                </div>
              </div>
            </div>
          </div>
          <div class="p-2 sm:p-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" class="w-full text-[9px] sm:text-[11px] font-black uppercase h-7 sm:h-10 text-slate-400 hover:text-indigo-600">Tất cả thông báo</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Birthday Compact -->
    <Card class="border-border shadow-none p-2 rounded-md">
      <div class="flex items-center gap-3">
        <div class="h-7 w-7 rounded bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
          <Star class="h-3.5 w-3.5" />
        </div>
        <div>
          <p class="text-[11px] font-black text-slate-800 dark:text-white leading-none">Tuần có 2 sinh nhật !</p>
        </div>
      </div>
    </Card>
  </div>
</template>
