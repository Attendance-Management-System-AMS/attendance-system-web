<script setup lang="ts">
import { CheckCircle2, Clock, Star, TrendingUp, Bell } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
        <h1 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
          Bảng tin
        </h1>
        <p class="text-[9px] uppercase font-bold tracking-widest text-slate-400 mt-1">
          Tổng quan hoạt động
        </p>
      </div>
    </div>

    <!-- Quick Stats - Compact Indigo Theme -->
    <div class="grid grid-cols-4 gap-2 lg:gap-4">
      <Card
        v-for="stat in [
          {
            label: 'Công',
            value: monthSummary.workedDays,
            total: monthSummary.totalDays,
            icon: CheckCircle2,
          },
          { label: 'Muộn', value: monthSummary.lateCount, icon: Clock },
          { label: 'Phép', value: monthSummary.leaveBalance, icon: Star },
          { label: 'Tổng h', value: monthSummary.totalHours, icon: TrendingUp },
        ]"
        :key="stat.label"
        class="border-none bg-indigo-50/40 dark:bg-indigo-950/20 shadow-none rounded-md"
      >
        <CardContent class="p-1.5 sm:p-5 flex flex-col items-center justify-center text-center">
          <div class="mb-1 sm:mb-2 text-indigo-600">
            <component :is="stat.icon" class="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <p
            class="text-[7px] sm:text-[10px] font-bold text-indigo-600/60 uppercase tracking-tighter leading-none mb-0.5"
          >
            {{ stat.label }}
          </p>
          <div class="flex items-baseline gap-0.5">
            <span class="text-xs sm:text-2xl font-black text-slate-800 dark:text-white">{{
              stat.value
            }}</span>
            <span v-if="stat.total" class="text-[7px] sm:text-sm font-bold text-slate-400"
              >/{{ stat.total }}</span
            >
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
      <!-- Notifications - Occupies 8/12 on LG -->
      <Card class="lg:col-span-8 shadow-none border-border h-full flex flex-col">
        <CardHeader class="py-3 px-4 sm:py-4 sm:px-6 bg-slate-50/50 dark:bg-slate-900/50 border-b">
          <CardTitle
            class="text-[11px] sm:text-sm font-black uppercase tracking-widest flex items-center gap-2"
          >
            <Bell class="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
            Bảng tin & Thông báo nội bộ
          </CardTitle>
        </CardHeader>
        <CardContent class="p-0 flex-1">
          <div class="divide-y divide-slate-100 dark:divide-slate-800">
            <div
              v-for="i in 5"
              :key="i"
              class="p-3 sm:p-6 hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div class="flex gap-3 sm:gap-5">
                <div class="h-1 w-1 sm:h-2 sm:w-2 mt-2 rounded-full bg-indigo-600 shrink-0"></div>
                <div class="min-w-0 flex-1">
                  <div
                    class="flex items-center justify-between gap-2 mb-1 sm:mb-2 text-[8px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400"
                  >
                    <span>Phòng Nhân sự</span>
                    <span>2 giờ trước</span>
                  </div>
                  <h4
                    class="text-xs sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors"
                  >
                    Thông báo quan trọng về lịch nghỉ lễ và các hoạt động nội bộ {{ 2024 + i }}
                  </h4>
                  <p
                    class="text-[10px] sm:text-sm text-slate-500 line-clamp-2 mt-1 leading-relaxed"
                  >
                    Đây là nội dung tóm tắt chi tiết của thông báo. Toàn thể cán bộ nhân viên lưu ý
                    thực hiện đúng theo quy định đề ra...
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="p-3 sm:p-5 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              class="w-full text-[10px] sm:text-xs font-black uppercase h-8 sm:h-11 text-slate-400 hover:text-indigo-600"
              >Xem tất cả bảng tin</Button
            >
          </div>
        </CardContent>
      </Card>

      <!-- Side Column - Occupies 4/12 on LG -->
      <div class="lg:col-span-4 space-y-4 lg:space-y-6">
        <!-- Birthday Compact -->
        <Card class="border-border shadow-none p-3 sm:p-6 rounded-md sm:rounded-xl">
          <div class="flex items-center gap-4">
            <div
              class="h-9 w-9 sm:h-14 sm:w-14 shrink-0 rounded sm:rounded-2xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500 border border-amber-100 dark:border-amber-900/50 shadow-sm"
            >
              <Star class="h-4 w-4 sm:h-7 sm:w-7" />
            </div>
            <div>
              <p
                class="text-xs sm:text-base font-black text-slate-800 dark:text-white leading-none"
              >
                Tuần có 2 sinh nhật !
              </p>
              <p
                class="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5 sm:mt-2"
              >
                Tháng 04 vui vẻ
              </p>
            </div>
          </div>
        </Card>

        <!-- Quick Tips card -->
        <Card
          class="border-indigo-600/10 bg-indigo-50/10 dark:bg-indigo-950/5 shadow-none p-3 sm:p-6 rounded-md sm:rounded-xl"
        >
          <p
            class="text-[9px] sm:text-[11px] font-bold text-indigo-600 uppercase tracking-widest leading-none mb-3"
          >
            Mẹo hôm nay
          </p>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Đừng quên check-in đúng giờ để nhận đầy đủ điểm chuyên cần tháng này nhé!
          </p>
        </Card>
      </div>
    </div>
  </div>
</template>
