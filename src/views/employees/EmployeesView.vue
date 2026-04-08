<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useDebounceFn } from '@vueuse/core'
import { useEmployees } from '@/composables/useEmployees'
import { useDepartments } from '@/composables/useDepartments'
import { usePositions } from '@/composables/usePositions'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchToolbar from '@/components/ui/SearchToolbar.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import ActionDropdown from '@/components/ui/ActionDropdown.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Pagination from '@/components/ui/Pagination.vue'
import DataTable from '@/components/ui/DataTable.vue'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'
import { toast } from 'vue-sonner'
import type { Employee } from '@/types/employee'

const search = ref('')
const debouncedSearch = ref('')
const filterDept = ref<string>('')
const filterPos = ref<string>('')
const filterStatus = ref<string>('')

const currentPage = ref(0)
const pageSize = ref(15)

const updateDebounced = useDebounceFn((val: string) => {
  debouncedSearch.value = val
  currentPage.value = 0 
}, 500)

watch([filterDept, filterPos, filterStatus], () => {
  currentPage.value = 0 
})

watch(search, updateDebounced)

const { employeesQuery, deleteEmployee } = useEmployees({
  keyword: debouncedSearch,
  departmentId: filterDept,
  positionId: filterPos,
  status: filterStatus,
  page: currentPage,
  size: pageSize,
})
const { data: employeesRaw, isLoading } = employeesQuery

const { departmentsQuery } = useDepartments()
const { positionsQuery } = usePositions()

const departmentsOptions = computed(() => {
  return (departmentsQuery.data.value?.content ?? []).map(d => ({
    label: d.name,
    value: String(d.id),
  }))
})

const positionsOptions = computed(() => {
  const data = positionsQuery.data.value
  if (!Array.isArray(data)) return []
  return data.map(p => ({
    label: p.name,
    value: String(p.id),
  }))
})

const statusOptions = [
  { label: 'Đang làm việc', value: 'ACTIVE' },
  { label: 'Nghỉ việc', value: 'INACTIVE' },
]

const getInitials = (fullName: string | null | undefined) => {
  if (!fullName) return '??'
  const names = fullName.trim().split(/\s+/)
  if (names.length === 0 || (names.length === 1 && names[0] === '')) return '??'
  
  return names.length >= 2 
    ? ((names[0]?.charAt(0) || '') + (names[names.length - 1]?.charAt(0) || '')).toUpperCase()
    : (names[0]?.charAt(0) || '').toUpperCase()
}

const columns = [
  { key: 'employee', label: 'Nhân viên' },
  { key: 'employeeCode', label: 'Mã NV' },
  { key: 'department', label: 'Phòng ban / Chức vụ' },
  { key: 'shift', label: 'Ca làm việc' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: 'Hành động', align: 'right' as const },
]

const filteredEmployees = computed(() => employeesRaw.value?.content ?? [])
const totalElements = computed(() => employeesRaw.value?.totalElements ?? 0)
const totalPages = computed(() => employeesRaw.value?.totalPages ?? 0)

const deleteTarget = ref<Employee | null>(null)
const isAlertOpen = ref(false)

const handleDelete = (id: string | number) => {
  const emp = filteredEmployees.value.find(e => e.id === Number(id))
  if (emp) {
    deleteTarget.value = emp
    isAlertOpen.value = true
  }
}

const confirmDelete = () => {
  if (deleteTarget.value) {
    deleteEmployee.mutate(deleteTarget.value.id, {
      onSuccess: () => {
        toast.success(`Đã xóa nhân viên ${deleteTarget.value?.fullName} thành công`)
        isAlertOpen.value = false
        deleteTarget.value = null
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi xóa nhân viên')
      }
    })
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Danh sách nhân viên" description="Quản lý toàn bộ nhân viên trong hệ thống">
      <template #actions>
        <Button as-child class="gap-2 shadow-lg shadow-indigo-200 dark:shadow-none bg-indigo-600 hover:bg-indigo-700">
          <RouterLink to="/employees/new">
            <Plus class="h-4 w-4" />
            Thêm nhân viên
          </RouterLink>
        </Button>
      </template>
    </PageHeader>

    <SearchToolbar v-model="search" placeholder="Tìm theo tên, mã NV, email...">
      <template #filters>
        <FilterSelect v-model="filterDept" label="Phòng ban" :options="departmentsOptions" />
        <FilterSelect v-model="filterPos" label="Chức vụ" :options="positionsOptions" />
        <FilterSelect v-model="filterStatus" label="Trạng thái" :options="statusOptions" />
      </template>
    </SearchToolbar>

    <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <DataTable 
        :columns="columns" 
        :rows="filteredEmployees" 
        :loading="isLoading"
      >
        <!-- Employee Column -->
        <template #cell-employee="{ row }">
          <div class="flex items-center gap-3">
            <Avatar class="size-9 h-9 w-9 border border-indigo-50 dark:border-indigo-900/50">
              <AvatarImage :src="`/api/avatar/${row.id}`" />
              <AvatarFallback class="bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                {{ getInitials(row.fullName) }}
              </AvatarFallback>
            </Avatar>
            <div>
              <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ row.fullName }}</p>
              <p class="text-[10px] text-slate-400 font-medium">{{ row.email }}</p>
            </div>
          </div>
        </template>

        <!-- Code Column -->
        <template #cell-employeeCode="{ value }">
          <code class="text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
            {{ value }}
          </code>
        </template>

        <!-- Department/Position Column -->
        <template #cell-department="{ row }">
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ row.departmentName || '—' }}</p>
          <p class="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{{ row.positionName || '—' }}</p>
        </template>

        <!-- Status Column -->
        <template #cell-status="{ value }">
          <Badge
            :variant="String(value).toLowerCase() === 'active' ? 'default' : 'secondary'"
            class="px-2.5 py-0.5 text-[10px] font-bold border-none"
            :class="String(value).toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30' : ''"
          >
            {{ String(value).toLowerCase() === 'active' ? 'Đang làm' : 'Nghỉ việc' }}
          </Badge>
        </template>

        <!-- Actions Column -->
        <template #cell-actions="{ row }">
          <ActionDropdown 
            :item-id="row.id" 
            :view-to="`/employees/${row.id}`"
            :edit-to="`/employees/${row.id}/edit`" 
            @delete="handleDelete" 
          />
        </template>
      </DataTable>

      <Pagination
        v-model="currentPage"
        :total-pages="totalPages"
        :total-elements="totalElements"
        :page-size="pageSize"
        label="nhân viên"
      />
    </div>

    <DeleteConfirmDialog 
      :open="isAlertOpen" 
      title="Xác nhận xóa nhân viên" 
      description="Dữ liệu hồ sơ và thông tin liên quan của nhân viên này sẽ bị gỡ bỏ."
      :item-name="deleteTarget?.fullName"
      @confirm="confirmDelete"
      @cancel="isAlertOpen = false"
    />
  </div>
</template>
