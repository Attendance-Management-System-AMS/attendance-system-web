<script setup lang="ts">
import { ref } from 'vue'
import { Clock, Plus, Pencil, Trash2 } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'

interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
  gracePeriod: number
  employeeCount: number
  status: 'active' | 'inactive'
  color: string
}

const deleteDialog = ref(false)
const deleteTarget = ref<Shift | null>(null)

const shifts: Shift[] = [
  { id: 'shift-001', name: 'Ca Sáng', startTime: '08:00', endTime: '17:30', gracePeriod: 15, employeeCount: 85, status: 'active', color: 'indigo' },
  { id: 'shift-002', name: 'Ca Chiều', startTime: '13:00', endTime: '22:00', gracePeriod: 15, employeeCount: 28, status: 'active', color: 'amber' },
  { id: 'shift-003', name: 'Ca Đêm', startTime: '22:00', endTime: '06:00', gracePeriod: 15, employeeCount: 15, status: 'active', color: 'rose' },
  { id: 'shift-004', name: 'Ca Hành Chính', startTime: '08:00', endTime: '12:00', gracePeriod: 10, employeeCount: 20, status: 'active', color: 'emerald' },
  { id: 'shift-005', name: 'Ca Tối', startTime: '18:00', endTime: '22:00', gracePeriod: 10, employeeCount: 8, status: 'inactive', color: 'slate' },
  { id: 'shift-006', name: 'Ca Linh Hoạt', startTime: '09:00', endTime: '18:00', gracePeriod: 30, employeeCount: 12, status: 'active', color: 'indigo' },
]

const colorConfig: Record<string, { bg: string; icon: string; badge: string }> = {
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/50', icon: 'text-indigo-600', badge: 'bg-indigo-600' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/50', icon: 'text-amber-600', badge: 'bg-amber-500' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-950/50', icon: 'text-rose-600', badge: 'bg-rose-600' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', icon: 'text-emerald-600', badge: 'bg-emerald-600' },
  slate: { bg: 'bg-slate-50 dark:bg-slate-800', icon: 'text-slate-500', badge: 'bg-slate-400' },
}

const handleDelete = (shift: Shift) => {
  deleteTarget.value = shift
  deleteDialog.value = true
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Ca làm việc" description="Quản lý các ca làm việc và lịch phân công">
      <template #actions>
        <button
          class="flex items-center gap-2 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors dark:shadow-none"
        >
          <Plus class="h-4 w-4" />
          Thêm ca làm
        </button>
      </template>
    </PageHeader>

    <!-- Card grid -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="shift in shifts"
        :key="shift.id"
        class="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 dark:border-slate-800 dark:bg-slate-900"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'flex h-11 w-11 items-center justify-center rounded-xl',
                colorConfig[shift.color].bg,
              ]"
            >
              <Clock :class="['h-5 w-5', colorConfig[shift.color].icon]" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ shift.name }}</h3>
              <span
                :class="[
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold',
                  shift.status === 'active'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-100 text-slate-500',
                ]"
              >
                {{ shift.status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng' }}
              </span>
            </div>
          </div>

          <!-- Action menu -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <Pencil class="h-3.5 w-3.5" />
            </button>
            <button
              @click="handleDelete(shift)"
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <!-- Time range -->
        <div class="mb-4 rounded-xl bg-slate-50 dark:bg-slate-800 px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="text-center">
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bắt đầu</p>
              <p class="mt-0.5 font-mono text-lg font-black text-slate-900 dark:text-white">{{ shift.startTime }}</p>
            </div>
            <div class="flex-1 mx-3 h-px bg-slate-200 dark:bg-slate-700 relative">
              <div :class="['absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full', colorConfig[shift.color].badge]"></div>
            </div>
            <div class="text-center">
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kết thúc</p>
              <p class="mt-0.5 font-mono text-lg font-black text-slate-900 dark:text-white">{{ shift.endTime }}</p>
            </div>
          </div>
        </div>

        <!-- Stats row -->
        <div class="flex items-center justify-between text-xs">
          <div>
            <span class="text-slate-400">Cho phép trễ </span>
            <span class="font-bold text-slate-700 dark:text-slate-300">{{ shift.gracePeriod }} phút</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
            <span class="font-bold text-slate-700 dark:text-slate-300">{{ shift.employeeCount }}</span>
            <span class="text-slate-400">nhân viên</span>
          </div>
        </div>
      </div>
    </div>

    <DeleteConfirmDialog
      :open="deleteDialog"
      title="Xóa ca làm việc"
      description="Bạn có chắc chắn muốn xóa ca làm việc này?"
      :item-name="deleteTarget?.name"
      @confirm="deleteDialog = false"
      @cancel="deleteDialog = false"
    />
  </div>
</template>
