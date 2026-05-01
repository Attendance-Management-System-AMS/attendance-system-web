<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  Info,
  Plane,
  Plus,
  Stethoscope,
  TimerReset,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import PageHeader from '@/shared/ui/PageHeader.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import { useMyLeaves } from '@/modules/leaves/composables/useMyLeaves'
import {
  formatMinutes,
  overtimeStatusLabel,
  useMyOvertimeRequests,
} from '@/modules/overtime/composables/useOvertime'
import type { LeaveRequest } from '@/modules/leaves/types/leave.types'
import type { OvertimeRequest } from '@/modules/overtime/types/overtime.types'

type RequestKind = 'LEAVE' | 'OVERTIME'

type MyRequestForm = {
  requestKind: RequestKind
  leaveTypeCode: string
  fromDate: string
  toDate: string
  reason: string
  correctedCheckIn: string
  correctedCheckOut: string
  overtimeDate: string
  overtimeStartTime: string
  overtimeEndTime: string
}

type UnifiedRequest = {
  id: string
  kind: 'leave' | 'overtime'
  title: string
  dateLabel: string
  status: string
  statusLabel: string
  reason?: string | null
  createdAt?: string | null
  extra?: string
  leaveTypeCode?: string
}

const { leavesQuery, createMe, leaveTypesQuery } = useMyLeaves()
const { overtimeQuery, createOvertime } = useMyOvertimeRequests({
  page: 0,
  size: 50,
  sort: 'createdAt',
  sortDir: 'desc',
})

const route = useRoute()
const router = useRouter()
const isCreateModalOpen = ref(false)

const today = new Date()
const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

const createEmptyRequest = (): MyRequestForm => ({
  requestKind: 'LEAVE',
  leaveTypeCode: '',
  fromDate: '',
  toDate: '',
  reason: '',
  correctedCheckIn: '',
  correctedCheckOut: '',
  overtimeDate: todayKey,
  overtimeStartTime: '17:00',
  overtimeEndTime: '19:00',
})

const newRequest = ref<MyRequestForm>(createEmptyRequest())

const resetForm = () => {
  newRequest.value = createEmptyRequest()
}

const getLeaveTypeLabel = (request: {
  leaveType?: { name?: string } | string
  leaveTypeName?: string
  leaveTypeCode?: string
}) => {
  if (request.leaveType && typeof request.leaveType === 'object' && request.leaveType.name) {
    return request.leaveType.name
  }

  if (typeof request.leaveType === 'string' && request.leaveType.trim()) {
    return request.leaveType
  }

  return request.leaveTypeName || request.leaveTypeCode || 'Đơn từ'
}

const openCorrectionRequest = async (date: string) => {
  resetForm()
  newRequest.value.requestKind = 'LEAVE'
  newRequest.value.leaveTypeCode = 'AC'
  newRequest.value.fromDate = date
  newRequest.value.toDate = date
  isCreateModalOpen.value = true

  const nextQuery = { ...route.query }
  delete nextQuery.type
  delete nextQuery.date
  await router.replace({ query: nextQuery })
}

watch(
  () => [route.query.type, route.query.date] as const,
  ([type, date]) => {
    if (type === 'AC' && typeof date === 'string' && date) {
      void openCorrectionRequest(date)
    }
  },
  { immediate: true },
)

watch(
  () => newRequest.value.leaveTypeCode,
  (newVal) => {
    if (newRequest.value.requestKind === 'LEAVE' && newVal === 'AC' && newRequest.value.fromDate) {
      newRequest.value.toDate = newRequest.value.fromDate
    }
  },
)

const leaves = computed(() => leavesQuery.data.value?.content || [])
const overtimeRequests = computed(() => overtimeQuery.data.value?.content || [])
const isLoading = computed(() => leavesQuery.isLoading.value || overtimeQuery.isLoading.value)
const isSubmitting = computed(() => createMe.isPending.value || createOvertime.isPending.value)

const formatDateRange = (from?: string, to?: string) => {
  if (!from) return '-'
  const fmt = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' })
  const f = fmt.format(new Date(from))
  const t = to ? fmt.format(new Date(to)) : ''
  return t && t !== f ? `${f} - ${t}` : f
}

