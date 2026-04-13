<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import { ref, computed } from 'vue'
import { useAttendance } from '@/composables/useAttendance'
import { useDepartments } from '@/composables/useDepartments'
import type { Attendance } from '@/types/attendance'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SearchToolbar from '@/components/ui/SearchToolbar.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import ActionDropdown from '@/components/ui/ActionDropdown.vue'
import DataTable from '@/components/ui/DataTable.vue'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'
import { toast } from 'vue-sonner'

const search = ref('')
const filterDept = ref('')
const filterShift = ref('')
const filterStatus = ref('')
const { departmentsQuery } = useDepartments({ size: 200, sort: 'name', sortDir: 'asc' })

const attendanceFilters = computed(() => ({
    search: search.value,
    department: filterDept.value,
    shift: filterShift.value,
    status: filterStatus.value,
}))

const { attendanceQuery, deleteAttendance } = useAttendance(attendanceFilters)
const { data: records, isLoading } = attendanceQuery

const columns = [
    { key: 'employee', label: 'Nhân viên' },
    { key: 'checkIn', label: 'Giờ vào' },
    { key: 'checkOut', label: 'Giờ ra' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'actions', label: 'Hành động', align: 'right' as const },
]

const departments = computed(
    () =>
        departmentsQuery.data.value?.content.map((department) => ({
            label: department.name,
            value: String(department.id),
        })) ?? [],
)

const shifts = [
    { label: 'Ca sáng', value: 'morning' },
    { label: 'Ca chiều', value: 'afternoon' },
    { label: 'Ca đêm', value: 'night' },
]

const statuses = [
    { label: 'Chưa chấm công', value: 'UNRECORDED' },
    { label: 'Có mặt', value: 'PRESENT' },
    { label: 'Đi muộn', value: 'LATE' },
    { label: 'Về sớm', value: 'EARLY_LEAVE' },
    { label: 'Muộn + về sớm', value: 'LATE_AND_EARLY_LEAVE' },
    { label: 'Nghỉ phép', value: 'ON_LEAVE' },
    { label: 'Ngày lễ', value: 'HOLIDAY' },
    { label: 'Vắng mặt', value: 'ABSENT' },
    { label: 'Thiếu checkout', value: 'MISSING_CHECKOUT' },
]

const deleteTarget = ref<Attendance | null>(null)
const isAlertOpen = ref(false)

const handleDelete = (id: string | number) => {
    const record = records.value?.find(r => String(r.id) === String(id))
    if (record?.isRecorded) {
        deleteTarget.value = record
        isAlertOpen.value = true
    }
}

const confirmDelete = () => {
    if (deleteTarget.value) {
        deleteAttendance.mutate(deleteTarget.value.id, {
            onSuccess: () => {
                toast.success('Đã xóa hồ sơ chấm công thành công')
                isAlertOpen.value = false
                deleteTarget.value = null
            },
            onError: () => {
                toast.error('Không thể xóa hồ sơ chấm công')
            }
        })
    }
}

const getInitials = (name?: string) => {
  if (!name) return '??'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    const first = parts[0]?.charAt(0) || ''
    const last = parts[parts.length - 1]?.charAt(0) || ''
    return (first + last).toUpperCase() || '??'
  }
  return (parts[0]?.charAt(0) || '?').toUpperCase()
}
</script>

<template>
    <div class="space-y-6">
        <PageHeader title="Chấm công hôm nay" description="Theo dõi tình trạng điểm danh trong ngày" />

        <SearchToolbar v-model="search" placeholder="Tìm theo tên, mã nhân viên...">
            <template #filters>
                <FilterSelect v-model="filterDept" label="Phòng ban" :options="departments" />
                <FilterSelect v-model="filterShift" label="Ca" :options="shifts" />
                <FilterSelect v-model="filterStatus" label="Trạng thái" :options="statuses" />
            </template>
        </SearchToolbar>

        <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <DataTable 
                :columns="columns" 
                :rows="records || []" 
                :loading="isLoading"
            >
                <template #cell-employee="{ row }">
                    <div class="flex items-center gap-3">
                        <Avatar class="size-9 h-9 w-9 border border-indigo-50 dark:border-indigo-950">
                            <AvatarImage :src="`/api/avatar/${row.employee?.id}`" />
                            <AvatarFallback class="bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                                {{ getInitials(row.employee?.fullName) }}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p class="text-sm font-bold text-slate-700 dark:text-slate-200">
                                {{ row.employee?.fullName ?? '—' }}
                            </p>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                {{ row.employee?.departmentName ?? '—' }}
                            </p>
                        </div>
                    </div>
                </template>

                <template #cell-checkIn="{ value }">
                    <code class="text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                        {{ value || '—:—' }}
                    </code>
                </template>

                <template #cell-checkOut="{ value }">
                    <code class="text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                        {{ value || '—:—' }}
                    </code>
                </template>

                <template #cell-status="{ value }">
                    <Badge 
                        :variant="value === 'Có mặt' ? 'default' : value === 'Đi muộn' ? 'outline' : 'secondary'"
                        class="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border-none"
                        :class="{
                            'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30': value === 'Có mặt',
                            'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/30': value === 'Đi muộn' || value === 'Muộn + về sớm',
                            'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/30': value === 'Về sớm',
                            'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30': value === 'Vắng mặt' || value === 'Thiếu checkout',
                            'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800': value === 'Chưa chấm công' || value === 'Nghỉ phép' || value === 'Ngày lễ'
                        }"
                    >
                        {{ value }}
                    </Badge>
                </template>

                <template #cell-actions="{ row }">
                    <ActionDropdown v-if="row.isRecorded" :item-id="row.id" @delete="handleDelete" />
                    <span v-else class="text-xs text-slate-400">—</span>
                </template>
            </DataTable>
        </div>

        <DeleteConfirmDialog 
            :open="isAlertOpen" 
            title="Xác nhận xóa bản ghi" 
            description="Lịch sử chấm công của ngày này sẽ bị gỡ bỏ khỏi hệ thống."
            :item-name="deleteTarget?.employee?.fullName"
            @confirm="confirmDelete"
            @cancel="isAlertOpen = false"
        />
    </div>
</template>
