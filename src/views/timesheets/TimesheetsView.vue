<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, X, Plus } from 'lucide-vue-next'
import { useLeaves } from '@/composables/useLeaves'
import type { CreateLeaveRequest, LeaveRequest } from '@/types/leave'
import { isPendingLeave, normalizeLeaveStatus } from '@/lib/leaveStatus'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import SearchToolbar from '@/components/ui/SearchToolbar.vue'
import LeaveCreateModal from '@/components/leaves/LeaveCreateModal.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DataTable from '@/components/ui/DataTable.vue'
import { toast } from 'vue-sonner'

const filterStatus = ref('')
const filterDept = ref('')
const search = ref('')

const { leavesQuery, leaveTypesQuery, approveLeave, rejectLeave, createLeave } = useLeaves()
const { data: leavesRaw, isLoading } = leavesQuery
const leaves = computed<LeaveRequest[]>(() => leavesRaw.value ?? [])
const leaveTypes = computed(() => leaveTypesQuery.data.value ?? [])

const departments = computed(() => {
  const all = leaves.value.map((item) => item.departmentName).filter(Boolean) as string[]
  return [...new Set(all)].map((name) => ({ label: name, value: name }))
})

const statuses = [
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Đã duyệt', value: 'approved' },
  { label: 'Từ chối', value: 'rejected' },
]

const filteredLeaves = computed(() => {
  return leaves.value.filter((item) => {
    const canonical = normalizeLeaveStatus(item.status)
    const okStatus = filterStatus.value ? canonical === filterStatus.value : true
    const okDept = filterDept.value ? item.departmentName === filterDept.value : true
    const okSearch = search.value ? item.employeeName?.toLowerCase().includes(search.value.toLowerCase()) || item.employeeCode?.toLowerCase().includes(search.value.toLowerCase()) : true
    return okStatus && okDept && okSearch
  })
})

const stats = computed(() => [
    { label: 'Chờ duyệt', value: leaves.value.filter(i => isPendingLeave(i.status)).length },
    { label: 'Đã duyệt', value: leaves.value.filter(i => normalizeLeaveStatus(i.status) === 'approved').length },
    { label: 'Từ chối', value: leaves.value.filter(i => normalizeLeaveStatus(i.status) === 'rejected').length },
])

const columns = [
    { key: 'employee', label: 'Nhân viên' },
    { key: 'department', label: 'Phòng ban' },
    { key: 'type', label: 'Loại nghỉ' },
    { key: 'dateRange', label: 'Thời gian' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'actions', label: 'Thao tác', align: 'right' as const },
]

const isCreateModalOpen = ref(false)

const handleApprove = (id: string | number) => {
  approveLeave.mutate(id, {
    onSuccess: () => toast.success('Đã phê duyệt đơn nghỉ phép'),
    onError: () => toast.error('Không thể phê duyệt đơn này')
  })
}

const handleReject = (id: string | number) => {
  rejectLeave.mutate(id, {
    onSuccess: () => toast.success('Đã từ chối đơn nghỉ phép'),
    onError: () => toast.error('Lỗi khi thực hiện thao tác')
  })
}


const handleCreated = async (payload: CreateLeaveRequest) => {
  try {
    await createLeave.mutateAsync(payload)
    toast.success('Gửi đơn nghỉ phép thành công')
    isCreateModalOpen.value = false
  } catch {
    toast.error('Gửi đơn thất bại')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header - Matching Portal Style -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100/50 pb-4">
      <div>
        <h1 class="text-lg sm:text-2xl font-black text-indigo-950 leading-none italic uppercase tracking-tight">Quản lý nghỉ phép</h1>
        <p class="mt-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none">Phê duyệt và theo dõi đơn từ nhân viên</p>
      </div>
      <div class="flex items-center gap-2">
        <Button @click="isCreateModalOpen = true" class="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-indigo-100 rounded">
          <Plus class="h-3.5 w-3.5" /> Tạo đơn mới
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div v-for="s in stats" :key="s.label" class="p-3 sm:p-5 rounded border border-indigo-100 bg-indigo-50/20 transition-all shadow-none">
             <p class="text-[9px] font-black uppercase tracking-widest text-indigo-400 opacity-80">{{ s.label }}</p>
             <p class="text-2xl sm:text-3xl font-black mt-2 tabular-nums text-indigo-900 leading-none">{{ s.value }}</p>
        </div>
    </div>

    <SearchToolbar v-model="search" placeholder="Tìm theo tên hoặc mã nhân viên...">
        <template #filters>
            <FilterSelect v-model="filterStatus" label="Trạng thái" :options="statuses" />
            <FilterSelect v-model="filterDept" label="Phòng ban" :options="departments" />
        </template>
    </SearchToolbar>

    <div class="rounded border border-border bg-card shadow-none overflow-hidden">
      <DataTable :columns="columns" :rows="filteredLeaves" :loading="isLoading" class="text-[11px] sm:text-sm">
        <template #cell-employee="{ row }">
           <div class="py-1">
              <p class="font-black text-indigo-950 leading-tight uppercase">{{ row.employeeName }}</p>
              <p class="text-[9px] font-mono text-indigo-300 font-bold tracking-tight">{{ row.employeeCode || '—' }}</p>
           </div>
        </template>

        <template #cell-type="{ row }">
            <Badge variant="outline" class="bg-indigo-50/50 text-indigo-600 border-indigo-100 font-bold text-[9px] px-1.5 uppercase">
                {{ (row.leaveType && typeof row.leaveType === 'object') ? row.leaveType.name : (row.leaveType || 'Nghỉ phép') }}
            </Badge>
        </template>

        <template #cell-dateRange="{ row }">
            <div class="text-[10px] sm:text-[11px] font-medium text-indigo-900/60 flex flex-col gap-0.5">
                <span>{{ row.fromDate || row.startDate }}</span>
                <span class="text-[8px] font-bold text-indigo-200">đến</span>
                <span>{{ row.toDate || row.endDate }}</span>
            </div>
        </template>

        <template #cell-status="{ value }">
           <Badge variant="outline"
                class="px-2 py-0.5 text-[9px] font-bold border-indigo-100 bg-indigo-50/30 text-indigo-500 uppercase">
                {{ normalizeLeaveStatus(value) === 'approved' ? 'Đã duyệt' : normalizeLeaveStatus(value) === 'rejected' ? 'Từ chối' : 'Chờ duyệt' }}
           </Badge>
        </template>

        <template #cell-actions="{ row }">
            <div v-if="isPendingLeave(row.status)" class="flex justify-end gap-1.5">
                <Button size="icon" variant="outline" class="h-8 w-8 text-indigo-600 border-indigo-100 hover:bg-indigo-50" @click="handleApprove(row.id)">
                    <Check class="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" class="h-8 w-8 text-indigo-400 border-indigo-50 hover:bg-indigo-50" @click="handleReject(row.id)">
                    <X class="h-4 w-4" />
                </Button>
            </div>
            <span v-else class="text-[10px] font-black uppercase tracking-tighter text-indigo-200 mr-2">Hoàn thành</span>
        </template>
      </DataTable>
    </div>

    <LeaveCreateModal
      :open="isCreateModalOpen"
      :is-submitting="createLeave.isPending.value"
      :leave-types="leaveTypes"
      :is-loading-leave-types="leaveTypesQuery.isLoading.value"
      @close="isCreateModalOpen = false"
      @created="handleCreated"
    />
  </div>
</template>
