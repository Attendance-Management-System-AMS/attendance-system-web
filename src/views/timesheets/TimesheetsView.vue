<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
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
    { label: 'Chờ duyệt', value: leaves.value.filter(i => isPendingLeave(i.status)).length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-100 dark:border-amber-900/50' },
    { label: 'Đã duyệt', value: leaves.value.filter(i => normalizeLeaveStatus(i.status) === 'approved').length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-100 dark:border-emerald-900/50' },
    { label: 'Từ chối', value: leaves.value.filter(i => normalizeLeaveStatus(i.status) === 'rejected').length, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-100 dark:border-rose-900/50' },
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
    <PageHeader title="Nghỉ phép" description="Quản lý và xét duyệt các đơn nghỉ phép">
      <template #actions>
        <Button @click="isCreateModalOpen = true" class="gap-2 shadow-lg shadow-indigo-200 dark:shadow-none bg-indigo-600 hover:bg-indigo-700">
          <Plus class="h-4 w-4" /> Tạo đơn mới
        </Button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div v-for="s in stats" :key="s.label" :class="['p-4 rounded-2xl border transition-all shadow-sm', s.bg, s.border]">
             <p class="text-[10px] font-black uppercase tracking-widest opacity-60" :class="s.color">{{ s.label }}</p>
             <p class="text-3xl font-black mt-2 tabular-nums" :class="s.color">{{ s.value }}</p>
        </div>
    </div>

    <SearchToolbar v-model="search" placeholder="Tìm theo tên hoặc mã nhân viên...">
        <template #filters>
            <FilterSelect v-model="filterStatus" label="Trạng thái" :options="statuses" />
            <FilterSelect v-model="filterDept" label="Phòng ban" :options="departments" />
        </template>
    </SearchToolbar>

    <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <DataTable :columns="columns" :rows="filteredLeaves" :loading="isLoading">
        <template #cell-employee="{ row }">
           <div>
              <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ row.employeeName }}</p>
              <p class="text-[10px] font-mono text-slate-400 font-bold uppercase">{{ row.employeeCode || '—' }}</p>
           </div>
        </template>

        <template #cell-type="{ row }">
            <Badge variant="secondary" class="bg-indigo-50 text-indigo-600 border-none font-bold text-[10px]">
                {{ (row.leaveType && typeof row.leaveType === 'object') ? row.leaveType.name : (row.leaveType || 'Nghỉ phép') }}
            </Badge>
        </template>

        <template #cell-dateRange="{ row }">
            <div class="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <span class="font-bold text-slate-400">Từ:</span> {{ row.fromDate || row.startDate }}<br/>
                <span class="font-bold text-slate-400">Đến:</span> {{ row.toDate || row.endDate }}
            </div>
        </template>

        <template #cell-status="{ value }">
           <Badge :variant="normalizeLeaveStatus(value) === 'approved' ? 'default' : 'secondary'"
                class="px-2.5 py-0.5 text-[10px] font-bold border-none"
                :class="{
                    'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30': normalizeLeaveStatus(value) === 'approved',
                    'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/30': normalizeLeaveStatus(value) === 'pending',
                    'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30': normalizeLeaveStatus(value) === 'rejected',
                }">
                {{ normalizeLeaveStatus(value) === 'approved' ? 'Đã duyệt' : normalizeLeaveStatus(value) === 'rejected' ? 'Từ chối' : 'Chờ duyệt' }}
           </Badge>
        </template>

        <template #cell-actions="{ row }">
            <div v-if="isPendingLeave(row.status)" class="flex justify-end gap-2">
                <Button size="icon" variant="outline" class="h-8 w-8 text-emerald-600 border-emerald-100 hover:bg-emerald-50" @click="handleApprove(row.id)">
                    <Check class="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" class="h-8 w-8 text-rose-600 border-rose-100 hover:bg-rose-50" @click="handleReject(row.id)">
                    <X class="h-4 w-4" />
                </Button>
            </div>
            <span v-else class="text-[10px] font-black uppercase tracking-widest text-slate-300 mr-2">Đã xử lý</span>
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
