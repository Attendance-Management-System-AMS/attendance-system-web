<script setup lang="ts">
import { computed, ref } from 'vue'
import { BarChart3, Clock, UserX, ClipboardList, Download, FileSpreadsheet } from 'lucide-vue-next'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { useAttendance } from '@/modules/attendance/composables/useAttendance'
import { useLeaves } from '@/modules/leaves/composables/useLeaves'
import ExportReportDialog from '../components/ExportReportDialog.vue'

const showExportDialog = ref(false)

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
  { label: 'Có mặt hôm nay', value: present.value, color: 'text-emerald-600', bg: 'bg-emerald-500/10', icon: BarChart3 },
  { label: 'Đi muộn hôm nay', value: late.value, color: 'text-amber-600', bg: 'bg-amber-500/10', icon: Clock },
  { label: 'Vắng hôm nay', value: absent.value, color: 'text-rose-600', bg: 'bg-rose-500/10', icon: UserX },
  { label: 'Đơn chờ duyệt', value: pendingLeaves.value, color: 'text-indigo-600', bg: 'bg-indigo-500/10', icon: ClipboardList },
])
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Báo cáo & Phân tích" description="Theo dõi chỉ số vận hành và xuất dữ liệu chấm công">
      <template #actions>
        <Button @click="showExportDialog = true" class="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 shadow-lg">
          <Download class="h-4 w-4" />
          Xuất bảng công
        </Button>
      </template>
    </PageHeader>

    <!-- Thống kê nhanh -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card v-for="stat in liveStats" :key="stat.label" class="shadow-none border-border-subtle bg-card/50">
        <CardContent class="p-5 flex items-center justify-between">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-wider text-tertiary-text">
              {{ stat.label }}
            </p>
            <p :class="['mt-2 text-3xl font-bold', stat.color]">
              {{ stat.value }}
            </p>
          </div>
          <div :class="['h-10 w-10 rounded-lg flex items-center justify-center', stat.bg]">
            <component :is="stat.icon" :class="['h-5 w-5', stat.color]" />
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1fr_350px]">
      <!-- Khu vực phân tích (Placeholder) -->
      <Card class="shadow-none border-dashed border-2 bg-transparent">
        <CardHeader>
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 class="h-4 w-4 text-primary" />
            </div>
            <CardTitle class="text-base font-bold text-primary-text">Phân tích chuyên sâu</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div class="h-16 w-16 rounded-full bg-surface flex items-center justify-center">
            <BarChart3 class="h-8 w-8 text-tertiary-text animate-pulse" />
          </div>
          <div class="max-w-md">
            <p class="text-sm font-semibold text-primary-text">Tính năng đang được phát triển</p>
            <p class="text-xs text-secondary-text mt-1">
              Hệ thống đang chờ tích hợp các dữ liệu KPI, tỷ lệ đúng giờ và dự báo nhân sự từ Backend. 
              Các biểu đồ trực quan sẽ sớm xuất hiện tại đây.
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Panel xuất báo cáo nhanh -->
      <Card class="shadow-none border-emerald-100 bg-emerald-50/20 dark:border-emerald-900/50 dark:bg-emerald-950/10">
        <CardHeader>
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <FileSpreadsheet class="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle class="text-base font-bold text-emerald-900 dark:text-emerald-100">Báo cáo khả thi</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <p class="text-xs leading-relaxed text-emerald-800/80 dark:text-emerald-400">
            Dữ liệu bảng công tháng đã sẵn sàng để truy xuất. Bạn có thể xuất file Excel chi tiết cho từng nhân viên hoặc tổng hợp toàn công ty.
          </p>
          <Button 
            @click="showExportDialog = true" 
            variant="outline" 
            class="w-full gap-2 border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300"
          >
            <Download class="h-3.5 w-3.5" />
            Mở trình xuất Excel
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Export Dialog -->
    <ExportReportDialog v-model:open="showExportDialog" />
  </div>
</template>

