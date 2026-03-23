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
const search = ref('')
const filterDept = ref('')
const filterShift = ref('')
const deleteDialog = ref(false)
const deleteTarget = ref<Employee | null>(null)

const departments = [
  { label: 'Phòng Công nghệ', value: 'Phòng Công nghệ' },
  { label: 'Phòng Nhân sự', value: 'Phòng Nhân sự' },
  { label: 'Tài chính', value: 'Tài chính' },
  { label: 'Kinh doanh', value: 'Kinh doanh' },
  { label: 'Vận hành', value: 'Vận hành' },
]

const shifts = [
  { label: 'Ca sáng', value: 'Ca sáng' },
  { label: 'Ca chiều', value: 'Ca chiều' },
  { label: 'Ca đêm', value: 'Ca đêm' },
  { label: 'Hành chính', value: 'Hành chính' },
]

const avatarColors = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-slate-200 text-slate-700',
]

const getAvatarColor = (idx: number) => avatarColors[idx % avatarColors.length]

const getInitials = (fullName: string | null | undefined) => {
  if (!fullName) return '??'
  const names = fullName.trim().split(/\s+/)
  const first = names[0]
  if (!first) return '??'

  if (names.length === 1) return first.charAt(0).toUpperCase()

  const last = names[names.length - 1]
  if (!last) return first.charAt(0).toUpperCase()

  return (first.charAt(0) + last.charAt(0)).toUpperCase()
}

const filteredEmployees = computed(() => {
  const data = employeesRaw.value
  let result = Array.isArray(data) ? data : []

  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(e =>
      e.fullName?.toLowerCase().includes(s) ||
      e.employeeCode?.toLowerCase().includes(s) ||
      e.email?.toLowerCase().includes(s)
    )
  }

  if (filterDept.value) {
    result = result.filter(e => e.departmentName === filterDept.value)
  }

  if (filterShift.value) {
    result = result.filter(e => e.shift === filterShift.value)
  }

  return result
})

const handleDelete = (id: string | number) => {
  const emp = (employeesRaw.value ?? []).find(e => e.id === Number(id))
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
      <div
        class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Users class="h-4 w-4 text-slate-400" />
        <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ filteredEmployees.length }} nhân
          viên</span>
      </div>
      <div class="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
        <span class="text-sm font-semibold text-emerald-700">
          {{filteredEmployees.filter(e => e.status?.toLowerCase() === 'active').length}} đang hoạt động
        </span>
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
    <div
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
            <tr v-if="isLoading">
              <td colspan="7" class="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                Đang tải danh sách nhân viên...
              </td>
            </tr>
            <tr v-else-if="isError">
              <td colspan="7" class="px-4 py-12 text-center text-red-600 dark:text-red-400">
                Lỗi: {{ (error as Error)?.message || 'Không thể tải dữ liệu' }}
                <button class="ml-4 text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400"
                  @click="() => employeesQuery.refetch()">
                  Thử lại
                </button>
              </td>
            </tr>
            <tr v-else-if="filteredEmployees.length === 0">
              <td colspan="7" class="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                Không có nhân viên nào
              </td>
            </tr>
            <tr v-else v-for="(emp, idx) in filteredEmployees" :key="emp.id"
              class="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    :class="['flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold', getAvatarColor(idx)]">
                    {{ getInitials(emp.fullName) }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ emp.fullName }}</p>
                    <p class="text-xs text-slate-400">{{ emp.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 font-mono text-sm text-slate-600 dark:text-slate-300">{{ emp.employeeCode }}</td>
              <td class="px-4 py-3">
                <p class="text-sm text-slate-600 dark:text-slate-300">{{ emp.departmentName || '-' }}</p>
                <p class="text-[10px] text-slate-400 uppercase tracking-tight">{{ emp.positionName }}</p>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ emp.shift || 'Hành chính' }}</td>
              <td class="px-4 py-3 text-sm text-slate-500">{{ emp.joinDate }}</td>
              <td class="px-4 py-3">
                <span :class="[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                  emp.status?.toLowerCase() === 'active'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-100 text-slate-500',
                ]">
                  {{ emp.status?.toLowerCase() === 'active' ? 'Đang làm' : 'Nghỉ việc' }}
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
      description="Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống không?" :item-name="deleteTarget?.fullName"
      @confirm="confirmDelete" @cancel="deleteDialog = false" />
  </div>
</template>
