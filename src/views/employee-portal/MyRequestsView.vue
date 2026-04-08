<script setup lang="ts">
import { ref } from 'vue'
import { Plus, FileText, Plane, Stethoscope, Briefcase, ChevronRight, Calendar, Info } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  <div class="p-2 sm:p-6 space-y-3">
    <!-- Header - Slim -->
    <div class="flex items-center justify-between px-1">
      <div>
        <h1 class="text-lg sm:text-2xl font-black text-slate-900 leading-none italic uppercase tracking-tight">Đơn từ</h1>
      </div>
      <Button 
        @click="handleCreateRequest"
        class="bg-indigo-600 hover:bg-indigo-700 h-8 px-3 text-[10px] font-bold uppercase tracking-widest gap-2 rounded shadow-none"
      >
        <Plus class="h-3.5 w-3.5" />
        Tạo đơn
      </Button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
      <Card v-for="request in mockRequests" :key="request.id" 
        class="shadow-none border-border rounded overflow-hidden transition-all hover:bg-indigo-50/30 bg-card border-l-2 border-l-transparent hover:border-l-indigo-500">
        <CardContent class="p-2 sm:p-3">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 min-w-0">
              <div class="h-8 w-8 shrink-0 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50">
                <component :is="getCategoryIcon(request.type)" class="h-4 w-4" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <h3 class="text-[11px] sm:text-sm font-black text-indigo-950 truncate uppercase leading-none">{{ request.type }}</h3>
                  <Badge variant="outline" class="text-[7px] sm:text-[8px] font-bold uppercase px-1 h-3.5 border-indigo-100 text-indigo-600 bg-indigo-50/50 shrink-0">
                    {{ getStatusLabel(request.status) }}
                  </Badge>
                </div>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="text-[8px] sm:text-[9px] text-indigo-400 font-bold uppercase tracking-tight">{{ request.dateRange }}</span>
                  <span class="text-[8px] text-indigo-200">•</span>
                  <span class="text-[8px] sm:text-[9px] text-indigo-300 font-bold uppercase shrink-0">{{ request.submittedAt }}</span>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="icon" @click.stop="handleViewDetail(request.id)" class="h-7 w-7 text-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
               <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
          <div class="mt-1 pl-10">
            <p class="text-[9px] sm:text-[10px] text-indigo-900/40 line-clamp-1 italic font-medium tracking-tight">"{{ request.reason }}"</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <Dialog :open="isCreateModalOpen" @update:open="isCreateModalOpen = $event">
      <DialogContent class="max-w-[calc(100vw-32px)] sm:max-w-[450px] rounded-xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader class="p-4 sm:p-6 bg-white border-b">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <Plus class="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <DialogTitle class="text-lg font-black uppercase tracking-tight text-indigo-600">Tạo đơn mới</DialogTitle>
              <DialogDescription class="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Vui lòng điền đầy đủ thông tin</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div class="p-4 sm:p-6 space-y-4 bg-white">
          <div class="space-y-1.5">
            <Label class="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 px-0.5">
              <Info class="h-3 w-3" />
              Loại đơn từ
            </Label>
            <Select v-model="newRequest.type">
              <SelectTrigger class="h-10 rounded-lg border-indigo-100 bg-indigo-50/30 shadow-none focus:ring-1 focus:ring-indigo-500 text-indigo-950 font-bold">
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
            <Label class="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 px-0.5">
              <Calendar class="h-3 w-3" />
              Khoảng thời gian
            </Label>
            <Input v-model="newRequest.dateRange" placeholder="10/04 - 11/04" class="h-10 rounded-lg border-indigo-100 bg-indigo-50/30 shadow-none focus:ring-1 focus:ring-indigo-500 text-indigo-950 font-bold" />
          </div>

          <div class="space-y-1.5">
            <Label class="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 px-0.5">
              <FileText class="h-3 w-3" />
              Lý do chi tiết
            </Label>
            <Textarea v-model="newRequest.reason" placeholder="Nhập lý do cụ thể..." class="min-h-[100px] rounded-lg border-indigo-100 bg-indigo-50/30 shadow-none resize-none focus:ring-1 focus:ring-indigo-500 text-indigo-950 font-medium" />
          </div>
        </div>

        <DialogFooter class="p-4 sm:p-6 bg-indigo-50/40 border-t border-indigo-100 flex flex-col sm:flex-row gap-2">
          <Button variant="ghost" @click="isCreateModalOpen = false" class="flex-1 h-11 rounded-lg font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-100 hover:text-indigo-600">Hủy</Button>
          <Button @click="handleSubmit" :disabled="isSubmitting" class="flex-1 h-11 rounded-lg bg-indigo-600 font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700">
            <span v-if="isSubmitting">Đang gửi...</span>
            <span v-else>Gửi ngay</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
