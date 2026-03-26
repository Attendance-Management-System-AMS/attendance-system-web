<script setup lang="ts">
import { ref } from 'vue'
import { Bell, Camera, Mail, Phone, Shield, User } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import FormCard from '@/components/ui/FormCard.vue'

const inputClass =
  'h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5'

const notifyEmail = ref(true)
const notifyPush = ref(false)
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Hồ sơ cá nhân"
      description="Thông tin tài khoản và tùy chọn hiển thị trong TimeMaster AMS"
    />

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-1 space-y-4">
        <div
          class="rounded-2xl border border-slate-200 bg-linear-to-b from-white to-indigo-50/40 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-indigo-950/30"
        >
          <div class="flex flex-col items-center text-center">
            <div class="relative">
              <div
                class="flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-indigo-500/30"
              >
                AD
              </div>
              <button
                type="button"
                class="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl border border-white bg-white text-slate-600 shadow-md hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                title="Đổi ảnh đại diện"
                bg-linear-to-br
              >
                <Camera class="h-4 w-4" />
              </button>
            </div>
            <h2 class="mt-4 text-lg font-bold text-slate-900 dark:text-white">Admin System</h2>
            <p class="text-sm text-slate-500">Quản trị viên · TimeMaster</p>
            <div class="mt-4 flex flex-wrap justify-center gap-2">
              <span
                class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
              >
                Đang hoạt động
              </span>
              <span
                class="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-900/50 dark:text-violet-300"
              >
                MFA đã bật
              </span>
            </div>
          </div>
        </div>

        <div
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Liên hệ nhanh</h3>
          <ul class="mt-3 space-y-3 text-sm">
            <li class="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Mail class="h-4 w-4 shrink-0 text-indigo-500" />
              admin@timemaster.vn
            </li>
            <li class="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Phone class="h-4 w-4 shrink-0 text-teal-500" />
              +84 90 000 0000
            </li>
          </ul>
        </div>
      </div>

      <div class="lg:col-span-2 space-y-6">
        <FormCard title="Thông tin chung" :icon="User">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label :class="labelClass">Họ và tên</label>
              <input type="text" value="Admin System" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Email đăng nhập</label>
              <input type="email" value="admin@timemaster.vn" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Mã nhân viên</label>
              <input type="text" value="ADM001" :class="inputClass + ' font-mono'" readonly />
            </div>
          </div>
        </FormCard>

        <FormCard title="Thông báo" :icon="Bell">
          <div class="space-y-4">
            <label
              class="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <span class="text-sm font-medium text-slate-800 dark:text-slate-200"
                >Email khi có đơn nghỉ / duyệt</span
              >
              <input
                v-model="notifyEmail"
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
            </label>
            <label
              class="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <span class="text-sm font-medium text-slate-800 dark:text-slate-200"
                >Thông báo đẩy trên trình duyệt</span
              >
              <input
                v-model="notifyPush"
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
            </label>
          </div>
        </FormCard>

        <FormCard title="Bảo mật" :icon="Shield">
          <p class="mb-4 text-sm text-slate-600 dark:text-slate-400">
            Đổi mật khẩu định kỳ và kiểm tra thiết bị đăng nhập gần đây.
          </p>
          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              class="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700"
            >
              Đổi mật khẩu
            </button>
            <button
              type="button"
              class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Phiên đăng nhập
            </button>
          </div>
        </FormCard>
      </div>
    </div>
  </div>
</template>
