<script setup lang="ts">
import FormCard from '@/shared/ui/FormCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { computed, ref } from 'vue'
import { Bell, Camera, Mail, Phone, Shield, User } from 'lucide-vue-next'
import { useAuth } from '@/modules/auth/composables/useAuth'

const { user } = useAuth()

const displayName = computed(() => user.value?.fullName || 'Người dùng')
const email = computed(() => user.value?.email || '')
const employeeCode = computed(() => user.value?.username?.toUpperCase() || 'NV000')
const initials = computed(() => {
  if (!user.value?.fullName) return '??'
  return user.value.fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(-2)
})

const roleLabel = computed(() => {
  const roles = user.value?.roles ?? []
  if (roles.includes('ROLE_ADMIN')) return 'Quản trị viên'
  if (roles.includes('ROLE_HR')) return 'Nhân sự'
  if (roles.includes('ROLE_MANAGER')) return 'Quản lý'
  if (roles.includes('ROLE_EMPLOYEE')) return 'Nhân viên'
  return 'Người dùng'
})

const inputClass =
  'h-10 w-full rounded-lg border border-border-standard bg-surface px-3 text-sm text-primary-text focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/40 dark:border-border dark:bg-elevated dark:text-primary-text'
const labelClass = 'block text-xs font-bold  tracking-normal text-secondary-text mb-1.5'

const notifyEmail = ref(true)
const notifyPush = ref(false)
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Hồ sơ cá nhân"
      description=""
    />

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-1 space-y-4">
        <div
          class="rounded-lg border border-border-standard bg-linear-to-b from-white to-indigo-50/40 p-6 shadow-sm dark:border-border dark:from-slate-900 dark:to-indigo-950/30"
        >
          <div class="flex flex-col items-center text-center">
            <div class="relative">
              <div
                class="flex h-24 w-24 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-indigo-700 text-2xl font-bold text-white shadow-lg shadow-primary/20"
              >
                {{ initials }}
              </div>
              <button
                type="button"
                class="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-lg border border-white bg-card text-secondary-text shadow-md hover:bg-surface dark:border-border dark:bg-elevated dark:text-tertiary-text"
                title="Đổi ảnh đại diện"
              >
                <Camera class="h-4 w-4" />
              </button>
            </div>
            <h2 class="mt-4 text-lg font-bold text-primary-text dark:text-primary-text">{{ displayName }}</h2>
            <p class="text-sm text-secondary-text">{{ roleLabel }} · TimeMaster</p>
            <div class="mt-4 flex flex-wrap justify-center gap-2">
              <span
                class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
              >
                Đang hoạt động
              </span>
              <span
                class="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:bg-primary/10 dark:text-primary"
              >
                MFA đã bật
              </span>
            </div>
          </div>
        </div>

        <div
          class="rounded-lg border border-border-standard bg-card p-5 shadow-sm dark:border-border dark:bg-card"
        >
          <h3 class="text-xs font-bold  tracking-normal text-tertiary-text">Liên hệ nhanh</h3>
          <ul class="mt-3 space-y-3 text-sm">
            <li class="flex items-center gap-3 text-secondary-text dark:text-tertiary-text">
              <Mail class="h-4 w-4 shrink-0 text-primary" />
              {{ email }}
            </li>
            <li class="flex items-center gap-3 text-secondary-text dark:text-tertiary-text">
              <Phone class="h-4 w-4 shrink-0 text-primary" />
              Chưa cập nhật SĐT
            </li>
          </ul>
        </div>
      </div>

      <div class="lg:col-span-2 space-y-6">
        <FormCard title="Thông tin chung" :icon="User">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label :class="labelClass">Họ và tên</label>
              <input type="text" :value="displayName" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Email đăng nhập</label>
              <input type="email" :value="email" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Mã nhân viên</label>
              <input
                type="text"
                :value="employeeCode"
                :class="inputClass + ' font-mono'"
                readonly
              />
            </div>
          </div>
        </FormCard>

        <FormCard title="Thông báo" :icon="Bell">
          <div class="space-y-4">
            <label
              class="flex cursor-pointer items-center justify-between rounded-lg border border-border-subtle bg-surface/80 px-4 py-3 dark:border-border dark:bg-elevated/50"
            >
              <span class="text-sm font-medium text-primary-text dark:text-primary-text"
                >Email khi có đơn nghỉ / duyệt</span
              >
              <input
                v-model="notifyEmail"
                type="checkbox"
                class="h-4 w-4 rounded border-border-standard text-primary"
              />
            </label>
            <label
              class="flex cursor-pointer items-center justify-between rounded-lg border border-border-subtle bg-surface/80 px-4 py-3 dark:border-border dark:bg-elevated/50"
            >
              <span class="text-sm font-medium text-primary-text dark:text-primary-text"
                >Thông báo đẩy trên trình duyệt</span
              >
              <input
                v-model="notifyPush"
                type="checkbox"
                class="h-4 w-4 rounded border-border-standard text-primary"
              />
            </label>
          </div>
        </FormCard>

        <FormCard title="Bảo mật" :icon="Shield">
          <p class="mb-4 text-sm text-secondary-text dark:text-tertiary-text">
            Đổi mật khẩu định kỳ và kiểm tra thiết bị đăng nhập gần đây.
          </p>
          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              class="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary"
            >
              Đổi mật khẩu
            </button>
            <button
              type="button"
              class="rounded-lg border border-border-standard bg-card px-4 py-2.5 text-sm font-medium text-primary-text hover:bg-surface dark:border-border dark:bg-elevated dark:text-primary-text"
            >
              Phiên đăng nhập
            </button>
          </div>
        </FormCard>
      </div>
    </div>
  </div>
</template>
