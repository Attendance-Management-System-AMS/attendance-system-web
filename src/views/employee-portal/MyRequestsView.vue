<script setup lang="ts">
import {
  Plus,
  FileText,
  Plane,
  Stethoscope,
  Briefcase,
  ChevronRight,
} from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const mockRequests = [
  { id: 1, type: 'Nghỉ phép năm', status: 'pending', reason: 'Giải quyết việc gia đình riêng', dateRange: '10/04 — 11/04', submittedAt: '08/04 09:30' },
  { id: 2, type: 'Nghỉ ốm', status: 'approved', reason: 'Sốt cao, cần nghỉ ngơi theo chỉ định', dateRange: '05/04 — 06/04', submittedAt: '05/04 07:15' },
  { id: 3, type: 'Công tác', status: 'rejected', reason: 'Hỗ trợ triển khai tại chi nhánh HN', dateRange: '01/04', submittedAt: '28/03 14:00' },
]

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'approved': return { bg: 'bg-emerald-50 text-emerald-600', icon: 'text-emerald-600', text: 'text-emerald-700' }
    case 'rejected': return { bg: 'bg-rose-50 text-rose-600', icon: 'text-rose-600', text: 'text-rose-700' }
    case 'pending': return { bg: 'bg-amber-50 text-amber-600', icon: 'text-amber-600', text: 'text-amber-700' }
    default: return { bg: 'bg-slate-50 text-slate-600', icon: 'text-slate-600', text: 'text-slate-700' }
  }
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
  <div class="space-y-4">
    <!-- Header - Compact -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Đơn từ</h1>
        <p class="text-[9px] uppercase font-bold tracking-widest text-slate-400 mt-1">Danh sách yêu cầu</p>
      </div>
      <Button class="bg-indigo-600 hover:bg-indigo-700 h-8 px-3 text-[10px] font-bold uppercase tracking-widest gap-2 rounded-md shadow-sm shadow-indigo-100 dark:shadow-none">
        <Plus class="h-3.5 w-3.5" />
        Tạo đơn
      </Button>
    </div>

    <!-- Requests List - Responsive Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
      <Card v-for="request in mockRequests" :key="request.id" class="shadow-none border-border rounded-md sm:rounded-xl overflow-hidden transition-all hover:border-indigo-100 dark:hover:border-indigo-900 border-2 border-transparent lg:border-border">
        <CardContent class="p-3 sm:p-6 lg:p-7">
          <div class="flex items-start justify-between gap-3 mb-2 sm:mb-6">
            <div class="flex items-center gap-2 sm:gap-4 min-w-0">
              <div :class="['h-8 w-8 sm:h-12 sm:w-12 shrink-0 rounded sm:rounded-xl flex items-center justify-center', getStatusStyle(request.status).bg]">
                <component :is="getCategoryIcon(request.type)" :class="['h-4 w-4 sm:h-6 sm:w-6', getStatusStyle(request.status).icon]" />
              </div>
              <div class="min-w-0">
                <h3 class="text-[11px] sm:text-base font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{{ request.type }}</h3>
                <p class="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{{ request.dateRange }}</p>
              </div>
            </div>
            <Badge :class="['text-[8px] sm:text-[10px] font-bold uppercase px-1.5 sm:px-3 h-4 sm:h-6 border-none shadow-none shrink-0', getStatusStyle(request.status).bg, getStatusStyle(request.status).text]">
              {{ getStatusLabel(request.status) }}
            </Badge>
          </div>

          <p class="text-[10px] sm:text-sm text-slate-500 line-clamp-2 italic mb-3 sm:mb-6 px-1">"{{ request.reason }}"</p>

          <div class="flex items-center justify-between pt-2 sm:pt-4 border-t border-slate-50 dark:border-slate-800">
            <div class="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
              <span class="text-[8px] sm:text-[10px] font-bold text-slate-300 uppercase shrink-0">Gửi lúc:</span>
              <span class="text-[9px] sm:text-xs font-bold text-slate-500">{{ request.submittedAt }}</span>
            </div>
            <Button variant="ghost" size="sm" class="h-6 sm:h-9 px-1.5 sm:px-4 text-slate-400 hover:text-indigo-600 group">
               <span class="text-[9px] sm:text-xs font-black uppercase">Chi tiết</span>
               <ChevronRight class="h-3 w-3 ml-1 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
