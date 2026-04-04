<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Filter, X } from 'lucide-vue-next'
import { useLeaves } from '@/composables/useLeaves'
import type { CreateLeaveRequest, LeaveRequest } from '@/types/leave'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import { isPendingLeave, normalizeLeaveStatus } from '@/lib/leaveStatus'

const filterStatus = ref('')
const filterDept = ref('')
const departments = computed(() => {
  const all = leaves.value.map((item) => item.departmentName).filter(Boolean) as string[]
  return [...new Set(all)].map((name) => ({ label: name, value: name }))
})

const statuses = [
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Đã duyệt', value: 'approved' },
  { label: 'Từ chối', value: 'rejected' },
]

const { leavesQuery, leaveTypesQuery, approveLeave, rejectLeave, createLeave, deleteLeave } = useLeaves()
const { data: leavesRaw, isLoading, isError, error } = leavesQuery
const leaves = computed<LeaveRequest[]>(() => leavesRaw.value ?? [])
const leaveTypes = computed(() => leaveTypesQuery.data.value ?? [])
const isLoadingLeaveTypes = computed(() => leaveTypesQuery.isLoading.value)

const filteredLeaves = computed(() => {
  return leaves.value.filter((item) => {
    const canonical = normalizeLeaveStatus(item.status)
    const okStatus = filterStatus.value ? canonical === filterStatus.value : true
    const okDept = filterDept.value ? item.departmentName === filterDept.value : true
    return okStatus && okDept
  })
})

const pendingCount = computed(
  () => leaves.value.filter((item) => isPendingLeave(item.status)).length,
)
const approvedCount = computed(
  () => leaves.value.filter((item) => normalizeLeaveStatus(item.status) === 'approved').length,
)
const rejectedCount = computed(
  () => leaves.value.filter((item) => normalizeLeaveStatus(item.status) === 'rejected').length,
)

const getStatusLabel = (status: string) => {
  const c = normalizeLeaveStatus(status)
  if (c === 'approved') return 'Đã duyệt'
  if (c === 'rejected') return 'Từ chối'
  return 'Chờ duyệt'
}

const getStatusClass = (status: string) => {
  const c = normalizeLeaveStatus(status)
  if (c === 'approved')
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
  if (c === 'rejected') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
}

const leaveDateRange = (item: LeaveRequest) => {
  const from = item.fromDate ?? item.startDate ?? '—'
  const to = item.toDate ?? item.endDate ?? '—'
  return `${from} - ${to}`
}

const isCreateModalOpen = ref(false)
const createLeaveError = ref('')

const isCreatingLeave = computed(() => createLeave.isPending.value)

const onCreateModalClose = () => {
  isCreateModalOpen.value = false
  createLeaveError.value = ''
}

const handleCreated = async (payload: CreateLeaveRequest) => {
  createLeaveError.value = ''
  try {
    await createLeave.mutateAsync(payload)
    isCreateModalOpen.value = false
  } catch (e: unknown) {
    createLeaveError.value = getApiErrorMessage(e)
  }
}

const leaveMutationError = ref('')

const clearMutationError = () => {
  leaveMutationError.value = ''
}

const onMutationError = (e: unknown) => {
  leaveMutationError.value = getApiErrorMessage(e)
}

const mutationOpts = {
  onError: onMutationError,
  onSuccess: clearMutationError,
}

const handleApprove = (id: string | number) => {
  clearMutationError()
  approveLeave.mutate(id, mutationOpts)
}

const handleReject = (id: string | number) => {
  clearMutationError()
  rejectLeave.mutate(id, mutationOpts)
}

