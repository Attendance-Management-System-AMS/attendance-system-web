<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, FileText, Plane, Stethoscope, Briefcase, ChevronRight, Calendar, Info } from 'lucide-vue-next'
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

const { leavesQuery, createMe, leaveTypesQuery } = useMyLeaves()

const isCreateModalOpen = ref(false)

const newRequest = ref({
  leaveTypeCode: '',
  fromDate: '',
  toDate: '',
  reason: ''
})

const leaves = computed(() => leavesQuery.data.value?.content || [])

const handleCreateRequest = () => {
  isCreateModalOpen.value = true
}

const handleSubmit = async () => {
  if (!newRequest.value.leaveTypeCode || !newRequest.value.fromDate || !newRequest.value.toDate || !newRequest.value.reason) {
    toast.error('Vui lòng điền đầy đủ thông tin')
    return
  }

  try {
    await createMe.mutateAsync(newRequest.value)
    isCreateModalOpen.value = false
    toast.success('Gửi đơn thành công! Đang chờ duyệt.')
    newRequest.value = { leaveTypeCode: '', fromDate: '', toDate: '', reason: '' }
  } catch {
    toast.error('Có lỗi xảy ra khi gửi đơn')
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
  <div class="space-y-3">
    <PageHeader
      title="Đơn từ"
      description="Danh sách yêu cầu nghỉ phép của bạn"
    >
      <template #actions>
        <Button
          @click="handleCreateRequest"
          class="bg-primary hover:bg-primary/90 h-8 px-3 text-[10px] font-bold uppercase tracking-widest gap-2 rounded shadow-none"
        >
          <Plus class="h-3.5 w-3.5" />
          Tạo đơn
        </Button>
      </template>
    </PageHeader>

    <div v-if="leavesQuery.isLoading.value" class="flex h-64 items-center justify-center">
       <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="leaves.length === 0" class="text-center py-20 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-100">
       <FileText class="h-10 w-10 text-slate-200 mx-auto mb-3" />
       <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Bạn chưa có đơn từ nào</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
      <Card v-for="request in leaves" :key="request.id"
        class="shadow-none border-border rounded overflow-hidden transition-all hover:bg-primary/5 bg-card border-l-2 border-l-transparent hover:border-l-primary/40">
        <CardContent class="p-2 sm:p-3">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 min-w-0">
              <div class="h-8 w-8 shrink-0 rounded bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <component :is="getCategoryIcon(String(request.leaveType))" class="h-4 w-4" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <h3 class="text-[11px] sm:text-sm font-black text-slate-900 truncate uppercase leading-none">
                    {{ typeof request.leaveType === 'string' ? request.leaveType : request.leaveType?.name || 'Đơn nghỉ' }}
                  </h3>
                  <Badge variant="outline" 
                    :class="[
                       'text-[7px] sm:text-[8px] font-bold uppercase px-1 h-3.5 border-none shrink-0',
                       String(request.status).toLowerCase() === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                       String(request.status).toLowerCase() === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    ]"
                  >
                    {{ getStatusLabel(request.status) }}
                  </Badge>
                </div>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                    {{ formatDateRange(request.fromDate || request.startDate, request.toDate || request.endDate) }}
                  </span>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="icon" class="h-7 w-7 text-slate-200">
               <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
          <div class="mt-1 pl-10">
            <p class="text-[9px] sm:text-[10px] text-slate-500 line-clamp-1 font-medium tracking-tight italic">"{{ request.reason }}"</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Create Request Dialog -->
    <Dialog :open="isCreateModalOpen" @update:open="isCreateModalOpen = $event">
      <DialogContent class="max-w-[calc(100vw-32px)] sm:max-w-[450px] rounded-xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader class="p-4 sm:p-6 bg-white border-b border-primary/10">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Plus class="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle class="text-lg font-black uppercase tracking-tight text-slate-900">Tạo đơn mới</DialogTitle>
              <DialogDescription class="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Vui lòng điền đầy đủ thông tin</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div class="p-4 sm:p-6 space-y-4 bg-white">
          <div class="space-y-1.5">
            <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-0.5">
              <Info class="h-3 w-3 text-primary/50" />
              Loại đơn từ
            </Label>
            <Select v-model="newRequest.leaveTypeCode">
              <SelectTrigger class="h-10 rounded-lg border-primary/10 bg-primary/5 shadow-none focus:ring-1 focus:ring-primary text-slate-900 font-bold">
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
            <div class="space-y-1.5">
              <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-0.5">
                <Calendar class="h-3 w-3 text-slate-400" />
                Từ ngày
              </Label>
              <Input type="date" v-model="newRequest.fromDate" class="h-10 rounded-xl border-slate-100 bg-slate-50 shadow-none focus:ring-1 focus:ring-primary text-slate-800 font-bold" />
            </div>
            <div class="space-y-1.5">
              <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-0.5">
                <Calendar class="h-3 w-3 text-slate-400" />
                Đến ngày
              </Label>
              <Input type="date" v-model="newRequest.toDate" class="h-10 rounded-xl border-slate-100 bg-slate-50 shadow-none focus:ring-1 focus:ring-primary text-slate-800 font-bold" />
            </div>
          </div>

          <div class="space-y-1.5">
            <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-0.5">
              <FileText class="h-3 w-3 text-slate-400" />
              Lý do chi tiết
            </Label>
            <Textarea v-model="newRequest.reason" placeholder="Nhập lý do cụ thể..." class="min-h-[80px] rounded-xl border-slate-100 bg-slate-50 shadow-none resize-none focus:ring-1 focus:ring-primary text-slate-800 font-medium" />
          </div>
        </div>

        <DialogFooter class="p-5 bg-white border-t border-slate-50 flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" @click="isCreateModalOpen = false" class="flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50">Hủy bỏ</Button>
          <Button @click="handleSubmit" :disabled="createMe.isPending.value" class="flex-1 h-11 rounded-xl bg-primary font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">
            <span v-if="createMe.isPending.value">Đang gửi...</span>
            <span v-else>Gửi ngay</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
