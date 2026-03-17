<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchToolbar from '@/components/ui/SearchToolbar.vue'
import ActionDropdown from '@/components/ui/ActionDropdown.vue'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'
import DepartmentCreateModal from '@/components/departments/DepartmentCreateModal.vue'

// Interface đầy đủ cho list view (BE nên trả về hoặc tính động)
interface Department {
    id: string
    name: string
    description: string
    manager?: string          // Tên trưởng phòng (từ employee table)
    employeeCount: number     // Tính động: count employees in dept
    defaultShift?: string     // Từ config ca làm việc
    status: 'active' | 'inactive'
    location?: string         // Optional, nếu có
}

// Dữ liệu mẫu (thay bằng fetch từ API/Pinia)
const departments = ref<Department[]>([
    { id: 'dept-001', name: 'Nhân sự', description: 'Quản lý tuyển dụng, đào tạo và quan hệ lao động', manager: 'Trần Minh Anh', employeeCount: 12, defaultShift: 'Ca sáng', status: 'active', location: 'Đà Nẵng' },
    { id: 'dept-002', name: 'Công nghệ', description: 'Phát triển phần mềm, bảo trì hệ thống IT', manager: 'Nguyễn Đức Dũng', employeeCount: 25, defaultShift: 'Ca linh hoạt', status: 'active', location: 'Đà Nẵng' },
    { id: 'dept-003', name: 'Tài chính - Kế toán', description: 'Quản lý ngân sách, báo cáo tài chính', manager: 'Lê Hoài Nam', employeeCount: 8, defaultShift: 'Ca sáng', status: 'active', location: 'Hà Nội' },
    { id: 'dept-004', name: 'Kinh doanh', description: 'Bán hàng, marketing và chăm sóc khách hàng', manager: 'Phạm Thị Thủy', employeeCount: 30, defaultShift: 'Ca chiều', status: 'active' },
    { id: 'dept-005', name: 'Vận hành', description: 'Logistics, kho vận và hỗ trợ sản xuất', manager: 'Ngô Phương Linh', employeeCount: 18, defaultShift: 'Ca đêm', status: 'inactive' },
])

// Lọc theo search (tìm theo tên hoặc mô tả)
const filteredDepartments = computed(() => {
    if (!search.value) return departments.value
    const term = search.value.toLowerCase()
    return departments.value.filter(dept =>
        dept.name.toLowerCase().includes(term) ||
        dept.description.toLowerCase().includes(term) ||
        dept.manager?.toLowerCase().includes(term)
    )
})

const search = ref('')
const deleteDialog = ref(false)
const deleteTarget = ref<Department | null>(null)
const isCreateModalOpen = ref(false)

const avatarColors = [
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
]

const getAvatarColor = (idx: number) => avatarColors[idx % avatarColors.length]

const handleDelete = (id: string | number) => {
    const dept = departments.value.find(d => d.id === id.toString())
    if (dept) {
        deleteTarget.value = dept
        deleteDialog.value = true
    }
}

const handleDepartmentCreated = (newDept: { name: string; description: string }) => {
    // Thêm tạm thời (optimistic), sau này dùng API để lấy full data
    departments.value.push({
        id: `dept-${Date.now()}`,
        name: newDept.name,
        description: newDept.description,
        manager: 'Chưa chỉ định',
        employeeCount: 0,
        defaultShift: 'Chưa cấu hình',
        status: 'active',
    })
    // Gọi API create thực tế và refresh list
}
</script>

<template>
    <div class="space-y-6 p-6">
        <PageHeader title="Phòng ban" description="Quản lý các phòng ban trong tổ chức">
            <template #actions>
                <button @click="isCreateModalOpen = true"
                    class="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-colors">
                    <Plus class="h-4 w-4" />
                    Thêm phòng ban
                </button>
            </template>
        </PageHeader>

        <SearchToolbar v-model="search" placeholder="Tìm kiếm phòng ban, trưởng phòng..." />

        <div
            class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead class="bg-slate-50 dark:bg-slate-900">
                        <tr>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Tên phòng ban</th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Mô tả</th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Trưởng phòng</th>
                            <th
                                class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Số NV</th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Ca mặc định</th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Trạng thái</th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Địa điểm</th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Hành động</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                        <tr v-for="(dept, idx) in filteredDepartments" :key="dept.id"
                            class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td class="whitespace-nowrap px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div
                                        :class="['flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold', getAvatarColor(idx)]">
                                        {{ dept.name.charAt(0) }}
                                    </div>
                                    <span class="font-medium text-slate-900 dark:text-white">{{ dept.name }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{{ dept.description || '—'
                                }}</td>
                            <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{{ dept.manager || 'Chưa chỉ định'
                                }}</td>
                            <td class="px-6 py-4 text-center">
                                <span
                                    class="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                    {{ dept.employeeCount }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{{ dept.defaultShift ||'Chưa cấu hình' }}</td>
                            <td class="px-6 py-4">
                                <span :class="[
                                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
                                    dept.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                ]">
                                    {{ dept.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động' }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{{ dept.location || '—' }}
                            </td>
                            <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                <ActionDropdown :item-id="dept.id" :edit-to="`/departments/${dept.id}/edit`"
                                    @delete="handleDelete" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal create chỉ tên + mô tả -->
        <DepartmentCreateModal :open="isCreateModalOpen" @close="isCreateModalOpen = false"
            @created="handleDepartmentCreated" />

        <!-- Xóa confirm -->
        <DeleteConfirmDialog :open="deleteDialog" title="Xóa phòng ban"
            description="Bạn có chắc chắn muốn xóa? Nhân viên trong phòng không bị ảnh hưởng."
            :item-name="deleteTarget?.name" @confirm="deleteDialog = false" 
            @cancel="deleteDialog = false"
            />
    </div>
</template>