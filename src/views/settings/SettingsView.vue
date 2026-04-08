<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import { ref } from 'vue'
import { Globe, Moon, Monitor, Palette, Sparkles, Sun } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
      <!-- Language Settings -->
      <Card class="border-border shadow-none overflow-hidden">
        <CardHeader class="border-b bg-slate-50/30 py-4 flex flex-row items-center gap-3">
          <div class="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
            <Globe class="h-4 w-4" />
          </div>
          <CardTitle class="text-[10px] font-black uppercase tracking-widest text-slate-500">Ngôn ngữ & Khu vực</CardTitle>
        </CardHeader>
        <CardContent class="pt-6 space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Ngôn ngữ hiển thị</label>
            <select
              v-model="lang"
              class="h-10 w-full rounded-xl border border-border bg-slate-50 dark:bg-slate-900 px-3 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            >
              <option value="vi">Tiếng Việt (VN)</option>
              <option value="en">English (US)</option>
            </select>
          </div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Múi giờ hiện tại: UTC+7 (Băng Cốc, Hà Nội, Jakarta)</p>
        </CardContent>
      </Card>

      <!-- Theme Settings -->
      <Card class="border-border shadow-none overflow-hidden">
        <CardHeader class="border-b bg-slate-50/30 py-4 flex flex-row items-center gap-3">
          <div class="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
            <Palette class="h-4 w-4" />
          </div>
          <CardTitle class="text-[10px] font-black uppercase tracking-widest text-slate-500">Giao diện ứng dụng</CardTitle>
        </CardHeader>
        <CardContent class="pt-6">
           <div class="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              @click="applyTheme('light')"
              :class="[
                'h-auto flex-col gap-2 py-4 rounded-xl border-2 transition-all',
                theme === 'light' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-900/20' : 'border-border'
              ]"
            >
              <Sun class="h-5 w-5" />
              <span class="text-[10px] font-black uppercase tracking-widest">Sáng</span>
            </Button>
            
            <Button
              variant="outline"
              @click="applyTheme('dark')"
              :class="[
                'h-auto flex-col gap-2 py-4 rounded-xl border-2 transition-all',
                theme === 'dark' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-900/20' : 'border-border'
              ]"
            >
              <Moon class="h-5 w-5" />
              <span class="text-[10px] font-black uppercase tracking-widest">Tối</span>
            </Button>

            <Button
              variant="outline"
              @click="applyTheme('system')"
              :class="[
                'h-auto flex-col gap-2 py-4 rounded-xl border-2 transition-all',
                theme === 'system' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-900/20' : 'border-border'
              ]"
            >
              <Monitor class="h-5 w-5" />
              <span class="text-[10px] font-black uppercase tracking-widest">Hệ thống</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Display behavior -->
      <Card class="border-border shadow-none overflow-hidden lg:col-span-2">
        <CardHeader class="border-b bg-slate-50/30 py-4 flex flex-row items-center gap-3">
          <div class="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
            <Sparkles class="h-4 w-4" />
          </div>
          <CardTitle class="text-[10px] font-black uppercase tracking-widest text-slate-500">Hiển thị & Hành vi</CardTitle>
        </CardHeader>
        <CardContent class="pt-6">
          <label class="flex items-center justify-between p-4 rounded-xl border border-dashed border-border bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer hover:border-indigo-200 transition-colors">
            <div class="space-y-0.5">
              <p class="text-sm font-bold text-slate-700 dark:text-slate-200">Chế độ bảng gọn</p>
              <p class="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Giảm khoảng cách padding trong tất cả các bảng dữ liệu</p>
            </div>
            <input v-model="compactTables" type="checkbox" class="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500" />
          </label>
        </CardContent>
      </Card>
    </div>

    <div class="text-center pt-10">
        <p class="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">TimeMaster Professional v1.0.4</p>
    </div>
  </div>
</template>
