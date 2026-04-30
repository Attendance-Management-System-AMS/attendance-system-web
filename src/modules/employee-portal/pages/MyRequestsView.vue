<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, FileText, Plane, Stethoscope, Briefcase, ChevronRight, Calendar, Info, Clock } from 'lucide-vue-next'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import PageHeader from '@/shared/ui/PageHeader.vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Label } from '@/shared/ui/label'
import { toast } from 'vue-sonner'
import { useMyLeaves } from '@/modules/leaves/composables/useMyLeaves'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'

const { leavesQuery, createMe, leaveTypesQuery } = useMyLeaves()

const route = useRoute()
const router = useRouter()

const isCreateModalOpen = ref(false)

type MyRequestForm = {
  leaveTypeCode: string
  fromDate: string
  toDate: string
  reason: string
  correctedCheckIn: string
  correctedCheckOut: string
}

const createEmptyRequest = (): MyRequestForm => ({
  leaveTypeCode: '',
  fromDate: '',
  toDate: '',
  reason: '',
  correctedCheckIn: '',
  correctedCheckOut: '',
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

watch(() => newRequest.value.leaveTypeCode, (newVal) => {
  if (newVal === 'AC' && newRequest.value.fromDate) {
    newRequest.value.toDate = newRequest.value.fromDate
  }
})

const leaves = computed(() => leavesQuery.data.value?.content || [])

const handleCreateRequest = () => {
  resetForm()
  isCreateModalOpen.value = true
}

const handleSubmit = async () => {
  if (!newRequest.value.leaveTypeCode || !newRequest.value.fromDate || !newRequest.value.reason) {
    toast.error('Vui lòng điền đầy đủ thông tin')
    return
  }

  if (newRequest.value.leaveTypeCode === 'AC') {
    newRequest.value.toDate = newRequest.value.fromDate; // Force toDate = fromDate
    if (!newRequest.value.correctedCheckIn && !newRequest.value.correctedCheckOut) {
      toast.error('Vui lòng điền ít nhất giờ vào hoặc giờ ra bổ sung')
      return
    }
  } else if (!newRequest.value.toDate) {
    toast.error('Vui lòng điền ngày kết thúc')
    return
  }

  try {
    await createMe.mutateAsync({
      leaveTypeCode: newRequest.value.leaveTypeCode,
      fromDate: newRequest.value.fromDate,
      toDate: newRequest.value.toDate,
      reason: newRequest.value.reason,
      correctedCheckIn: newRequest.value.correctedCheckIn || null,
      correctedCheckOut: newRequest.value.correctedCheckOut || null,
    })
    isCreateModalOpen.value = false
    toast.success('Gửi đơn thành công! Đang chờ duyệt.')
    resetForm()
  } catch (err) {
    toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra khi gửi đơn'))
  }
}

const getStatusLabel = (status: string) => {
  switch (String(status || '').toLowerCase()) {
    case 'approved': return 'Đã duyệt'
    case 'rejected': return 'Từ chối'
    case 'pending': return 'Chờ duyệt'
    default: return status
  }
}

const getCategoryIcon = (type: string) => {
  const t = String(type).toLowerCase()
  if (t.includes('giải trình') || t.includes('attendance correction') || t === 'ac') return Clock
  if (t.includes('phép')) return Plane
  if (t.includes('ốm')) return Stethoscope
  if (t.includes('tác')) return Briefcase
  return FileText
}

const formatDateRange = (from?: string, to?: string) => {
  if (!from) return '-'
  const fmt = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' })
  const f = fmt.format(new Date(from))
  const t = to ? fmt.format(new Date(to)) : ''
  return t && t !== f ? `${f} — ${t}` : f
}
</script>

<template>
  <div class="space-y-5">
    <PageHeader
      title="Đơn từ"
      description="Theo dõi yêu cầu nghỉ phép và giải trình công của bạn"
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

    <div v-if="leavesQuery.isLoading.value" class="flex h-64 items-center justify-center">
       <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="leaves.length === 0" class="rounded-xl border-2 border-dashed border-border-subtle bg-surface/50 py-20 text-center">
       <FileText class="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
       <p class="text-sm font-semibold text-tertiary-text">Bạn chưa có đơn từ nào</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <Card v-for="request in leaves" :key="request.id"
        class="overflow-hidden rounded-xl border-border-standard bg-card shadow-none transition-all hover:border-primary/30 hover:bg-primary/5">
        <CardContent class="p-4">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 min-w-0">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <component :is="getCategoryIcon(getLeaveTypeLabel(request))" class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="truncate text-sm font-semibold leading-none text-primary-text">
                    {{ getLeaveTypeLabel(request) }}
                  </h3>
                  <Badge variant="outline" 
                    :class="[
                       'h-5 shrink-0 rounded-md border-none px-2 text-[10px] font-semibold',
                       String(request.status).toLowerCase() === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                       String(request.status).toLowerCase() === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    ]"
                  >
                    {{ getStatusLabel(request.status) }}
                  </Badge>
                </div>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="text-xs font-medium text-tertiary-text">
                    {{ formatDateRange(request.fromDate || request.startDate, request.toDate || request.endDate) }}
                  </span>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground/40">
               <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
          <div class="mt-3 pl-12">
            <p class="line-clamp-1 text-xs font-medium italic text-secondary-text">"{{ request.reason }}"</p>
            <p
              v-if="request.leaveTypeCode === 'AC' && (request.correctedCheckIn || request.correctedCheckOut)"
              class="mt-2 text-[11px] font-medium text-tertiary-text"
            >
              Bổ sung công:
              {{ request.correctedCheckIn || '--:--' }}
              -
              {{ request.correctedCheckOut || '--:--' }}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Create Request Dialog -->
    <Dialog
      :open="isCreateModalOpen"
      @update:open="
        (open) => {
          isCreateModalOpen = open
          if (!open) resetForm()
        }
      "
    >
      <DialogContent class="max-w-[calc(100vw-32px)] sm:max-w-112.5 rounded-lg p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader class="p-4 sm:p-6 bg-card border-b border-primary/10">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Plus class="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle class="text-lg font-semibold text-primary-text">Tạo đơn mới</DialogTitle>
              <DialogDescription class="mt-0.5 text-xs font-medium text-tertiary-text">Vui lòng điền đầy đủ thông tin</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div class="p-4 sm:p-6 space-y-4 bg-card">
          <div class="space-y-1.5">
            <Label class="text-[10px] font-semibold  tracking-normal text-tertiary-text flex items-center gap-1.5 px-0.5">
              <Info class="h-3 w-3 text-primary/50" />
              Loại đơn từ
            </Label>
            <Select v-model="newRequest.leaveTypeCode">
              <SelectTrigger
                data-testid="my-requests-leave-type"
                class="h-10 rounded-lg border-primary/10 bg-primary/5 shadow-none focus:ring-1 focus:ring-primary text-primary-text font-bold"
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
              <Label class="text-[10px] font-semibold  tracking-normal text-tertiary-text flex items-center gap-1.5 px-0.5">
                <Calendar class="h-3 w-3 text-tertiary-text" />
                <span v-if="newRequest.leaveTypeCode === 'AC'">Ngày giải trình</span>
                <span v-else>Từ ngày</span>
              </Label>
              <Input
                v-model="newRequest.fromDate"
                @change="() => { if (newRequest.leaveTypeCode === 'AC') newRequest.toDate = newRequest.fromDate }"
                data-testid="my-requests-from-date"
                type="date"
                class="h-10 rounded-lg border-border-subtle bg-surface shadow-none focus:ring-1 focus:ring-primary text-primary-text font-bold"
              />
            </div>
            <div class="space-y-1.5" v-if="newRequest.leaveTypeCode !== 'AC'">
              <Label class="text-[10px] font-semibold  tracking-normal text-tertiary-text flex items-center gap-1.5 px-0.5">
                <Calendar class="h-3 w-3 text-tertiary-text" />
                Đến ngày
              </Label>
              <Input
                v-model="newRequest.toDate"
                data-testid="my-requests-to-date"
                type="date"
                class="h-10 rounded-lg border-border-subtle bg-surface shadow-none focus:ring-1 focus:ring-primary text-primary-text font-bold"
              />
            </div>
          </div>

          <div v-if="newRequest.leaveTypeCode === 'AC'" class="grid grid-cols-2 gap-4">
             <div class="space-y-1.5">
              <Label class="text-[10px] font-semibold tracking-normal text-tertiary-text flex items-center gap-1.5 px-0.5">
                Giờ vào thực tế
              </Label>
              <Input
                v-model="newRequest.correctedCheckIn"
                type="time"
                class="h-10 rounded-lg border-border-subtle bg-surface shadow-none focus:ring-1 focus:ring-primary text-primary-text font-bold"
              />
            </div>
             <div class="space-y-1.5">
              <Label class="text-[10px] font-semibold tracking-normal text-tertiary-text flex items-center gap-1.5 px-0.5">
                Giờ ra thực tế
              </Label>
              <Input
                v-model="newRequest.correctedCheckOut"
                type="time"
                class="h-10 rounded-lg border-border-subtle bg-surface shadow-none focus:ring-1 focus:ring-primary text-primary-text font-bold"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <Label class="text-[10px] font-semibold  tracking-normal text-tertiary-text flex items-center gap-1.5 px-0.5">
              <FileText class="h-3 w-3 text-tertiary-text" />
              Lý do chi tiết
            </Label>
            <Textarea
              v-model="newRequest.reason"
              data-testid="my-requests-reason"
              placeholder="Nhập lý do cụ thể..."
              class="min-h-20 rounded-lg border-border-subtle bg-surface shadow-none resize-none focus:ring-1 focus:ring-primary text-primary-text font-medium"
            />
          </div>
        </div>

        <DialogFooter class="p-5 bg-card border-t border-border-subtle flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" @click="isCreateModalOpen = false" class="flex-1 h-11 rounded-lg font-semibold  tracking-normal text-tertiary-text hover:bg-surface">Hủy bỏ</Button>
          <Button
            @click="handleSubmit"
            data-testid="my-requests-submit"
            :disabled="createMe.isPending.value"
            class="flex-1 h-11 rounded-lg bg-primary font-semibold  tracking-normal text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
          >
            <span v-if="createMe.isPending.value">Đang gửi...</span>
            <span v-else>Gửi ngay</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
