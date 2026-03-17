<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchToolbar from '@/components/ui/SearchToolbar.vue'
import ActionDropdown from '@/components/ui/ActionDropdown.vue'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'

interface Department {
  id: string
  name: string
  manager: string
  employeeCount: number
  defaultShift: string
  status: 'active' | 'inactive'
}

const search = ref('')
const deleteDialog = ref(false)
const deleteTarget = ref<Department | null>(null)

const departments: Department[] = [
  { id: 'dept-001', name: 'Nhân sự', manager: 'Trần Minh Anh', employeeCount: 12, defaultShift: 'Ca sáng', status: 'active' },
  { id: 'dept-002', name: 'Công nghệ', manager: 'Nguyễn Đức Dũng', employeeCount: 25, defaultShift: 'Ca sáng', status: 'active' },
  { id: 'dept-003', name: 'Tài chính', manager: 'Lê Hoài Nam', employeeCount: 8, defaultShift: 'Ca sáng', status: 'active' },
  { id: 'dept-004', name: 'Kinh doanh', manager: 'Phạm Thị Thủy', employeeCount: 30, defaultShift: 'Ca sáng', status: 'active' },
  { id: 'dept-005', name: 'Vận hành', manager: 'Ngô Phương Linh', employeeCount: 18, defaultShift: 'Ca chiều', status: 'active' },
  { id: 'dept-006', name: 'IT', manager: 'Võ Minh Khoa', employeeCount: 15, defaultShift: 'Ca sáng', status: 'inactive' },
  { id: 'dept-007', name: 'Hành chính', manager: 'Đỗ Thị Hằng', employeeCount: 10, defaultShift: 'Ca sáng', status: 'active' },
  { id: 'dept-008', name: 'Kế toán', manager: 'Bùi Quốc Tuấn', employeeCount: 10, defaultShift: 'Ca sáng', status: 'active' },
]

const avatarColors = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]

const getAvatarColor = (idx: number) => avatarColors[idx % avatarColors.length]

const handleDelete = (id: string | number) => {
  const dept = departments.find(d => d.id === String(id))
  if (dept) {
    deleteTarget.value = dept
    deleteDialog.value = true
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Phòng ban" description="Quản lý các phòng ban trong tổ chức">
      <template #actions>
        <button
          class="flex items-center gap-2 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors dark:shadow-none"
        >
          <Plus class="h-4 w-4" />
          Thêm phòng ban
        </button>
      </template>
    </PageHeader>

    <SearchToolbar v-model="search" placeholder="Tìm kiếm phòng ban, trưởng phòng..." />

    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800">
              <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Tên phòng ban</th>
              <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Trưởng phòng</th>
              <th class="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">Số NV</th>
              <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Ca mặc định</th>
              <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Trạng thái</th>
              <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="(dept, idx) in departments"
              :key="dept.id"
              class="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    :class="['flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold', getAvatarColor(idx)]"
                  >
                    {{ dept.name.charAt(0) }}
                  </div>
                  <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ dept.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ dept.manager }}</td>
              <td class="px-4 py-3 text-center">
                <span class="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {{ dept.employeeCount }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ dept.defaultShift }}</td>
              <td class="px-4 py-3">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                    dept.status === 'active'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-100 text-slate-500',
                  ]"
                >
                  {{ dept.status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <ActionDropdown
                  :item-id="dept.id"
                  :edit-to="`/departments/${dept.id}/edit`"
                  @delete="handleDelete"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <DeleteConfirmDialog
      :open="deleteDialog"
      title="Xóa phòng ban"
      description="Bạn có chắc chắn muốn xóa phòng ban này? Tất cả nhân viên trong phòng ban sẽ không bị ảnh hưởng."
      :item-name="deleteTarget?.name"
      @confirm="deleteDialog = false"
      @cancel="deleteDialog = false"
    />
  </div>
</template>
