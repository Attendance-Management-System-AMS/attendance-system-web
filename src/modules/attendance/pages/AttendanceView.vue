<script setup lang="ts">
import PageHeader from '@/shared/ui/PageHeader.vue'
import { ref, computed } from 'vue'
import { useAttendance } from '@/modules/attendance/composables/useAttendance'
import { useDepartments } from '@/modules/departments/composables/useDepartments'
import { Badge } from '@/shared/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import SearchToolbar from '@/shared/ui/SearchToolbar.vue'
import FilterSelect from '@/shared/ui/FilterSelect.vue'
import DataTable from '@/shared/ui/DataTable.vue'
import { Monitor, X } from 'lucide-vue-next'

const search = ref('')
const filterDept = ref('')
const filterStatus = ref('')
const { departmentsQuery } = useDepartments({ size: 200, sort: 'name', sortDir: 'asc' })

const attendanceFilters = computed(() => ({
  search: search.value,
  department: filterDept.value,
  status: filterStatus.value,
}))

const { attendanceQuery } = useAttendance(attendanceFilters)
const { data: records, isLoading } = attendanceQuery

const columns = [
  { key: 'employee', label: 'Nhân viên' },
  { key: 'checkIn', label: 'Giờ vào' },
  { key: 'checkOut', label: 'Giờ ra' },
  { key: 'status', label: 'Trạng thái' },
]

const departments = computed(
  () =>
    departmentsQuery.data.value?.content.map((department) => ({
      label: department.name,
      value: String(department.id),
    })) ?? [],
)

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
  { label: 'Chưa đủ công', value: 'INCOMPLETE' },
]

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

// --- Kiosk Device Connection ---
const showKioskDialog = ref(false)
const kioskUrl = computed(() => `${window.location.origin}/kiosk`)
const qrCodeUrl = computed(
  () => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(kioskUrl.value)}`
)

</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Chấm công hôm nay" description="Theo dõi tình trạng điểm danh trong ngày">
      <template #actions>
        <button @click="showKioskDialog = true"
          class="flex items-center gap-2 h-9 rounded-lg border border-border-standard bg-card px-3 text-sm font-medium text-secondary-text shadow-sm hover:bg-elevated hover:text-primary-text transition-colors">
          <Monitor class="h-4 w-4" />
          Kết nối thiết bị
        </button>
      </template>
    </PageHeader>

    <!-- Kiosk Connection Dialog -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="showKioskDialog"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          @click.self="showKioskDialog = false">
          <div class="w-full max-w-sm rounded-2xl border border-border-standard bg-card shadow-2xl overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-border">
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <router-link to="/kiosk" class="hover:opacity-80">
                    <Monitor class="h-5 w-5 text-primary" />
                  </router-link>
                </div>
                <div>
                  <p class="text-sm font-bold text-primary-text">Kết nối máy chấm công</p>
                  <p class="text-[10px] text-tertiary-text">Quét mã QR và đăng nhập tài khoản vận hành</p>
                </div>
              </div>
              <button @click="showKioskDialog = false"
                class="h-8 w-8 rounded-lg flex items-center justify-center text-tertiary-text hover:bg-elevated hover:text-primary-text transition-colors">
                <X class="h-4 w-4" />
              </button>
            </div>

            <!-- QR Code -->
            <div class="flex flex-col items-center gap-4 p-6">
              <div class="rounded-xl border border-border-standard p-3 bg-white">
                <img :src="qrCodeUrl" alt="Máy chấm công QR" class="h-48 w-48" />
              </div>
              <p class="text-xs text-secondary-text text-center">
                Thiết bị kiosk cần đăng nhập bằng tài khoản Admin, HR hoặc Quản lý trước khi dùng.
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <SearchToolbar v-model="search" placeholder="Tìm theo tên, mã nhân viên...">
      <template #filters>
        <FilterSelect v-model="filterDept" label="Phòng ban" :options="departments" />
        <FilterSelect v-model="filterStatus" label="Trạng thái" :options="statuses" />
      </template>
    </SearchToolbar>

    <div class="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <DataTable :columns="columns" :rows="records || []" :loading="isLoading">
        <template #cell-employee="{ row }">
          <div class="flex items-center gap-3">
            <Avatar class="size-9 h-9 w-9 border border-primary/20 dark:border-primary/20">
              <AvatarImage v-if="row.employee?.avatarUrl" :src="row.employee.avatarUrl" />
              <AvatarFallback class="bg-primary/10 text-primary text-[10px] font-bold">
                {{ getInitials(row.employee?.fullName) }}
              </AvatarFallback>
            </Avatar>
            <div>
              <p class="text-sm font-bold text-primary-text dark:text-primary-text">
                {{ row.employee?.fullName ?? '—' }}
              </p>
              <p class="text-[10px] text-tertiary-text font-bold  tracking-normal">
                {{ row.employee?.departmentName ?? '—' }}
              </p>
            </div>
          </div>
        </template>

        <template #cell-checkIn="{ value }">
          <code
            class="text-[11px] font-mono font-bold bg-muted dark:bg-elevated px-1.5 py-0.5 rounded text-secondary-text dark:text-tertiary-text">
                        {{ value || '—:—' }}
                    </code>
        </template>

        <template #cell-checkOut="{ value }">
          <code
            class="text-[11px] font-mono font-bold bg-muted dark:bg-elevated px-1.5 py-0.5 rounded text-secondary-text dark:text-tertiary-text">
                        {{ value || '—:—' }}
                    </code>
        </template>

        <template #cell-status="{ value }">
          <Badge :variant="value === 'Có mặt' ? 'default' : value === 'Đi muộn' ? 'outline' : 'secondary'"
            class="px-2.5 py-0.5 text-[10px] font-bold  tracking-normal border-none" :class="{
              'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30': value === 'Có mặt',
              'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/30': value === 'Đi muộn' || value === 'Muộn + về sớm',
              'bg-primary/10 text-primary hover:bg-primary/10 dark:bg-primary/10': value === 'Về sớm',
              'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30': value === 'Vắng mặt' || value === 'Thiếu checkout',
              'bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-950/30': value === 'Chưa đủ công',
              'bg-muted text-secondary-text hover:bg-muted dark:bg-elevated': value === 'Chưa chấm công' || value === 'Nghỉ phép' || value === 'Ngày lễ'
            }">
            {{ value }}
          </Badge>
        </template>
      </DataTable>
    </div>
  </div>
</template>
