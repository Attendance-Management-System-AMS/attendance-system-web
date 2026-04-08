<script setup lang="ts">
import { ref } from 'vue'
import { Plus, FileText, Plane, Stethoscope, Briefcase, ChevronRight, Calendar, Info } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/ui/PageHeader.vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'

const isCreateModalOpen = ref(false)
const isSubmitting = ref(false)

const newRequest = ref({
  type: 'Nghỉ phép năm',
  dateRange: '',
  reason: ''
})

const mockRequests = ref([
  { id: 1, type: 'Nghỉ phép năm', status: 'pending', reason: 'Giải quyết việc gia đình riêng', dateRange: '10/04 — 11/04', submittedAt: '08/04 09:30' },
  { id: 2, type: 'Nghỉ ốm', status: 'approved', reason: 'Sốt cao, cần nghỉ ngơi', dateRange: '05/04 — 06/04', submittedAt: '05/04 07:15' },
  { id: 3, type: 'Công tác', status: 'rejected', reason: 'Triển khai tại chi nhánh HN', dateRange: '01/04', submittedAt: '28/03 14:00' },
])

const handleCreateRequest = () => {
  isCreateModalOpen.value = true
}

const handleSubmit = () => {
  if (!newRequest.value.dateRange || !newRequest.value.reason) {
    toast.error('Vui lòng điền đầy đủ thông tin')
    return
  }

  isSubmitting.value = true

  // Giả lập gửi lên server
  setTimeout(() => {
    mockRequests.value.unshift({
      id: Date.now(),
      type: newRequest.value.type,
      status: 'pending',
      reason: newRequest.value.reason,
      dateRange: newRequest.value.dateRange,
      submittedAt: 'Vừa xong'
    })

    isSubmitting.value = false
    isCreateModalOpen.value = false
    toast.success('Gửi đơn thành công! Đang chờ duyệt.')

    // Reset form
    newRequest.value = { type: 'Nghỉ phép năm', dateRange: '', reason: '' }
  }, 1000)
}

const handleViewDetail = (id: number) => {
  toast.info(`Chi tiết đơn #${id} đang được tải...`)
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'approved': return 'Đã duyệt'
    case 'rejected': return 'Từ chối'
    case 'pending': return 'Chờ duyệt'
    default: return 'Không xác định'
  }
}

const getCategoryIcon = (type: string) => {
  if (type.includes('phép')) return Plane
  if (type.includes('ốm')) return Stethoscope
  if (type.includes('tác')) return Briefcase
  return FileText
}
</script>

<template>
  <div class="space-y-3">
    <PageHeader
      title="Đơn từ"
      description="Danh sách yêu cầu hỗ trợ và nghỉ phép"
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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
      <Card v-for="request in mockRequests" :key="request.id"
        class="shadow-none border-border rounded overflow-hidden transition-all hover:bg-primary/5 bg-card border-l-2 border-l-transparent hover:border-l-primary/40">
        <CardContent class="p-2 sm:p-3">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 min-w-0">
              <div class="h-8 w-8 shrink-0 rounded bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <component :is="getCategoryIcon(request.type)" class="h-4 w-4" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <h3 class="text-[11px] sm:text-sm font-black text-slate-900 truncate uppercase leading-none">{{ request.type }}</h3>
                  <Badge variant="outline" class="text-[7px] sm:text-[8px] font-bold uppercase px-1 h-3.5 border-primary/10 text-primary bg-primary/5 shrink-0">
                    {{ getStatusLabel(request.status) }}
                  </Badge>
                </div>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-tight">{{ request.dateRange }}</span>
                  <span class="text-[8px] text-slate-200">•</span>
                  <span class="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase shrink-0">{{ request.submittedAt }}</span>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="icon" @click.stop="handleViewDetail(request.id)" class="h-7 w-7 text-slate-300 hover:text-primary hover:bg-primary/5 transition-colors">
               <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
          <div class="mt-1 pl-10">
            <p class="text-[9px] sm:text-[10px] text-slate-500 line-clamp-1 font-medium tracking-tight">"{{ request.reason }}"</p>
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
            <Select v-model="newRequest.type">
              <SelectTrigger class="h-10 rounded-lg border-primary/10 bg-primary/5 shadow-none focus:ring-1 focus:ring-primary text-slate-900 font-bold">
                <SelectValue placeholder="Chọn loại đơn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nghỉ phép năm">Nghỉ phép năm</SelectItem>
                <SelectItem value="Nghỉ ốm">Nghỉ ốm (Có bảo hiểm)</SelectItem>
                <SelectItem value="Đi công tác">Đi công tác / Ra ngoài</SelectItem>
                <SelectItem value="Làm việc từ xa">Làm việc từ xa (WFH)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-1.5">
            <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-0.5">
              <Calendar class="h-3 w-3 text-slate-400" />
              Khoảng thời gian
            </Label>
            <Input v-model="newRequest.dateRange" placeholder="Ví dụ: 10/04 - 11/04" class="h-10 rounded-xl border-slate-100 bg-slate-50 shadow-none focus:ring-1 focus:ring-primary text-slate-800 font-bold" />
          </div>

          <div class="space-y-1.5">
            <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-0.5">
              <FileText class="h-3 w-3 text-slate-400" />
              Lý do chi tiết
            </Label>
            <Textarea v-model="newRequest.reason" placeholder="Nhập lý do cụ thể..." class="min-h-[100px] rounded-xl border-slate-100 bg-slate-50 shadow-none resize-none focus:ring-1 focus:ring-primary text-slate-800 font-medium" />
          </div>
        </div>

        <DialogFooter class="p-5 bg-white border-t border-slate-50 flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" @click="isCreateModalOpen = false" class="flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50">Hủy bỏ</Button>
          <Button @click="handleSubmit" :disabled="isSubmitting" class="flex-1 h-11 rounded-xl bg-primary font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">
            <span v-if="isSubmitting">Đang gửi...</span>
            <span v-else>Gửi ngay</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
