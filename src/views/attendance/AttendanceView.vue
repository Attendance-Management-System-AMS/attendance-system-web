// ...existing code from AttendanceView.vue will be copied here
<script setup lang="ts">
import { ref } from 'vue'
import { Timer } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchToolbar from '@/components/ui/SearchToolbar.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ActionDropdown from '@/components/ui/ActionDropdown.vue'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'

type StatusKey = 'present' | 'late' | 'absent' | 'working' | 'leave'

interface AttendanceRecord {
    id: string
    name: string
    empCode: string
    dept: string
    avatar: string
    shift: string
    shiftTime: string
    checkIn: string
    checkOut: string
    overtime: string
    status: StatusKey
    lateMinutes?: number
}

const search = ref('')
const filterDept = ref('')
const filterShift = ref('')
const filterStatus = ref('')
const deleteDialog = ref(false)
const deleteTarget = ref<AttendanceRecord | null>(null)

const departments = [
    { label: 'Nhân sự', value: 'hr' },
    { label: 'Công nghệ', value: 'it' },
    { label: 'Tài chính', value: 'finance' },
    { label: 'Kinh doanh', value: 'sales' },
    { label: 'Vận hành', value: 'ops' },
]

const shifts = [
    { label: 'Ca sáng (08:00–17:30)', value: 'morning' },
    { label: 'Ca chiều (13:00–22:00)', value: 'afternoon' },
    { label: 'Ca đêm (22:00–06:00)', value: 'night' },
]

const statuses = [
    { label: 'Đúng giờ', value: 'present' },
    { label: 'Đi trễ', value: 'late' },
    { label: 'Vắng mặt', value: 'absent' },
    { label: 'Đang làm', value: 'working' },
    { label: 'Nghỉ phép', value: 'leave' },
]

const records: AttendanceRecord[] = [
    {
        id: 'att-001',
        name: 'Trần Minh Anh',
        empCode: 'NV001',
        dept: 'Nhân sự',
        avatar: 'MA',
        shift: 'Ca sáng',
        shiftTime: '08:00–17:30',
        checkIn: '07:58',
        checkOut: '17:32',
        overtime: '0h',
        status: 'present',
    },
    {
        id: 'att-002',
        name: 'Nguyễn Đức Dũng',
        empCode: 'NV002',
        dept: 'Công nghệ',
        avatar: 'ND',
        shift: 'Ca sáng',
        shiftTime: '08:00–17:30',
        checkIn: '08:23',
        checkOut: '18:10',
        overtime: '0h40',
        status: 'late',
        lateMinutes: 23,
    },
    {
        id: 'att-003',
        name: 'Lê Hoài Nam',
        empCode: 'NV003',
        dept: 'Tài chính',
        avatar: 'HN',
        shift: 'Ca sáng',
        shiftTime: '08:00–17:30',
        checkIn: '07:55',
        checkOut: '17:30',
        overtime: '0h',
        status: 'present',
    },
    {
        id: 'att-004',
        name: 'Phạm Thị Thủy',
        empCode: 'NV004',
        dept: 'Kinh doanh',
        avatar: 'PT',
        shift: 'Ca sáng',
        shiftTime: '08:00–17:30',
        checkIn: '--',
        checkOut: '--',
        overtime: '--',
        status: 'leave',
    },
    {
        id: 'att-005',
        name: 'Ngô Phương Linh',
        empCode: 'NV005',
        dept: 'Vận hành',
        avatar: 'PL',
        shift: 'Ca chiều',
        shiftTime: '13:00–22:00',
        checkIn: '13:02',
        checkOut: '--',
        overtime: '--',
        status: 'working',
    },
    {
        id: 'att-006',
        name: 'Võ Minh Khoa',
        empCode: 'NV006',
        dept: 'IT',
        avatar: 'MK',
        shift: 'Ca chiều',
        shiftTime: '13:00–22:00',
        checkIn: '--',
        checkOut: '--',
        overtime: '--',
        status: 'absent',
    },
    {
        id: 'att-007',
        name: 'Đỗ Thị Hằng',
        empCode: 'NV007',
        dept: 'Nhân sự',
        avatar: 'TH',
        shift: 'Ca sáng',
        shiftTime: '08:00–17:30',
        checkIn: '08:01',
        checkOut: '17:35',
        overtime: '0h05',
        status: 'present',
    },
    {
        id: 'att-008',
        name: 'Bùi Quốc Tuấn',
        empCode: 'NV008',
        dept: 'Tài chính',
        avatar: 'QT',
        shift: 'Ca sáng',
        shiftTime: '08:00–17:30',
        checkIn: '08:45',
        checkOut: '17:30',
        overtime: '0h',
        status: 'late',
        lateMinutes: 45,
    },
]

const handleDelete = (id: string | number) => {
    const record = records.find((r) => r.id === String(id))
    if (record) {
        deleteTarget.value = record
        deleteDialog.value = true
    }
}

const confirmDelete = () => {
    deleteDialog.value = false
    deleteTarget.value = null
    // In real app: call API to delete
}

const avatarColors = [
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-slate-100 text-slate-700',
]

const getAvatarColor = (idx: number) => avatarColors[idx % avatarColors.length]
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

        <!-- Table -->
        <div
            class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800">
                            <th
                                class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Nhân viên & Phòng ban
                            </th>
                            <th
                                class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Ca làm việc
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
                                Làm thêm
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
                        <tr v-for="(row, idx) in records" :key="row.id"
                            class="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50">
                            <td class="px-4 py-3">
                                <div class="flex items-center gap-3">
                                    <div :class="[
                                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                        getAvatarColor(idx),
                                    ]">
                                        {{ row.avatar }}
                                    </div>
                                    <div>
                                        <p class="text-sm font-semibold text-slate-900 dark:text-white">
                                            {{ row.name }}
                                        </p>
                                        <p class="text-xs text-slate-400 font-mono">
                                            {{ row.empCode }} · {{ row.dept }}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-3">
                                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {{ row.shift }}
                                </p>
                                <p class="text-xs text-slate-400">{{ row.shiftTime }}</p>
                            </td>
                            <td class="px-4 py-3 font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
                                {{ row.checkIn }}
                            </td>
                            <td class="px-4 py-3 font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
                                {{ row.checkOut }}
                            </td>
                            <td class="px-4 py-3">
                                <span class="text-sm text-slate-500 font-mono">{{ row.overtime }}</span>
                            </td>
                            <td class="px-4 py-3">
                                <StatusBadge :status="row.status" :custom-label="row.status === 'late' && row.lateMinutes
                                    ? `Trễ ${row.lateMinutes} phút`
                                    : undefined
                                    " />
                            </td>
                            <td class="px-4 py-3 text-right">
                                <ActionDropdown :item-id="row.id" :edit-to="`/attendance/${row.id}/edit`"
                                    @delete="handleDelete" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Delete confirm dialog -->
        <DeleteConfirmDialog :open="deleteDialog" title="Xóa bản ghi chấm công"
            description="Bạn có chắc chắn muốn xóa bản ghi chấm công của nhân viên này không?"
            :item-name="deleteTarget?.name" @confirm="confirmDelete" @cancel="deleteDialog = false" />
    </div>
</template>
