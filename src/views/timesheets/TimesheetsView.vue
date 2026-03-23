<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Filter, X } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import { useLeaves } from '@/composables/useLeaves'
import type { LeaveRequest } from '@/types/leave'

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

const { leavesQuery, approveLeave, rejectLeave } = useLeaves()
const { data: leavesRaw, isLoading, isError, error } = leavesQuery
const leaves = computed<LeaveRequest[]>(() => leavesRaw.value ?? [])

const filteredLeaves = computed(() => {
  return leaves.value.filter((item) => {
    const okStatus = filterStatus.value ? item.status === filterStatus.value : true
    const okDept = filterDept.value ? item.departmentName === filterDept.value : true
    return okStatus && okDept
  })
})

const pendingCount = computed(() => leaves.value.filter((item) => item.status === 'pending').length)
const approvedCount = computed(() => leaves.value.filter((item) => item.status === 'approved').length)
const rejectedCount = computed(() => leaves.value.filter((item) => item.status === 'rejected').length)

const getStatusLabel = (status: string) => {
  if (status === 'approved') return 'Đã duyệt'
  if (status === 'rejected') return 'Từ chối'
  return 'Chờ duyệt'
}

const getStatusClass = (status: string) => {
  if (status === 'approved') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
  if (status === 'rejected') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Nghỉ phép" description="Quản lý đơn nghỉ phép của nhân viên" />

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm dark:border-amber-900 dark:bg-amber-950/50">
        <p class="text-[11px] font-bold uppercase tracking-wider text-amber-600">Chờ duyệt</p>
        <p class="mt-2 text-2xl font-black text-amber-700 dark:text-amber-400">{{ pendingCount }}</p>
      </div>
      <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/50">
        <p class="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Đã duyệt</p>
        <p class="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">{{ approvedCount }}</p>
      </div>
      <div class="rounded-2xl border border-rose-100 bg-rose-50 p-4 shadow-sm dark:border-rose-900 dark:bg-rose-950/50">
        <p class="text-[11px] font-bold uppercase tracking-wider text-rose-600">Từ chối</p>
        <p class="mt-2 text-2xl font-black text-rose-700 dark:text-rose-400">{{ rejectedCount }}</p>
      </div>
    </div>

    <div class="flex items-center gap-3 flex-wrap">
      <div class="flex items-center gap-1.5 text-sm font-medium text-slate-500">
        <Filter class="h-4 w-4" />
        Lọc theo:
      </div>
      <FilterSelect v-model="filterStatus" label="Trạng thái" :options="statuses" />
      <FilterSelect v-model="filterDept" label="Phòng ban" :options="departments" />
    </div>

    <div v-if="isLoading" class="text-center py-12 text-slate-500 dark:text-slate-400">
      Đang tải đơn nghỉ phép...
    </div>

    <div v-else-if="isError" class="text-center py-12 text-red-600 dark:text-red-400">
      Lỗi: {{ (error as Error)?.message || 'Không thể tải dữ liệu' }}
      <button class="ml-4 text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400" @click="() => leavesQuery.refetch()">
        Thử lại
      </button>
    </div>

    <div
      v-else
      class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800">
              <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Nhân viên</th>
              <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Phòng ban</th>
              <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Thời gian nghỉ</th>
              <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Lý do</th>
              <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Trạng thái</th>
              <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Duyệt</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="item in filteredLeaves" :key="item.id" class="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50">
              <td class="px-4 py-3">
                <p class="text-sm font-medium text-slate-900 dark:text-white">{{ item.employeeName }}</p>
                <p class="text-xs text-slate-400 font-mono">{{ item.employeeCode || '—' }}</p>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ item.departmentName || '—' }}</td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                {{ item.startDate }} - {{ item.endDate }}
              </td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ item.reason }}</td>
              <td class="px-4 py-3">
                <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold', getStatusClass(item.status)]">
                  {{ getStatusLabel(item.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div v-if="item.status === 'pending'" class="inline-flex items-center gap-2">
                  <button
                    class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    @click="approveLeave.mutate(item.id)"
                  >
                    <Check class="h-3.5 w-3.5" />
                    Duyệt
                  </button>
                  <button
                    class="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                    @click="rejectLeave.mutate(item.id)"
                  >
                    <X class="h-3.5 w-3.5" />
                    Từ chối
                  </button>
                </div>
                <span v-else class="text-xs text-slate-400">Đã xử lý</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
