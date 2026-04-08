<script setup lang="ts">
import { CheckCircle2, Clock, Star, TrendingUp, ChevronRight, Download, Timer } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/ui/PageHeader.vue'

const userProfile = { fullName: 'Nguyễn Văn A' }

const stats = [
  { label: 'Công', value: '18/22', icon: CheckCircle2, status: 'Đạt' },
  { label: 'Muộn', value: '2', icon: Clock, status: 'Cảnh báo' },
  { label: 'Phép', value: '12', icon: Star, status: 'Còn lại' },
  { label: 'Tổng giờ', value: '156.5', icon: TrendingUp, status: 'Giờ làm' },
]

const recentActivities = [
  { id: 1, title: 'Cập nhật lịch trực tuần sau', time: '2 giờ trước', category: 'Hành chính' },
  { id: 2, title: 'Thông báo nghỉ lễ Giỗ Tổ Hùng Vương', time: '4 giờ trước', category: 'Nhân sự' },
  { id: 3, title: 'Chương trình đào tạo kỹ năng mềm', time: '1 ngày trước', category: 'Đào tạo' },
]
</script>

<template>
  <div class=" space-y-6">
    <PageHeader
      :title="`Xin chào, ${userProfile.fullName.split(' ').pop()}!`"
      :description="new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })"
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" class="h-8 text-[10px] font-bold uppercase tracking-widest gap-2">
            <Download class="h-3 w-3" />
            Xuất báo cáo
          </Button>
          <Button size="sm" class="h-8 bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase tracking-widest gap-2">
            <Timer class="h-3 w-3" />
            Check-in
          </Button>
        </div>
      </template>
    </PageHeader>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <Card
        v-for="stat in stats"
        :key="stat.label"
        class="border-slate-100 shadow-none p-4 sm:p-6 hover:bg-slate-50 transition-all group rounded-xl"
      >
        <div class="flex flex-col">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{
            stat.label
          }}</span>
          <div class="mt-3 flex items-end justify-between">
            <span
              class="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums leading-none group-hover:text-primary transition-colors"
              >{{ stat.value }}</span
            >
            <div
              class="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all"
            >
              <component :is="stat.icon" class="h-4 w-4" />
            </div>
          </div>
          <p class="mt-4 text-[9px] font-bold text-slate-300 uppercase leading-none">{{ stat.status }}</p>
        </div>
      </Card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content: Attendance Chart Simulation -->
      <Card class="lg:col-span-2 border-slate-100 shadow-none overflow-hidden rounded-xl">
        <CardHeader class="p-4 sm:p-6 border-b border-slate-100 bg-white">
          <div class="flex items-center justify-between">
            <div>
              <CardTitle
                class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none"
                >Hiệu suất chuyên cần</CardTitle
              >
              <p class="mt-2 text-xs font-black text-slate-900 uppercase">
                Thống kê 7 ngày qua
              </p>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1.5 shrink-0">
                <div class="h-2 w-2 rounded-full bg-primary"></div>
                <span class="text-[9px] font-bold text-slate-400 uppercase">Hoàn thành</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent class="p-4 sm:p-8">
          <div class="h-[200px] flex items-end justify-between gap-2 sm:gap-4 px-2">
            <div
              v-for="(val, i) in [65, 85, 45, 95, 75, 40, 80]"
              :key="i"
              class="flex-1 flex flex-col items-center gap-4 group"
            >
              <div
                class="w-full bg-slate-50 rounded-xl relative overflow-hidden h-full flex flex-col justify-end"
              >
                <div
                  class="bg-primary group-hover:bg-primary/80 transition-all rounded-t-xl"
                  :style="{ height: `${val}%` }"
                >
                  <div class="absolute top-0 inset-x-0 h-1 bg-white/30"></div>
                </div>
              </div>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{{
                ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i]
              }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Side Content -->
      <div class="space-y-6">
        <!-- Birthday Compact -->
        <Card class="border-slate-100 shadow-none p-5 rounded-xl bg-white">
          <div class="flex items-center gap-4">
            <div
              class="h-14 w-14 shrink-0 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-sm"
            >
              <Star class="h-7 w-7" />
            </div>
            <div>
              <p
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
              >
                Sự kiện tuần này
              </p>
              <h4 class="text-xl font-black text-slate-900 mt-2 leading-none">2 Sinh nhật mới</h4>
              <p
                class="text-[9px] font-bold text-primary mt-1.5 uppercase cursor-pointer hover:underline"
              >
                Xem danh sách
              </p>
            </div>
          </div>
        </Card>

        <!-- Activities -->
        <Card class="border-slate-100 shadow-none overflow-hidden rounded-xl">
          <CardHeader class="p-5 border-b border-slate-100 bg-white">
            <CardTitle
              class="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none"
              >Thông báo & Sự kiện</CardTitle
            >
          </CardHeader>
          <CardContent class="p-0">
            <div class="divide-y divide-slate-50">
              <div
                v-for="act in recentActivities"
                :key="act.id"
                class="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div class="flex gap-4">
                  <div class="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-xs font-black text-slate-800 leading-snug uppercase truncate group-hover:text-primary transition-colors"
                    >
                      {{ act.title }}
                    </p>
                    <div class="flex items-center justify-between mt-1.5">
                      <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        {{ act.category }}
                      </p>
                      <p class="text-[9px] font-black text-slate-300 uppercase leading-none">
                        {{ act.time }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              class="w-full rounded-none border-t border-slate-50 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
            >
              Xem toàn bộ <ChevronRight class="ml-2 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