const handleCancel = (id: string | number) => {
  clearMutationError()
  deleteLeave.mutate(id, mutationOpts)
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Nghỉ phép" description="Quản lý đơn nghỉ phép của nhân viên">
      <template #actions>
        <button
          @click="isCreateModalOpen = true"
          class="flex items-center gap-2 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-colors"
        >
          Tạo đơn nghỉ
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div
        class="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm dark:border-amber-900 dark:bg-amber-950/50"
      >
        <p class="text-[11px] font-bold uppercase tracking-wider text-amber-600">Chờ duyệt</p>
        <p class="mt-2 text-2xl font-black text-amber-700 dark:text-amber-400">
          {{ pendingCount }}
        </p>
      </div>
      <div
        class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/50"
      >
        <p class="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Đã duyệt</p>
        <p class="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">
          {{ approvedCount }}
        </p>
      </div>
      <div
        class="rounded-2xl border border-rose-100 bg-rose-50 p-4 shadow-sm dark:border-rose-900 dark:bg-rose-950/50"
      >
        <p class="text-[11px] font-bold uppercase tracking-wider text-rose-600">Từ chối</p>
        <p class="mt-2 text-2xl font-black text-rose-700 dark:text-rose-400">{{ rejectedCount }}</p>
      </div>
    </div>

    <div
      v-if="leaveMutationError"
      class="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
    >
      <span>{{ leaveMutationError }}</span>
      <button
        type="button"
        class="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/50"
        @click="clearMutationError"
      >
        Đóng
      </button>
    </div>

    <div class="flex items-center gap-3 flex-wrap">
      <div class="flex items-center gap-1.5 text-sm font-medium text-slate-500">
        <Filter class="h-4 w-4" />
        Lọc theo:
      </div>
      <FilterSelect v-model="filterStatus" label="Trạng thái" :options="statuses" />
      <FilterSelect v-model="filterDept" label="Phòng ban" :options="departments" />
    </div>

    <div
      class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800">
              <th
                class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400"
              >
                Nhân viên
              </th>
              <th
                class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400"
              >
                Phòng ban
              </th>
              <th
                class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400"
              >
                Thời gian nghỉ
              </th>
              <th
                class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400"
              >
                Lý do
              </th>
              <th
                class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400"
              >
                Trạng thái
              </th>
              <th
                class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400"
              >
                Hành động
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <LoadingErrorState
              v-if="isLoading || isError"
              mode="row"
              :colspan="6"
              :is-loading="isLoading"
              :is-error="isError"
              :error="error"
              loadingText="Đang tải đơn nghỉ phép..."
              errorText="Không thể tải đơn nghỉ phép"
              retryLabel="Thử lại"
              @retry="() => leavesQuery.refetch()"
            />

            <tr v-else-if="filteredLeaves.length === 0">
              <td colspan="6" class="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                Không có đơn nghỉ phép phù hợp
              </td>
            </tr>
            <tr
              v-else
              v-for="item in filteredLeaves"
              :key="item.id"
              class="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50"
            >
              <td class="px-4 py-3">
                <p class="text-sm font-medium text-slate-900 dark:text-white">
                  {{ item.employeeName }}
                </p>
                <p class="text-xs text-slate-400 font-mono">{{ item.employeeCode || '—' }}</p>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                {{ item.departmentName || '—' }}
              </td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                {{ leaveDateRange(item) }}
              </td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                {{ item.reason }}
              </td>
              <td class="px-4 py-3">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                    getStatusClass(item.status),
                  ]"
                >
                  {{ getStatusLabel(item.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div
                  v-if="isPendingLeave(item.status)"
                  class="inline-flex flex-wrap items-center justify-end gap-2"
                >
                  <button
                    class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    @click="handleApprove(item.id)"
                  >
                    <Check class="h-3.5 w-3.5" />
                    Duyệt
                  </button>
                  <button
                    class="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                    @click="handleReject(item.id)"
                  >
                    <X class="h-3.5 w-3.5" />
                    Từ chối
                  </button>
                  <button
                    class="inline-flex items-center gap-1 rounded-lg bg-slate-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-600"
                    @click="handleCancel(item.id)"
                  >
                    Hủy
                  </button>
                </div>
                <span v-else class="text-xs text-slate-400">Đã xử lý</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <LeaveCreateModal
      :open="isCreateModalOpen"
      :server-error="createLeaveError || undefined"
      :is-submitting="isCreatingLeave"
      :leave-types="leaveTypes"
      :is-loading-leave-types="isLoadingLeaveTypes"
      @close="onCreateModalClose"
      @created="handleCreated"
    />
  </div>
</template>
