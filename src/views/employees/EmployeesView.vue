<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Plus, Users } from 'lucide-vue-next'
import { useEmployees } from '@/composables/useEmployees'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchToolbar from '@/components/ui/SearchToolbar.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import ActionDropdown from '@/components/ui/ActionDropdown.vue'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'
import type { Employee } from '@/types/employee'

const { employeesQuery, deleteEmployee } = useEmployees()
const { data: employeesRaw, isLoading, isError, error } = employeesQuery
const employees = computed(() => employeesRaw.value ?? [])

const search = ref('')
const filterDept = ref('')
const filterShift = ref('')
const deleteDialog = ref(false)
const deleteTarget = ref<Employee | null>(null)

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

const avatarColors = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-slate-200 text-slate-700',
]

const getAvatarColor = (idx: number) => avatarColors[idx % avatarColors.length]

const handleDelete = (id: string | number) => {
  const emp = employees.value.find(e => e.id === String(id))
  if (emp) {
    deleteTarget.value = emp
    deleteDialog.value = true
  }
}

const confirmDelete = () => {
  if (deleteTarget.value) {
    deleteEmployee.mutate(deleteTarget.value.id)
  }
  deleteDialog.value = false
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Danh sách nhân viên" description="Quản lý toàn bộ nhân viên trong hệ thống">
      <template #actions>
        <RouterLink to="/employees/new"
          class="flex items-center gap-2 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors dark:shadow-none">
          <Plus class="h-4 w-4" />
          Thêm nhân viên
        </RouterLink>
      </template>
    </PageHeader>

    <!-- Summary chips -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
        <Users class="h-4 w-4 text-slate-400" />
        <span class="text-sm font-semibold text-slate-900">{{ employees.length }} nhân viên</span>
      </div>
      <div class="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
        <span class="text-sm font-semibold text-emerald-700">{{employees.filter(e => e.status === 'active').length}}
          đang
          hoạt động</span>
      </div>
    </div>

    <!-- Toolbar -->
    <SearchToolbar v-model="search" placeholder="Tìm theo tên, mã NV, email...">
      <template #filters>
        <FilterSelect v-model="filterDept" label="Phòng ban" :options="departments" />
        <FilterSelect v-model="filterShift" label="Ca" :options="shifts" />
      </template>
    </SearchToolbar>

    <!-- Table -->
    <div v-if="isLoading" class="text-center py-12 text-slate-500 dark:text-slate-400">
      Đang tải danh sách nhân viên...
    </div>

    <div v-else-if="isError" class="text-center py-12 text-red-600 dark:text-red-400">
      Lỗi: {{ (error as Error)?.message || 'Không thể tải dữ liệu' }}
      <button class="ml-4 text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400"
        @click="() => employeesQuery.refetch()">
        Thử lại
      </button>
    </div>

    <div v-else
      class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800">
              <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Nhân viên
              </th>
              <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Mã NV</th>
              <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Phòng ban
              </th>
              <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Ca làm việc
              </th>
              <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Ngày vào làm
              </th>
              <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Trạng thái
              </th>
              <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Hành động
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="(emp, idx) in employees" :key="emp.id"
              class="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    :class="['flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold', getAvatarColor(idx)]">
                    {{ emp.initials }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ emp.name }}</p>
                    <p class="text-xs text-slate-400">{{ emp.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 font-mono text-sm text-slate-600 dark:text-slate-300">{{ emp.empCode }}</td>
              <td class="px-4 py-3">
                <p class="text-xs text-slate-400">{{ emp.role }}</p>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ emp.shift }}</td>
              <td class="px-4 py-3 text-sm text-slate-500">{{ emp.joinDate }}</td>
              <td class="px-4 py-3">
                <span :class="[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                  emp.status === 'active'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-100 text-slate-500',
                ]">
                  {{ emp.status === 'active' ? 'Đang làm' : 'Nghỉ việc' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <ActionDropdown :item-id="emp.id" :edit-to="`/employees/${emp.id}/edit`"
                  :view-to="`/employees/${emp.id}`" @delete="handleDelete" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <DeleteConfirmDialog :open="deleteDialog" title="Xóa nhân viên"
      description="Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống không?" :item-name="deleteTarget?.name"
      @confirm="confirmDelete" @cancel="deleteDialog = false" />
  </div>
</template>
