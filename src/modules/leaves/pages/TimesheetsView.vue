<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, X, Plus, Clock, CheckCircle2, Loader2, XCircle } from 'lucide-vue-next'
import { useLeaves } from '@/modules/leaves/composables/useLeaves'
import type { CreateLeaveRequest, LeaveRequest } from '@/modules/leaves/types/leave.types'
import { isPendingLeave, normalizeLeaveStatus } from '@/modules/leaves/utils/leaveStatus'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import FilterSelect from '@/shared/ui/FilterSelect.vue'
import SearchToolbar from '@/shared/ui/SearchToolbar.vue'
import LeaveCreateModal from '@/modules/leaves/components/LeaveCreateModal.vue'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import DataTable from '@/shared/ui/DataTable.vue'
import { Card } from '@/shared/ui/card'
import PageHeader from '@/shared/ui/PageHeader.vue'
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
    { label: 'Chờ duyệt', value: leaves.value.filter(i => isPendingLeave(i.status)).length, icon: Clock },
    { label: 'Đã duyệt', value: leaves.value.filter(i => normalizeLeaveStatus(i.status) === 'approved').length, icon: CheckCircle2 },
    { label: 'Từ chối', value: leaves.value.filter(i => normalizeLeaveStatus(i.status) === 'rejected').length, icon: XCircle },
])

const columns = [
    { key: 'employee', label: 'Nhân viên' },
    { key: 'departmentName', label: 'Phòng ban' },
    { key: 'type', label: 'Loại nghỉ' },
    { key: 'dateRange', label: 'Thời gian' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'actions', label: 'Thao tác', align: 'right' as const },
]

const isCreateModalOpen = ref(false)
const processingLeaveId = ref<string | number | null>(null)
const processingAction = ref<'approve' | 'reject' | null>(null)

const isActionLoading = (id: string | number, action: 'approve' | 'reject') =>
  processingLeaveId.value === id && processingAction.value === action

const handleApprove = async (id: string | number) => {
  if (processingLeaveId.value !== null) return

  processingLeaveId.value = id
  processingAction.value = 'approve'

  try {
    await approveLeave.mutateAsync(id)
    await leavesQuery.refetch()
    toast.success('Đã phê duyệt đơn. Bảng công các ngày chưa có chấm công đã được cập nhật sang nghỉ phép.')
  } catch (err) {
    toast.error(getApiErrorMessage(err, 'Không thể phê duyệt đơn này.'))
  } finally {
    processingLeaveId.value = null
    processingAction.value = null
  }
}

const handleReject = async (id: string | number) => {
  if (processingLeaveId.value !== null) return

  processingLeaveId.value = id
  processingAction.value = 'reject'

  try {
    await rejectLeave.mutateAsync(id)
    await leavesQuery.refetch()
    toast.success('Đã từ chối đơn nghỉ phép.')
  } catch (err) {
    toast.error(getApiErrorMessage(err, 'Không thể từ chối đơn này.'))
  } finally {
    processingLeaveId.value = null
    processingAction.value = null
  }
}

const handleCreated = async (payload: CreateLeaveRequest) => {
  try {
    await createLeave.mutateAsync(payload)
    await leavesQuery.refetch()
    toast.success('Gửi đơn nghỉ phép thành công')
    isCreateModalOpen.value = false
  } catch (err) {
    toast.error(getApiErrorMessage(err, 'Gửi đơn thất bại'))
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Quản lý nghỉ phép"
      description="Phê duyệt và theo dõi đơn từ nhân viên"
    >
      <template #actions>
        <Button @click="isCreateModalOpen = true" class="h-9 px-4 bg-primary hover:bg-primary/90 font-semibold text-[10px] tracking-normal gap-2 shadow-lg shadow-primary/20 rounded">
          <Plus class="h-3.5 w-3.5" /> Tạo đơn mới
        </Button>
      </template>
    </PageHeader>

    <!-- Statistics Grid - Clean & Minimal -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card v-for="stat in stats" :key="stat.label" 
        class="border-border shadow-none p-4 sm:p-5 hover:bg-muted transition-all group rounded bg-card">
        <div class="flex flex-col">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-semibold text-tertiary-text  tracking-normal">{{ stat.label }}</span>
            <div class="h-7 w-7 rounded bg-muted flex items-center justify-center text-tertiary-text border border-border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                <component :is="stat.icon" class="h-3.5 w-3.5" />
            </div>
          </div>
          <div class="mt-3">
            <span class="text-2xl sm:text-3xl font-semibold text-primary-text tabular-nums leading-none group-hover:text-primary transition-colors">
              {{ stat.value }}
            </span>
          </div>
        </div>
      </Card>
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
              <p class="font-semibold text-primary-text leading-tight">{{ row.employeeName }}</p>
              <p class="text-[9px] font-mono text-primary font-bold tracking-normal">{{ row.employeeCode || '—' }}</p>
           </div>
        </template>

        <template #cell-type="{ row }">
            <Badge variant="outline" class="bg-primary/10/50 text-primary border-primary/20 font-bold text-[9px] px-1.5 ">
                {{ (row.leaveType && typeof row.leaveType === 'object') ? row.leaveType.name : (row.leaveTypeName || row.leaveType || 'Nghỉ phép') }}
            </Badge>
        </template>

        <template #cell-departmentName="{ row }">
            <div class="py-1">
              <p class="font-medium text-primary-text leading-tight">{{ row.departmentName || '—' }}</p>
              <p class="text-[9px] text-secondary-text leading-tight">{{ row.positionName || '—' }}</p>
            </div>
        </template>

        <template #cell-dateRange="{ row }">
            <div class="text-[10px] sm:text-[11px] font-medium text-secondary-text flex flex-col gap-0.5">
                <span>{{ row.fromDate || row.startDate }}</span>
                <span class="text-[8px] font-bold text-tertiary-text">đến</span>
                <span>{{ row.toDate || row.endDate }}</span>
            </div>
        </template>

        <template #cell-status="{ value }">
           <Badge variant="outline"
                class="px-2 py-0.5 text-[9px] font-bold border-primary/20 bg-primary/10 text-primary ">
                {{ normalizeLeaveStatus(value) === 'approved' ? 'Đã duyệt' : normalizeLeaveStatus(value) === 'rejected' ? 'Từ chối' : 'Chờ duyệt' }}
           </Badge>
        </template>

        <template #cell-actions="{ row }">
            <div v-if="isPendingLeave(row.status)" class="flex justify-end gap-1.5">
                <Button
                    size="icon"
                    variant="outline"
                    class="h-8 w-8 text-primary border-primary/20 hover:bg-primary/10"
                    :aria-label="`Phe duyet don ${row.id}`"
                    :disabled="processingLeaveId !== null"
                    @click="handleApprove(row.id)"
                >
                    <Loader2 v-if="isActionLoading(row.id, 'approve')" class="h-4 w-4 animate-spin" />
                    <Check v-else class="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="outline"
                    class="h-8 w-8 text-primary border-primary/20 hover:bg-primary/10"
                    :aria-label="`Tu choi don ${row.id}`"
                    :disabled="processingLeaveId !== null"
                    @click="handleReject(row.id)"
                >
                    <Loader2 v-if="isActionLoading(row.id, 'reject')" class="h-4 w-4 animate-spin" />
                    <X v-else class="h-4 w-4" />
                </Button>
            </div>
            <span v-else class="text-[10px] font-semibold  tracking-normal text-tertiary-text mr-2">Hoàn thành</span>
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
