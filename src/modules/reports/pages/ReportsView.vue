<script setup lang="ts">
import { computed } from 'vue'
import { BarChart3, Download, FileSpreadsheet, ShieldAlert } from 'lucide-vue-next'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { useAttendance } from '@/modules/attendance/composables/useAttendance'
import { useLeaves } from '@/modules/leaves/composables/useLeaves'

const today = new Date()
const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

const { attendanceQuery } = useAttendance({ date: todayKey })
const { leavesQuery } = useLeaves()

const rows = computed(() => attendanceQuery.data.value ?? [])
const pendingLeaves = computed(() =>
  (leavesQuery.data.value ?? []).filter((leave) => String(leave.status).toUpperCase() === 'PENDING').length,
)
const present = computed(() =>
  rows.value.filter((row) =>
    ['PRESENT', 'LATE', 'EARLY_LEAVE', 'LATE_AND_EARLY_LEAVE', 'MISSING_CHECKOUT'].includes(String(row.status).toUpperCase()),
  ).length,
)
const late = computed(() =>
  rows.value.filter((row) => ['LATE', 'LATE_AND_EARLY_LEAVE'].includes(String(row.status).toUpperCase())).length,
)
const absent = computed(() =>
  rows.value.filter((row) => String(row.status).toUpperCase() === 'ABSENT').length,
)

const liveStats = computed(() => [
  { label: 'Có mặt hôm nay', value: present.value },
  { label: 'Đi muộn hôm nay', value: late.value },
  { label: 'Vắng hôm nay', value: absent.value },
  { label: 'Đơn chờ duyệt', value: pendingLeaves.value },
])
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Báo cáo & phân tích" description="Số liệu nhanh lấy từ dữ liệu chấm công hiện tại">
      <template #actions>
        <Button as-child class="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <RouterLink to="/export">
            <Download class="h-4 w-4" />
            Xuất bảng công
          </RouterLink>
        </Button>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card v-for="stat in liveStats" :key="stat.label" class="shadow-none">
        <CardContent class="p-5">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {{ stat.label }}
          </p>
          <p class="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {{ stat.value }}
          </p>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <Card class="shadow-none">
        <CardHeader class="border-b">
          <div class="flex items-center gap-3">
            <BarChart3 class="h-5 w-5 text-emerald-600" />
            <CardTitle class="text-sm font-bold">Phân tích nâng cao</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="space-y-3 p-5 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Các biểu đồ xu hướng theo tuần, phòng ban và dự báo nhân lực đã được bỏ khỏi màn hình
            này vì chưa có API tổng hợp tương ứng.
          </p>
          <p>
            Nên bổ sung endpoint backend cho KPI theo khoảng ngày, breakdown theo phòng ban và tỷ lệ
            đúng giờ trước khi hiển thị biểu đồ phân tích.
          </p>
        </CardContent>
      </Card>

      <Card class="border-emerald-200 bg-emerald-50/40 shadow-none dark:border-emerald-900 dark:bg-emerald-950/20">
        <CardHeader class="border-b border-emerald-100 dark:border-emerald-900">
          <div class="flex items-center gap-3">
            <FileSpreadsheet class="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
            <CardTitle class="text-sm font-bold">Báo cáo khả dụng</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="space-y-4 p-5 text-sm text-emerald-900 dark:text-emerald-100">
          <p>
            File Excel bảng công tháng đã có API thật và có thể xuất theo toàn công ty, phòng ban
            hoặc từng nhân viên.
          </p>
          <Button as-child variant="outline" class="gap-2 border-emerald-300 bg-white/70">
            <RouterLink to="/export">
              <ShieldAlert class="h-4 w-4" />
              Mở trang xuất báo cáo
            </RouterLink>
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
