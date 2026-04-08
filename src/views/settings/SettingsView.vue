<script setup lang="ts">
import { ref } from 'vue'
import { Globe, Moon, Monitor, Palette, Sparkles, Sun, LayoutPanelLeft } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ThemeColorPicker from '@/components/ui/ThemeColorPicker.vue'

const lang = ref<'vi' | 'en'>('vi')
const theme = ref<'light' | 'dark' | 'system'>('system')
const compactTables = ref(false)

const applyDarkMode = (t: 'light' | 'dark' | 'system') => {
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
  <div class="p-4 sm:p-6 space-y-6">
    <div class="border-b border-primary/10 pb-6">
      <h1 class="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Cài đặt</h1>
      <p class="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Cấu hình cá nhân và trải nghiệm hệ thống</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Theme Color Selection -->
      <Card class="border-primary/10 shadow-none overflow-hidden lg:col-span-2">
        <CardHeader class="border-b bg-white py-4 flex flex-row items-center gap-3">
          <div
            class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
          >
            <LayoutPanelLeft class="h-4 w-4" />
          </div>
          <CardTitle class="text-[10px] font-black uppercase tracking-widest text-slate-500"
            >Màu sắc thương hiệu</CardTitle
          >
        </CardHeader>
        <CardContent class="pt-6">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-4 px-1">
            Chọn màu sắc chủ đạo cho toàn bộ hệ thống
          </p>
          <ThemeColorPicker />
        </CardContent>
      </Card>

      <!-- Language Settings -->
      <Card class="border-primary/10 shadow-none overflow-hidden">
        <CardHeader class="border-b bg-white py-4 flex flex-row items-center gap-3">
          <div
            class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
          >
            <Globe class="h-4 w-4" />
          </div>
          <CardTitle class="text-[10px] font-black uppercase tracking-widest text-slate-500"
            >Ngôn ngữ & Khu vực</CardTitle
          >
        </CardHeader>
        <CardContent class="pt-6 space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700 dark:text-slate-300"
              >Ngôn ngữ hiển thị</label
            >
            <select
              v-model="lang"
              class="h-10 w-full rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-900 px-3 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-primary outline-none transition-all"
            >
              <option value="vi">Tiếng Việt (VN)</option>
              <option value="en">English (US)</option>
            </select>
          </div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            Múi giờ hiện tại: UTC+7 (Băng Cốc, Hà Nội, Jakarta)
          </p>
        </CardContent>
      </Card>

      <!-- Dark Mode Settings -->
      <Card class="border-primary/10 shadow-none overflow-hidden">
        <CardHeader class="border-b bg-white py-4 flex flex-row items-center gap-3">
          <div
            class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
          >
            <Palette class="h-4 w-4" />
          </div>
          <CardTitle class="text-[10px] font-black uppercase tracking-widest text-slate-500"
            >Chế độ hiển thị</CardTitle
          >
        </CardHeader>
        <CardContent class="pt-6">
          <div class="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              @click="applyDarkMode('light')"
              :class="[
                'h-auto flex-col gap-2 py-4 rounded-xl border-2 transition-all',
                theme === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100',
              ]"
            >
              <Sun class="h-5 w-5" />
              <span class="text-[10px] font-black uppercase tracking-widest">Sáng</span>
            </Button>

            <Button
              variant="outline"
              @click="applyDarkMode('dark')"
              :class="[
                'h-auto flex-col gap-2 py-4 rounded-xl border-2 transition-all',
                theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100',
              ]"
            >
              <Moon class="h-5 w-5" />
              <span class="text-[10px] font-black uppercase tracking-widest">Tối</span>
            </Button>

            <Button
              variant="outline"
              @click="applyDarkMode('system')"
              :class="[
                'h-auto flex-col gap-2 py-4 rounded-xl border-2 transition-all',
                theme === 'system'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-100',
              ]"
            >
              <Monitor class="h-5 w-5" />
              <span class="text-[10px] font-black uppercase tracking-widest">Hệ thống</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Display behavior -->
      <Card class="border-primary/10 shadow-none overflow-hidden lg:col-span-2">
        <CardHeader class="border-b bg-white py-4 flex flex-row items-center gap-3">
          <div
            class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
          >
            <Sparkles class="h-4 w-4" />
          </div>
          <CardTitle class="text-[10px] font-black uppercase tracking-widest text-slate-500"
            >Hiển thị & Hành vi</CardTitle
          >
        </CardHeader>
        <CardContent class="pt-6">
          <label
            class="flex items-center justify-between p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 cursor-pointer hover:border-primary transition-colors"
          >
            <div class="space-y-0.5">
              <p class="text-sm font-bold text-slate-700 dark:text-slate-200">Chế độ bảng gọn</p>
              <p class="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                Giảm khoảng cách padding trong tất cả các bảng dữ liệu
              </p>
            </div>
            <input
              v-model="compactTables"
              type="checkbox"
              class="h-5 w-5 rounded-md border-slate-300 text-primary focus:ring-primary"
            />
          </label>
        </CardContent>
      </Card>
    </div>

    <div class="text-center pt-10">
      <p class="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
        TimeMaster Professional v1.0.4
      </p>
    </div>
  </div>
</template>
