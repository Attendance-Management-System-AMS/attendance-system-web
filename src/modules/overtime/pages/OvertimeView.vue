<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Clock3, Search, X } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import {
  formatMinutes,
  overtimeStatusClass,
  overtimeStatusLabel,
  useOvertimeRequests,
} from '@/modules/overtime/composables/useOvertime'
import type { OvertimeRequest } from '@/modules/overtime/types/overtime.types'

const filters = ref({
  page: 0,
  size: 100,
  sort: 'createdAt',
  sortDir: 'desc',
  status: '',
  keyword: '',
})
const approvalNote = ref('')

const { overtimeQuery, approveOvertime, rejectOvertime } = useOvertimeRequests(filters)

const requests = computed(() => overtimeQuery.data.value?.content ?? [])
const pendingCount = computed(() => requests.value.filter((item) => item.status === 'PENDING').length)
const approvedMinutes = computed(() =>
  requests.value
    .filter((item) => item.status === 'APPROVED')
    .reduce((sum, item) => sum + (item.requestedMinutes ?? 0), 0),
)
const payableMinutes = computed(() =>
  requests.value.reduce((sum, item) => sum + (item.payableOvertimeMinutes ?? 0), 0),
)

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

async function approve(id: number) {
  try {
    await approveOvertime.mutateAsync({ id, note: approvalNote.value })
    toast.success('Đã duyệt đơn tăng ca. Bảng công sẽ hiện OT khi có checkout khớp khung giờ duyệt.')
    approvalNote.value = ''
  } catch (err) {
    toast.error(getApiErrorMessage(err, 'Không thể duyệt đơn tăng ca'))
  }
}

async function reject(id: number) {
  try {
    await rejectOvertime.mutateAsync({ id, note: approvalNote.value })
    toast.success('Đã từ chối đơn tăng ca')
    approvalNote.value = ''
  } catch (err) {
    toast.error(getApiErrorMessage(err, 'Không thể từ chối đơn tăng ca'))
  }
}

function attendanceOvertimeLabel(request: OvertimeRequest) {
  if (!request.hasAttendance) return 'Chưa có bảng công'

  switch (String(request.attendanceOvertimeStatus || '').toUpperCase()) {
    case 'APPROVED':
      return 'Đã tính công'
    case 'PENDING_APPROVAL':
      return 'Chờ duyệt OT'
    case 'NO_CHECKOUT':
      return 'Thiếu checkout'
    case 'UNAPPROVED':
      return 'Chưa có đơn duyệt'
    case 'REJECTED':
      return 'Không tính OT'
    default:
      return 'Chưa phát sinh OT'
  }
}

function attendanceOvertimeClass(request: OvertimeRequest) {
  if (!request.hasAttendance) return 'border-slate-500/20 bg-slate-500/10 text-slate-500'

  switch (String(request.attendanceOvertimeStatus || '').toUpperCase()) {
    case 'APPROVED':
      return 'border-indigo-500/20 bg-indigo-500/10 text-indigo-500'
    case 'PENDING_APPROVAL':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-500'
    case 'NO_CHECKOUT':
      return 'border-orange-500/20 bg-orange-500/10 text-orange-500'
    case 'REJECTED':
      return 'border-rose-500/20 bg-rose-500/10 text-rose-500'
    default:
      return 'border-slate-500/20 bg-slate-500/10 text-slate-500'
  }
}

function attendanceOvertimeHint(request: OvertimeRequest) {
  if (!request.hasAttendance) return 'Chưa có check-in/check-out ngày này'
  if (String(request.attendanceOvertimeStatus || '').toUpperCase() === 'NO_CHECKOUT') {
    return 'Cần checkout hoặc giải trình giờ ra'
  }
  return `Thực tế ${formatMinutes(request.actualOvertimeMinutes)} • Tính công ${formatMinutes(request.payableOvertimeMinutes)}`
}
</script>