const normalizeCreatedAt = (value?: string | null) => {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

const toLeaveRequestItem = (request: LeaveRequest): UnifiedRequest => ({
  id: `leave-${request.id}`,
  kind: 'leave',
  title: getLeaveTypeLabel(request),
  dateLabel: formatDateRange(request.fromDate || request.startDate, request.toDate || request.endDate),
  status: request.status,
  statusLabel: getStatusLabel(request.status),
  reason: request.reason,
  createdAt: request.createdAt || request.fromDate || request.startDate,
  leaveTypeCode: request.leaveTypeCode,
  extra:
    request.leaveTypeCode === 'AC' && (request.correctedCheckIn || request.correctedCheckOut)
      ? `Bổ sung công: ${request.correctedCheckIn || '--:--'} - ${request.correctedCheckOut || '--:--'}`
      : undefined,
})

const toOvertimeRequestItem = (request: OvertimeRequest): UnifiedRequest => ({
  id: `overtime-${request.id}`,
  kind: 'overtime',
  title: 'Tăng ca',
  dateLabel: formatDateRange(request.workDate, request.workDate),
  status: request.status,
  statusLabel: overtimeStatusLabel(request.status),
  reason: request.reason,
  createdAt: request.createdAt || request.workDate,
  extra: `${request.startTime?.slice(0, 5)} - ${request.endTime?.slice(0, 5)} • ${formatMinutes(request.requestedMinutes)}`,
})

const requests = computed(() =>
  [
    ...leaves.value.map(toLeaveRequestItem),
    ...overtimeRequests.value.map(toOvertimeRequestItem),
  ].sort((left, right) => normalizeCreatedAt(right.createdAt) - normalizeCreatedAt(left.createdAt)),
)

function getStatusLabel(status: string) {
  switch (String(status || '').toLowerCase()) {
    case 'approved':
      return 'Đã duyệt'
    case 'rejected':
      return 'Từ chối'
    case 'cancelled':
      return 'Đã huỷ'
    case 'pending':
      return 'Chờ duyệt'
    default:
      return status
  }
}

function getStatusClass(status: string) {
  switch (String(status || '').toLowerCase()) {
    case 'approved':
      return 'bg-emerald-500/10 text-emerald-500'
    case 'rejected':
      return 'bg-rose-500/10 text-rose-500'
    case 'cancelled':
      return 'bg-slate-500/10 text-slate-500'
    default:
      return 'bg-amber-500/10 text-amber-500'
  }
}

function getCategoryIcon(request: UnifiedRequest) {
  if (request.kind === 'overtime') return TimerReset

  const type = String(request.title || request.leaveTypeCode || '').toLowerCase()
  if (type.includes('giải trình') || type.includes('attendance correction') || type === 'ac') return Clock
  if (type.includes('phép')) return Plane
  if (type.includes('ốm')) return Stethoscope
  if (type.includes('tác')) return Briefcase
  return FileText
}

const handleCreateRequest = () => {
  resetForm()
  isCreateModalOpen.value = true
}

async function submitOvertimeRequest() {
  if (
    !newRequest.value.overtimeDate ||
    !newRequest.value.overtimeStartTime ||
    !newRequest.value.overtimeEndTime ||
    !newRequest.value.reason.trim()
  ) {
    toast.error('Vui lòng điền đầy đủ thông tin tăng ca')
    return
  }

  await createOvertime.mutateAsync({
    workDate: newRequest.value.overtimeDate,
    startTime: newRequest.value.overtimeStartTime,
    endTime: newRequest.value.overtimeEndTime,
    reason: newRequest.value.reason,
  })
}

async function submitLeaveRequest() {
  if (!newRequest.value.leaveTypeCode || !newRequest.value.fromDate || !newRequest.value.reason) {
    toast.error('Vui lòng điền đầy đủ thông tin')
    return
  }

  if (newRequest.value.leaveTypeCode === 'AC') {
    newRequest.value.toDate = newRequest.value.fromDate
    if (!newRequest.value.correctedCheckIn && !newRequest.value.correctedCheckOut) {
      toast.error('Vui lòng điền ít nhất giờ vào hoặc giờ ra bổ sung')
      return
    }
  } else if (!newRequest.value.toDate) {
    toast.error('Vui lòng điền ngày kết thúc')
    return
  }

  await createMe.mutateAsync({
    leaveTypeCode: newRequest.value.leaveTypeCode,
    fromDate: newRequest.value.fromDate,
    toDate: newRequest.value.toDate,
    reason: newRequest.value.reason,
    correctedCheckIn: newRequest.value.correctedCheckIn || null,
    correctedCheckOut: newRequest.value.correctedCheckOut || null,
  })
}

const handleSubmit = async () => {
  try {
    if (newRequest.value.requestKind === 'OVERTIME') {
      await submitOvertimeRequest()
      toast.success('Gửi đơn tăng ca thành công! Đang chờ duyệt.')
    } else {
      await submitLeaveRequest()
      toast.success('Gửi đơn thành công! Đang chờ duyệt.')
    }

    isCreateModalOpen.value = false
    resetForm()
  } catch (err) {
    toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra khi gửi đơn'))
  }
}
</script>

<template>
  <div class="space-y-5">
    <PageHeader
      title="Đơn từ"
      description="Theo dõi nghỉ phép, giải trình công và tăng ca trong cùng một nơi."
    >
      <template #actions>
        <Button
          @click="handleCreateRequest"
          data-testid="my-requests-create"
          class="h-9 rounded-lg bg-primary px-4 text-xs font-semibold shadow-none hover:bg-primary/90"
        >
          <Plus class="h-3.5 w-3.5" />
          Tạo đơn
        </Button>
      </template>
    </PageHeader>

    <div v-if="isLoading" class="flex h-64 items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>

    <div
      v-else-if="requests.length === 0"
      class="rounded-xl border-2 border-dashed border-border-subtle bg-surface/50 py-20 text-center"
    >
      <FileText class="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
      <p class="text-sm font-semibold text-tertiary-text">Bạn chưa có đơn từ nào</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <Card
        v-for="request in requests"
        :key="request.id"
        class="overflow-hidden rounded-xl border-border-standard bg-card shadow-none transition-all hover:border-primary/30 hover:bg-primary/5"
      >
        <CardContent class="p-4">
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-2">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"
              >
                <component :is="getCategoryIcon(request)" class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="truncate text-sm font-semibold leading-none text-primary-text">
                    {{ request.title }}
                  </h3>
                  <Badge
                    variant="outline"
                    :class="[
                      'h-5 shrink-0 rounded-md border-none px-2 text-[10px] font-semibold',
                      getStatusClass(request.status),
                    ]"
                  >
                    {{ request.statusLabel }}
                  </Badge>
                </div>
                <div class="mt-1 flex items-center gap-1.5">
                  <span class="text-xs font-medium text-tertiary-text">
                    {{ request.dateLabel }}
                  </span>
                  <span v-if="request.kind === 'overtime'" class="text-xs text-tertiary-text">
                    • Tăng ca
                  </span>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground/40">
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
          <div class="mt-3 pl-12">
            <p class="line-clamp-1 text-xs font-medium italic text-secondary-text">
              "{{ request.reason || 'Không có lý do' }}"
            </p>
            <p v-if="request.extra" class="mt-2 text-[11px] font-medium text-tertiary-text">
              {{ request.extra }}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <Dialog
      :open="isCreateModalOpen"
      @update:open="
        (open) => {
          isCreateModalOpen = open
          if (!open) resetForm()
        }
      "
    >
      <DialogContent
        class="max-w-[calc(100vw-32px)] overflow-hidden rounded-lg border-none p-0 shadow-2xl sm:max-w-112.5"
      >
        <DialogHeader class="border-b border-primary/10 bg-card p-4 sm:p-6">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10"
            >
              <Plus class="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle class="text-lg font-semibold text-primary-text">Tạo đơn mới</DialogTitle>
              <DialogDescription class="mt-0.5 text-xs font-medium text-tertiary-text">
                Chọn loại đơn, hệ thống sẽ tự đổi biểu mẫu phù hợp.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div class="space-y-4 bg-card p-4 sm:p-6">
          <div class="space-y-1.5">
            <Label class="flex items-center gap-1.5 px-0.5 text-[10px] font-semibold tracking-normal text-tertiary-text">
              <Info class="h-3 w-3 text-primary/50" />
              Nhóm đơn
            </Label>
            <Select v-model="newRequest.requestKind">
              <SelectTrigger
                class="h-10 rounded-lg border-primary/10 bg-primary/5 font-bold text-primary-text shadow-none focus:ring-1 focus:ring-primary"
              >
                <SelectValue placeholder="Chọn nhóm đơn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LEAVE">Nghỉ phép / Giải trình công</SelectItem>
                <SelectItem value="OVERTIME">Tăng ca</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="newRequest.requestKind === 'LEAVE'" class="space-y-4">
            <div class="space-y-1.5">
              <Label class="flex items-center gap-1.5 px-0.5 text-[10px] font-semibold tracking-normal text-tertiary-text">
                <Info class="h-3 w-3 text-primary/50" />
                Loại đơn từ
              </Label>
              <Select v-model="newRequest.leaveTypeCode">
                <SelectTrigger
                  data-testid="my-requests-leave-type"
                  class="h-10 rounded-lg border-primary/10 bg-primary/5 font-bold text-primary-text shadow-none focus:ring-1 focus:ring-primary"
                >
                  <SelectValue placeholder="Chọn loại đơn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="type in leaveTypesQuery.data.value" :key="type.code" :value="type.code">
                    {{ type.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5" :class="{ 'col-span-2': newRequest.leaveTypeCode === 'AC' }">
                <Label class="flex items-center gap-1.5 px-0.5 text-[10px] font-semibold tracking-normal text-tertiary-text">
                  <Calendar class="h-3 w-3 text-tertiary-text" />
                  <span v-if="newRequest.leaveTypeCode === 'AC'">Ngày giải trình</span>
                  <span v-else>Từ ngày</span>
                </Label>
                <Input
                  v-model="newRequest.fromDate"
                  @change="() => { if (newRequest.leaveTypeCode === 'AC') newRequest.toDate = newRequest.fromDate }"
                  data-testid="my-requests-from-date"
                  type="date"
                  class="h-10 rounded-lg border-border-subtle bg-surface font-bold text-primary-text shadow-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div v-if="newRequest.leaveTypeCode !== 'AC'" class="space-y-1.5">
                <Label class="flex items-center gap-1.5 px-0.5 text-[10px] font-semibold tracking-normal text-tertiary-text">
                  <Calendar class="h-3 w-3 text-tertiary-text" />
                  Đến ngày
                </Label>
                <Input
                  v-model="newRequest.toDate"
                  data-testid="my-requests-to-date"
                  type="date"
                  class="h-10 rounded-lg border-border-subtle bg-surface font-bold text-primary-text shadow-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div v-if="newRequest.leaveTypeCode === 'AC'" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <Label class="flex items-center gap-1.5 px-0.5 text-[10px] font-semibold tracking-normal text-tertiary-text">
                  Giờ vào thực tế
                </Label>
                <Input
                  v-model="newRequest.correctedCheckIn"
                  type="time"
                  class="h-10 rounded-lg border-border-subtle bg-surface font-bold text-primary-text shadow-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div class="space-y-1.5">
                <Label class="flex items-center gap-1.5 px-0.5 text-[10px] font-semibold tracking-normal text-tertiary-text">
                  Giờ ra thực tế
                </Label>
                <Input
                  v-model="newRequest.correctedCheckOut"
                  type="time"
                  class="h-10 rounded-lg border-border-subtle bg-surface font-bold text-primary-text shadow-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="space-y-1.5">
              <Label class="flex items-center gap-1.5 px-0.5 text-[10px] font-semibold tracking-normal text-tertiary-text">
                <Calendar class="h-3 w-3 text-tertiary-text" />
                Ngày tăng ca
              </Label>
              <Input
                v-model="newRequest.overtimeDate"
                type="date"
                class="h-10 rounded-lg border-border-subtle bg-surface font-bold text-primary-text shadow-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <Label class="flex items-center gap-1.5 px-0.5 text-[10px] font-semibold tracking-normal text-tertiary-text">
                  Bắt đầu
                </Label>
                <Input
                  v-model="newRequest.overtimeStartTime"
                  type="time"
                  class="h-10 rounded-lg border-border-subtle bg-surface font-bold text-primary-text shadow-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div class="space-y-1.5">
                <Label class="flex items-center gap-1.5 px-0.5 text-[10px] font-semibold tracking-normal text-tertiary-text">
                  Kết thúc
                </Label>
                <Input
                  v-model="newRequest.overtimeEndTime"
                  type="time"
                  class="h-10 rounded-lg border-border-subtle bg-surface font-bold text-primary-text shadow-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div class="space-y-1.5">
            <Label class="flex items-center gap-1.5 px-0.5 text-[10px] font-semibold tracking-normal text-tertiary-text">
              <FileText class="h-3 w-3 text-tertiary-text" />
              Lý do chi tiết
            </Label>
            <Textarea
              v-model="newRequest.reason"
              data-testid="my-requests-reason"
              placeholder="Nhập lý do cụ thể..."
              class="min-h-20 resize-none rounded-lg border-border-subtle bg-surface font-medium text-primary-text shadow-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <DialogFooter class="flex flex-col gap-3 border-t border-border-subtle bg-card p-5 sm:flex-row">
          <Button
            variant="ghost"
            class="h-11 flex-1 rounded-lg font-semibold tracking-normal text-tertiary-text hover:bg-surface"
            @click="isCreateModalOpen = false"
          >
            Hủy bỏ
          </Button>
          <Button
            data-testid="my-requests-submit"
            :disabled="isSubmitting"
            class="h-11 flex-1 rounded-lg bg-primary font-semibold tracking-normal text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
            @click="handleSubmit"
          >
            <span v-if="isSubmitting">Đang gửi...</span>
            <span v-else>Gửi ngay</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
