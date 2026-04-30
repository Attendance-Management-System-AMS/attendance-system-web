<script setup lang="ts">
import { computed, ref } from 'vue'
import { BarChart3, Clock, UserX, ClipboardList, Download, FileSpreadsheet } from 'lucide-vue-next'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import StatCard from '@/shared/ui/StatCard.vue'
import { useAttendance } from '@/modules/attendance/composables/useAttendance'
import { usePendingLeaveCount } from '@/modules/leaves/composables/useLeaves'
import ExportReportDialog from '../components/ExportReportDialog.vue'

const showExportDialog = ref(false)

const today = new Date()
const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

const { attendanceQuery } = useAttendance({ date: todayKey })
const pendingLeaveCountQuery = usePendingLeaveCount()

const rows = computed(() => attendanceQuery.data.value ?? [])
const pendingLeaves = computed(() => pendingLeaveCountQuery.data.value ?? 0)
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
  { label: 'Có mặt hôm nay', value: present.value, color: 'emerald', icon: BarChart3 },
  { label: 'Đi muộn hôm nay', value: late.value, color: 'amber', icon: Clock },
  { label: 'Vắng hôm nay', value: absent.value, color: 'rose', icon: UserX },
  { label: 'Đơn chờ duyệt', value: pendingLeaves.value, color: 'indigo', icon: ClipboardList },
])
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Báo cáo & Phân tích" description="Theo dõi chỉ số vận hành và xuất dữ liệu chấm công">
      <template #actions>
        <Button @click="showExportDialog = true" class="gap-2 bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20">
          <Download class="h-4 w-4" />
          Xuất bảng công
        </Button>
      </template>
    </PageHeader>

    <!-- Thống kê nhanh -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        v-for="stat in liveStats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :icon="stat.icon"
        :color="(stat.color as any)"
      />
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
      <Card class="shadow-none border-border-standard bg-surface">
        <CardHeader>
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FileSpreadsheet class="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle class="text-base font-bold text-primary-text">Báo cáo khả thi</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <p class="text-xs leading-relaxed text-secondary-text">
            Dữ liệu bảng công tháng đã sẵn sàng để truy xuất. Bạn có thể xuất file Excel chi tiết cho từng nhân viên hoặc tổng hợp toàn công ty.
          </p>
          <Button 
            @click="showExportDialog = true" 
            variant="outline" 
            class="w-full gap-2 border-border-standard hover:bg-elevated"
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
