<script setup lang="ts">
import PageHeader from '@/shared/ui/PageHeader.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import {
  ArrowLeft,
  Building2,
  Pencil,
  ScanFace,
  ShieldCheck,
  UserRound,
} from 'lucide-vue-next'
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

const genderLabels: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
}

const getInitials = (fullName?: string | null) => {
  if (!fullName) return '??'

  const names = fullName.trim().split(/\s+/).filter(Boolean)
  if (!names.length) return '??'

  return names.length > 1
    ? `${names[0]?.charAt(0) ?? ''}${names[names.length - 1]?.charAt(0) ?? ''}`.toUpperCase()
    : (names[0]?.charAt(0) ?? '').toUpperCase()
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Chưa cập nhật'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Chưa cập nhật'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const getGenderLabel = (value?: string | null) => {
  if (!value) return 'Chưa cập nhật'
  return genderLabels[value] ?? value
}

const getStatusLabel = (value?: string | null) => {
  switch ((value ?? '').toUpperCase()) {
    case 'ACTIVE':
      return 'Đang làm việc'
    case 'INACTIVE':
      return 'Ngưng hoạt động'
    default:
      return value || 'Chưa cập nhật'
  }
}

const statusBadgeClass = computed(() => {
  return (employee.value?.status ?? '').toUpperCase() === 'ACTIVE'
    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300'
    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300'
})

const faceBadgeClass = computed(() => {
  return employee.value?.faceRegistered
    ? 'bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/30 dark:text-sky-300'
    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300'
})

const personalRows = computed(() => {
  const data = employee.value
  if (!data) return []

  return [
    { label: 'Giới tính', value: getGenderLabel(data.gender) },
    { label: 'Email công việc', value: data.email || 'Chưa cập nhật' },
  ]
})

const workRows = computed(() => {
  const data = employee.value
  if (!data) return []

  return [
    { label: 'Phòng ban', value: data.departmentName || 'Chưa phân bổ' },
    { label: 'Chức vụ', value: data.positionName || 'Chưa gán chức vụ' },
    { label: 'Quản lý trực tiếp', value: data.managerName || 'Chưa chỉ định' },
    { label: 'Ngày vào làm', value: formatDate(data.joinDate) },
  ]
})

const systemRows = computed(() => {
  const data = employee.value
  if (!data) return []

  return [
    { label: 'Trạng thái hồ sơ', value: getStatusLabel(data.status) },
    { label: 'Ngày tạo hồ sơ', value: formatDateTime(data.createdAt) },
  ]
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :title="employee?.fullName || 'Chi tiết nhân viên'"
      description="Theo dõi hồ sơ, thông tin công việc và trạng thái chấm công của nhân viên."
    >
      <template #actions>
        <button
          @click="router.back()"
          class="flex h-10 items-center gap-2 rounded-lg border border-border-standard bg-card px-4 text-sm font-medium text-secondary-text shadow-sm transition-colors hover:bg-surface"
        >
          <ArrowLeft class="h-4 w-4" />
          Quay lại
        </button>
        <button
          v-if="employee"
          @click="router.push(`/employees/${employee.id}/register-face`)"
          class="flex h-10 items-center gap-2 rounded-lg border border-border-standard bg-card px-4 text-sm font-medium text-primary-text shadow-sm transition-colors hover:bg-surface dark:border-border dark:bg-card dark:text-primary-text dark:hover:bg-elevated"
        >
          <ScanFace class="h-4 w-4" />
          Khuôn mặt
        </button>
        <button
          v-if="employee"
          @click="router.push(`/employees/${employee.id}/edit`)"
          class="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary dark:shadow-none"
        >
          <Pencil class="h-4 w-4" />
          Chỉnh sửa
        </button>
      </template>
    </PageHeader>

    <div
      v-if="employeeQuery.isLoading.value"
      class="rounded-xl border border-border-standard bg-card p-6 text-sm text-secondary-text shadow-sm dark:border-border dark:bg-card"
    >
      Đang tải thông tin nhân viên...
    </div>

    <div
      v-else-if="employeeQuery.isError.value"
      class="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
    >
      <p>Không thể tải chi tiết nhân viên.</p>
      <button
        class="mt-3 text-primary underline transition-colors hover:text-primary"
        @click="employeeQuery.refetch()"
      >
        Thử lại
      </button>
    </div>

    <div v-else-if="employee" class="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_320px]">
      <div class="space-y-6">
        <section
          class="overflow-hidden rounded-xl border border-border-standard bg-card shadow-sm dark:border-border dark:bg-card"
        >
          <div class="relative p-6">
            <div class="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent"></div>

            <div class="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div class="flex items-start gap-4">
                <Avatar class="h-16 w-16 border border-primary/20 shadow-sm dark:border-primary/25">
                  <AvatarImage :src="employee.avatarUrl || `/api/avatar/${employee.id}`" />
                  <AvatarFallback class="bg-primary/10 text-sm font-bold text-primary">
                    {{ getInitials(employee.fullName) }}
                  </AvatarFallback>
                </Avatar>

                <div class="space-y-2">
                  <div>
                    <p class="text-xs font-semibold text-tertiary-text">Hồ sơ nhân viên</p>
                    <h2 class="mt-1 text-2xl font-semibold tracking-normal text-primary-text">
                      {{ employee.fullName }}
                    </h2>
                  </div>

                  <div class="flex flex-wrap items-center gap-2">
                    <code
                      class="rounded-md border border-border-subtle bg-surface px-2.5 py-1 font-mono text-xs font-semibold text-secondary-text dark:border-border dark:bg-elevated"
                    >
                      {{ employee.employeeCode }}
                    </code>
                    <Badge class="border-0" :class="statusBadgeClass">
                      {{ getStatusLabel(employee.status) }}
                    </Badge>
                    <Badge class="border-0" :class="faceBadgeClass">
                      {{ employee.faceRegistered ? 'Đã đăng ký khuôn mặt' : 'Chưa đăng ký khuôn mặt' }}
                    </Badge>
                  </div>

                  <p class="text-sm leading-6 text-secondary-text">
                    {{ employee.departmentName || 'Chưa phân bổ phòng ban' }}
                    <span class="text-tertiary-text">•</span>
                    {{ employee.positionName || 'Chưa gán chức vụ' }}
                  </p>
                </div>
              </div>

              <div class="rounded-xl border border-border-standard bg-surface/70 px-4 py-3 dark:border-border dark:bg-elevated/70">
                <p class="text-xs font-semibold text-tertiary-text">Quản lý trực tiếp</p>
                <p class="mt-1 text-sm font-semibold text-primary-text">
                  {{ employee.managerName || 'Chưa chỉ định quản lý' }}
                </p>
              </div>
            </div>

          </div>
        </section>

        <div class="grid gap-6 lg:grid-cols-2">
          <section
            class="rounded-xl border border-border-standard bg-card p-5 shadow-sm dark:border-border dark:bg-card"
          >
            <div class="flex items-start gap-3">
              <div class="rounded-lg bg-primary/10 p-2 text-primary">
                <UserRound class="h-4 w-4" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-primary-text">Thông tin cá nhân</h3>
                <p class="mt-1 text-sm text-secondary-text">
                  Các thông tin nhận diện và liên hệ nội bộ của nhân viên.
                </p>
              </div>
            </div>

            <div class="mt-5 space-y-3">
              <div
                v-for="row in personalRows"
                :key="row.label"
                class="rounded-lg border border-border-standard bg-surface/60 px-4 py-3 dark:border-border dark:bg-elevated/50"
              >
                <p class="text-xs font-semibold text-tertiary-text">{{ row.label }}</p>
                <p class="mt-1 text-sm font-medium text-primary-text break-words">{{ row.value }}</p>
              </div>
            </div>
          </section>

          <section
            class="rounded-xl border border-border-standard bg-card p-5 shadow-sm dark:border-border dark:bg-card"
          >
            <div class="flex items-start gap-3">
              <div class="rounded-lg bg-primary/10 p-2 text-primary">
                <Building2 class="h-4 w-4" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-primary-text">Thông tin công việc</h3>
                <p class="mt-1 text-sm text-secondary-text">
                  Cấu hình tổ chức và các mốc công việc đang áp dụng.
                </p>
              </div>
            </div>

            <div class="mt-5 space-y-3">
              <div
                v-for="row in workRows"
                :key="row.label"
                class="rounded-lg border border-border-standard bg-surface/60 px-4 py-3 dark:border-border dark:bg-elevated/50"
              >
                <p class="text-xs font-semibold text-tertiary-text">{{ row.label }}</p>
                <p class="mt-1 text-sm font-medium text-primary-text">{{ row.value }}</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div class="space-y-6 self-start xl:sticky xl:top-6">
        <section
          class="rounded-xl border border-border-standard bg-card p-5 shadow-sm dark:border-border dark:bg-card"
        >
          <div class="flex items-start gap-3">
            <div class="rounded-lg bg-primary/10 p-2 text-primary">
              <ShieldCheck class="h-4 w-4" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-primary-text">Trạng thái hồ sơ</h3>
              <p class="mt-1 text-sm text-secondary-text">
                Theo dõi nhanh tình trạng sử dụng và khả năng chấm công của nhân viên.
              </p>
            </div>
          </div>

          <div class="mt-5 space-y-3">
            <div
              v-for="row in systemRows"
              :key="row.label"
              class="rounded-lg border border-border-standard bg-surface/70 px-4 py-3 dark:border-border dark:bg-elevated/60"
            >
              <p class="text-xs font-semibold text-tertiary-text">{{ row.label }}</p>
              <p class="mt-1 text-sm font-medium text-primary-text">{{ row.value }}</p>
            </div>
          </div>
        </section>

        <section
          class="rounded-xl border border-border-standard bg-card p-5 shadow-sm dark:border-border dark:bg-card"
        >
          <div class="flex items-start gap-3">
            <div class="rounded-lg bg-primary/10 p-2 text-primary">
              <ScanFace class="h-4 w-4" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-primary-text">Khuôn mặt chấm công</h3>
              <p class="mt-1 text-sm text-secondary-text">
                {{ employee.faceRegistered
                  ? 'Dữ liệu khuôn mặt đã sẵn sàng cho kiosk chấm công.'
                  : 'Nhân viên chưa có dữ liệu khuôn mặt. Nên đăng ký trước khi sử dụng kiosk.' }}
              </p>
            </div>
          </div>

          <button
            @click="router.push(`/employees/${employee.id}/register-face`)"
            class="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-border-standard bg-surface px-4 py-3 text-sm font-semibold text-primary-text transition-colors hover:bg-elevated dark:border-border dark:bg-elevated dark:hover:bg-surface"
          >
            <ScanFace class="h-4 w-4" />
            {{ employee.faceRegistered ? 'Cập nhật khuôn mặt' : 'Đăng ký khuôn mặt' }}
          </button>
        </section>

      </div>
    </div>
  </div>
</template>
