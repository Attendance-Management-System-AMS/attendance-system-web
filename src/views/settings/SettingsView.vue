<script setup lang="ts">
import { ref } from 'vue'
import { Globe, Moon, Monitor, Palette, Sparkles, Sun } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import FormCard from '@/components/ui/FormCard.vue'

const lang = ref<'vi' | 'en'>('vi')
const theme = ref<'light' | 'dark' | 'system'>('system')
const compactTables = ref(false)

const applyTheme = (t: 'light' | 'dark' | 'system') => {
  theme.value = t
  const root = document.documentElement
  if (t === 'dark') {
    root.classList.add('dark')
  } else if (t === 'light') {
    root.classList.remove('dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  }
}

</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Cài đặt"
      description="Ngôn ngữ, giao diện và hành vi hiển thị ứng dụng"
    />

    <div class="grid gap-6 lg:grid-cols-2">
      <FormCard title="Ngôn ngữ & khu vực" :icon="Globe">
        <div class="space-y-3">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Ngôn ngữ giao diện</label>
          <select
            v-model="lang"
            class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
          <p class="text-xs text-slate-500">Định dạng ngày giờ theo múi giờ Việt Nam (UTC+7).</p>
        </div>
      </FormCard>

      <FormCard title="Giao diện" :icon="Palette">
        <div class="grid grid-cols-3 gap-2">
          <button
            type="button"
            @click="applyTheme('light')"
            :class="[
              'flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-colors',
              theme === 'light'
                ? 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/40'
                : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800',
            ]"
          >
            <Sun class="h-5 w-5" />
            Sáng
          </button>
          <button
            type="button"
            @click="applyTheme('dark')"
            :class="[
              'flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-colors',
              theme === 'dark'
                ? 'border-indigo-400 bg-indigo-50 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200'
                : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800',
            ]"
          >
            <Moon class="h-5 w-5" />
            Tối
          </button>
          <button
            type="button"
            @click="applyTheme('system')"
            :class="[
              'flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-colors',
              theme === 'system'
                ? 'border-teal-400 bg-teal-50 text-teal-900 dark:bg-teal-950/40 dark:text-teal-200'
                : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800',
            ]"
          >
            <Monitor class="h-5 w-5" />
            Hệ thống
          </button>
        </div>
      </FormCard>

      <FormCard title="Bảng & danh sách" :icon="Sparkles">
        <label class="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
          <span class="text-sm font-medium text-slate-800 dark:text-slate-200">Chế độ bảng gọn (ít padding)</span>
          <input v-model="compactTables" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-indigo-600" />
        </label>
        <p class="mt-3 text-xs text-slate-500">Áp dụng cho danh sách nhân viên, chấm công và nghỉ phép.</p>
      </FormCard>
    </div>
  </div>
</template>