<template>
  <div class="space-y-5">
    <PageHeader
      title="Quản lý tăng ca"
      description="Duyệt đơn tăng ca và theo dõi thời gian ngoài giờ của nhân sự."
    />

    <div class="grid gap-3 sm:grid-cols-3">
      <Card class="border-border-subtle bg-card shadow-none">
        <CardContent class="flex items-center gap-3 p-4">
          <div class="rounded-xl bg-amber-500/10 p-3 text-amber-500">
            <Clock3 class="h-5 w-5" />
          </div>
          <div>
            <p class="text-xs font-medium text-tertiary-text">Đang chờ duyệt</p>
            <p class="mt-1 text-2xl font-semibold text-primary-text">{{ pendingCount }}</p>
          </div>
        </CardContent>
      </Card>
      <Card class="border-border-subtle bg-card shadow-none">
        <CardContent class="flex items-center gap-3 p-4">
          <div class="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
            <Check class="h-5 w-5" />
          </div>
          <div>
            <p class="text-xs font-medium text-tertiary-text">Giờ OT đã duyệt trong danh sách</p>
            <p class="mt-1 text-2xl font-semibold text-primary-text">{{ formatMinutes(approvedMinutes) }}</p>
          </div>
        </CardContent>
      </Card>
      <Card class="border-border-subtle bg-card shadow-none">
        <CardContent class="flex items-center gap-3 p-4">
          <div class="rounded-xl bg-indigo-500/10 p-3 text-indigo-500">
            <Clock3 class="h-5 w-5" />
          </div>
          <div>
            <p class="text-xs font-medium text-tertiary-text">OT tính công trong danh sách</p>
            <p class="mt-1 text-2xl font-semibold text-primary-text">{{ formatMinutes(payableMinutes) }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card class="border-border-standard bg-card shadow-none">
      <CardContent class="grid gap-3 p-4 lg:grid-cols-[1fr_180px_220px]">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary-text" />
          <Input v-model="filters.keyword" class="pl-9" placeholder="Tìm theo lý do..." />
        </div>
        <select
          v-model="filters.status"
          class="h-10 rounded-md border border-border-standard bg-surface px-3 text-sm text-primary-text"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Từ chối</option>
          <option value="CANCELLED">Đã huỷ</option>
        </select>
        <Textarea v-model="approvalNote" class="min-h-10" placeholder="Ghi chú duyệt/từ chối..." />
      </CardContent>
    </Card>

    <div v-if="overtimeQuery.isLoading.value" class="flex h-56 items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>

    <div v-else class="overflow-hidden rounded-xl border border-border-standard bg-card shadow-none">
      <div class="overflow-x-auto">
        <table class="w-full min-w-230 border-collapse">
          <thead>
            <tr class="border-b border-border bg-surface/50">
              <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-text">Nhân viên</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-text">Ngày</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-text">Khung giờ</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-text">Thời lượng</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-text">Lý do</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-text">Trạng thái</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-text">Tác động bảng công</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-secondary-text">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-subtle">
            <tr v-if="requests.length === 0">
              <td colspan="8" class="px-4 py-12 text-center text-sm text-tertiary-text">
                Không có đơn tăng ca phù hợp.
              </td>
            </tr>
            <tr v-for="request in requests" :key="request.id" class="hover:bg-elevated/60">
              <td class="px-4 py-3">
                <p class="text-sm font-semibold text-primary-text">
                  {{ request.employeeFullName || `NV #${request.employeeId}` }}
                </p>
                <p class="text-xs text-tertiary-text">
                  {{ request.employeeCode || 'Chưa có mã' }}
                  <span v-if="request.departmentName">• {{ request.departmentName }}</span>
                </p>
              </td>
              <td class="px-4 py-3 text-sm text-secondary-text">{{ formatDate(request.workDate) }}</td>
              <td class="px-4 py-3 font-mono text-xs text-secondary-text">
                {{ request.startTime?.slice(0, 5) }} - {{ request.endTime?.slice(0, 5) }}
              </td>
              <td class="px-4 py-3 text-sm font-semibold text-primary-text">
                {{ formatMinutes(request.requestedMinutes) }}
              </td>
              <td class="max-w-70 px-4 py-3 text-xs text-secondary-text">
                <span class="line-clamp-2">{{ request.reason || 'Không có lý do' }}</span>
              </td>
              <td class="px-4 py-3">
                <Badge
                  variant="outline"
                  :class="['border px-2 text-[11px] font-semibold', overtimeStatusClass(request.status)]"
                >
                  {{ overtimeStatusLabel(request.status) }}
                </Badge>
              </td>
              <td class="px-4 py-3">
                <div class="space-y-1">
                  <Badge
                    variant="outline"
                    :class="[
                      'border px-2 text-[11px] font-semibold',
                      attendanceOvertimeClass(request),
                    ]"
                  >
                    {{ attendanceOvertimeLabel(request) }}
                  </Badge>
                  <p class="text-xs text-tertiary-text">{{ attendanceOvertimeHint(request) }}</p>
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                <div v-if="request.status === 'PENDING'" class="flex justify-end gap-2">
                  <Button
                    size="sm"
                    class="gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
                    :disabled="approveOvertime.isPending.value"
                    @click="approve(request.id)"
                  >
                    <Check class="h-3.5 w-3.5" />
                    Duyệt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    class="gap-1 border-rose-500/30 text-rose-500"
                    :disabled="rejectOvertime.isPending.value"
                    @click="reject(request.id)"
                  >
                    <X class="h-3.5 w-3.5" />
                    Từ chối
                  </Button>
                </div>
                <span v-else class="text-xs text-tertiary-text">Đã xử lý</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
