<script setup lang="ts">
import { ref, computed } from 'vue'
import { Timer } from 'lucide-vue-next'
import { useAttendance } from '@/composables/useAttendance'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchToolbar from '@/components/ui/SearchToolbar.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import ActionDropdown from '@/components/ui/ActionDropdown.vue'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Avatar from '@/components/ui/avatar/Avatar.vue'
import AvatarImage from '@/components/ui/avatar/AvatarImage.vue'
import AvatarFallback from '@/components/ui/avatar/AvatarFallback.vue'
import type { Attendance, AttendanceStatus } from '@/types/attendance'

const { attendanceQuery } = useAttendance()
const { data: recordsRaw, isLoading, isError, error } = attendanceQuery
const records = computed(() => recordsRaw.value ?? [])

const search = ref('')
const filterDept = ref('')
const filterShift = ref('')
const filterStatus = ref('')
const deleteDialog = ref(false)
const deleteTarget = ref<Attendance | null>(null)

const departments = [
    { label: 'Nhân sự', value: 'hr' },
    { label: 'Công nghệ', value: 'it' },
    { label: 'Tài chính', value: 'finance' },
    { label: 'Kinh doanh', value: 'sales' },
    { label: 'Vận hành', value: 'ops' },
]

const shifts = [
    { label: 'Ca sáng', value: 'morning' },
    { label: 'Ca chiều', value: 'afternoon' },
    { label: 'Ca đêm', value: 'night' },
]

const statuses = [
    { label: 'Có mặt', value: 'Có mặt' },
    { label: 'Đi muộn', value: 'Đi muộn' },
    { label: 'Nghỉ phép', value: 'Nghỉ phép' },
]

const handleDelete = (id: string | number) => {
    const record = records.value.find(r => r.id === String(id))
    if (record) {
        deleteTarget.value = record
        deleteDialog.value = true
    }
}

const confirmDelete = () => {
    deleteDialog.value = false
    deleteTarget.value = null
}

const badgeVariantByStatus: Record<AttendanceStatus, 'success' | 'warning' | 'secondary'> = {
    'Có mặt': 'success',
    'Đi muộn': 'warning',
    'Nghỉ phép': 'secondary',
}
</script>

<template>
    <div class="space-y-6">
        <PageHeader title="Chấm công hôm nay" description="Theo dõi tình trạng điểm danh trong ngày">
            <template #actions>
                <button
                    class="flex items-center gap-2 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors dark:shadow-none">
                    <Timer class="h-4 w-4" />
                    Chấm công nhanh
                </button>
            </template>
        </PageHeader>

        <!-- Toolbar -->
        <SearchToolbar v-model="search" placeholder="Tìm theo tên, mã nhân viên...">
            <template #filters>
                <FilterSelect v-model="filterDept" label="Phòng ban" :options="departments" />
                <FilterSelect v-model="filterShift" label="Ca" :options="shifts" />
                <FilterSelect v-model="filterStatus" label="Trạng thái" :options="statuses" />
            </template>
        </SearchToolbar>

        <!-- Loading / Error states -->
        <div v-if="isLoading" class="text-center py-12 text-slate-500">
            Đang tải dữ liệu chấm công...
        </div>

        <div v-else-if="isError" class="text-center py-12 text-red-600">
            Lỗi: {{ (error as Error)?.message || 'Không thể tải dữ liệu' }}
            <button class="ml-4 text-indigo-600 underline" @click="() => attendanceQuery.refetch()">
                Thử lại
            </button>
        </div>

        <!-- Table -->
        <div v-else
            class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800">
                            <th
                                class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Nhân viên
                            </th>
                            <th
                                class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Giờ vào
                            </th>
                            <th
                                class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Giờ ra
                            </th>
                            <th
                                class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Trạng thái
                            </th>
                            <th
                                class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr v-for="record in records" :key="record.id"
                            class="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50">
                            <td class="px-4 py-3">
                                <div class="flex items-center gap-3">
                                    <Avatar class="size-9">
                                        <AvatarImage :src="record.employee.avatarUrl ?? ''"
                                            :alt="record.employee.name" />
                                        <AvatarFallback>
                                            {{ record.employee.name.slice(0, 2).toUpperCase() }}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p class="text-sm font-semibold text-slate-900 dark:text-white">
                                            {{ record.employee.name }}
                                        </p>
                                        <p class="text-xs text-slate-400">
                                            {{ record.employee.department }} • {{ record.employee.role }}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                {{ record.checkIn }}
                            </td>
                            <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                {{ record.checkOut }}
                            </td>
                            <td class="px-4 py-3">
                                <Badge :variant="badgeVariantByStatus[record.status]">
                                    {{ record.status }}
                                </Badge>
                            </td>
                            <td class="px-4 py-3 text-right">
                                <ActionDropdown :item-id="record.id" @delete="handleDelete" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <DeleteConfirmDialog :open="deleteDialog" title="Xóa bản ghi"
            description="Bạn có chắc chắn muốn xóa bản ghi chấm công này không?"
            :item-name="deleteTarget?.employee.name" @confirm="confirmDelete" @cancel="deleteDialog = false" />
    </div>
</template>
