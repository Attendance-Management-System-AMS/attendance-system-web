<script setup lang="ts">
import PageHeader from '@/shared/ui/PageHeader.vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { ArrowLeft, Pencil, ScanFace } from 'lucide-vue-next'
import { employeeApi } from '@/modules/employees/api/employee.api'
import { queryKeys } from '@/shared/lib/queryKeys'
import type { Employee } from '@/modules/employees/types/employee.types'

const route = useRoute()
const router = useRouter()

const employeeId = computed(() => Number(route.params.id))

const employeeQuery = useQuery<Employee>({
  queryKey: computed(() => queryKeys.employees.detail(employeeId.value)),
  queryFn: async () => {
    const response = await employeeApi.getById(employeeId.value)
    return response.data.result
  },
  enabled: computed(() => Number.isFinite(employeeId.value) && employeeId.value > 0),
  staleTime: 1000 * 60 * 3,
})

const employee = computed(() => employeeQuery.data.value)

const infoRows = computed(() => {
  const data = employee.value
  if (!data) return []

  return [
    { label: 'Mã nhân viên', value: data.employeeCode || '-' },
    { label: 'Giới tính', value: data.gender || '-' },
    { label: 'Email', value: data.email || '-' },
    { label: 'Phòng ban', value: data.departmentName || '-' },
    { label: 'Chức vụ', value: data.positionName || '-' },
    { label: 'Quản lý', value: data.managerName || '-' },
    { label: 'Ngày vào làm', value: data.joinDate || '-' },
    { label: 'Trạng thái', value: data.status || '-' },
    {
      label: 'Khuôn mặt (chấm công)',
      value: data.faceRegistered ? 'Đã đăng ký' : 'Chưa đăng ký',
    },
    { label: 'Ngày tạo', value: data.createdAt || '-' },
  ]
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :title="employee?.fullName || 'Chi tiết nhân viên'"
      description="Thông tin hồ sơ nhân viên"
    >
      <template #actions>
        <button
          @click="router.back()"
          class="flex items-center gap-2 h-10 rounded-lg border border-border-standard bg-card px-4 text-sm font-medium text-secondary-text shadow-sm hover:bg-surface transition-colors"
        >
          <ArrowLeft class="h-4 w-4" />
          Quay lại
        </button>
        <button
          v-if="employee"
          @click="router.push(`/employees/${employee.id}/register-face`)"
          class="flex items-center gap-2 h-10 rounded-lg border border-border-standard bg-card px-4 text-sm font-medium text-primary-text shadow-sm hover:bg-surface transition-colors dark:border-border dark:bg-card dark:text-primary-text dark:hover:bg-elevated"
        >
          <ScanFace class="h-4 w-4" />
          Khuôn mặt
        </button>
        <button
          v-if="employee"
          @click="router.push(`/employees/${employee.id}/edit`)"
          class="flex items-center gap-2 h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary transition-colors dark:shadow-none"
        >
          <Pencil class="h-4 w-4" />
          Chỉnh sửa
        </button>
      </template>
    </PageHeader>

    <div
      v-if="employeeQuery.isLoading.value"
      class="rounded-lg border border-border-standard bg-card p-6 text-sm text-secondary-text dark:border-border dark:bg-card"
    >
      Đang tải thông tin nhân viên...
    </div>

    <div
      v-else-if="employeeQuery.isError.value"
      class="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
    >
      <p>Không thể tải chi tiết nhân viên.</p>
      <button
        class="mt-3 text-primary underline hover:text-primary dark:text-primary"
        @click="employeeQuery.refetch()"
      >
        Thử lại
      </button>
    </div>

    <div
      v-else-if="employee"
      class="rounded-lg border border-border-standard bg-card shadow-sm dark:border-border dark:bg-card overflow-hidden"
    >
      <div class="border-b border-border-subtle px-6 py-4 dark:border-border">
        <p class="text-xs  tracking-normal text-tertiary-text">Nhân viên</p>
        <p class="mt-1 text-lg font-semibold text-primary-text dark:text-primary-text">
          {{ employee.fullName }}
        </p>
      </div>

      <div class="grid gap-0 sm:grid-cols-2">
        <div
          v-for="row in infoRows"
          :key="row.label"
          class="border-b border-border-subtle px-6 py-4 odd:bg-surface/50 dark:border-border dark:odd:bg-elevated/30"
        >
          <p class="text-[11px] font-bold  tracking-normal text-tertiary-text">
            {{ row.label }}
          </p>
          <p class="mt-1 text-sm text-primary-text dark:text-primary-text">{{ row.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
