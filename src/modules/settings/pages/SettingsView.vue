<script setup lang="ts">
import { ref } from 'vue'
import {
  Palette,
  Bell,
  Globe,
  Monitor,
  Moon,
  Sun,
  ShieldCheck,
  Save,
  Clock,
  MapPin,
  Laptop,
  Sparkles,
  LayoutPanelLeft
} from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import ThemeColorPicker from '@/shared/ui/ThemeColorPicker.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { useTheme } from '@/shared/theme/useTheme'

const activeTab = ref('appearance')
const lang = ref<'vi' | 'en'>('vi')
const compactTables = ref(false)
const { activeColorScheme, applyColorScheme } = useTheme()

const tabs = [
  { id: 'appearance', name: 'Giao diện & Trải nghiệm', icon: Palette },
  { id: 'attendance', name: 'Cấu hình chấm công', icon: ShieldCheck },
  { id: 'notifications', name: 'Thông báo', icon: Bell },
]

const applyDarkMode = (t: 'light' | 'dark' | 'system') => {
  applyColorScheme(t)
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Cài đặt hệ thống"
      description="Quản lý cấu hình cá nhân, bảo mật và trải nghiệm người dùng chuyên sâu."
    >
      <template #actions>
        <Button class="h-10 gap-2 rounded-lg bg-primary px-6 text-[10px] font-semibold tracking-normal shadow-lg shadow-primary/20 hover:brightness-110">
          <Save class="h-4 w-4" /> Lưu tất cả
        </Button>
      </template>
    </PageHeader>

    <div class="space-y-8">
      <!-- Horizontal Navigation Tabs -->
      <div class="flex w-fit items-center gap-1 rounded-lg border border-border/50 bg-muted/50 p-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2.5 px-6 py-2 rounded-lg transition-all group"
          :class="[
            activeTab === tab.id
              ? 'bg-card text-primary shadow-sm border border-border/50'
              : 'font-semibold text-secondary-text hover:text-primary-text'
          ]"
        >
          <component
            :is="tab.icon"
            class="h-4 w-4 shrink-0 transition-colors"
            :class="activeTab === tab.id ? 'text-primary' : 'text-tertiary-text group-hover:text-primary'"
          />
          <span class="text-[10px] font-semibold tracking-normal">{{ tab.name }}</span>
        </button>
      </div>

      <!-- Main Content Area -->
      <main class="min-w-0">
        <Transition name="fade" mode="out-in">
          <!-- Appearance Section -->
          <div v-if="activeTab === 'appearance'" class="space-y-6">
            <Card class="border-border shadow-none rounded-lg overflow-hidden bg-card text-card-foreground">
              <CardHeader class="p-8 pb-4 border-b border-border/50">
                <CardTitle class="flex items-center gap-2 text-[10px] font-semibold tracking-normal text-primary">
                    <Palette class="h-3 w-3" /> Màu sắc & Chủ đề
                </CardTitle>
              </CardHeader>
              <CardContent class="p-8 space-y-10">
                <div class="space-y-6">
                  <p class="flex items-center gap-2 px-1 text-[11px] font-medium tracking-normal text-tertiary-text">
                    <Sparkles class="h-3 w-3" /> Chọn tông màu chủ đạo cho hệ thống
                  </p>
                  <ThemeColorPicker />
                </div>

                <div class="pt-8 border-t border-border/50 space-y-6">
                    <p class="flex items-center gap-2 px-1 text-[11px] font-medium tracking-normal text-tertiary-text">
                        <Monitor class="h-3 w-3" /> Chế độ hiển thị màn hình
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Button
                            variant="outline"
                            @click="applyDarkMode('light')"
                            :class="[
                                'h-auto flex-col gap-3 py-6 rounded-lg border-2 transition-all',
                                activeColorScheme === 'light' ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/30',
                            ]"
                        >
                            <Sun class="h-6 w-6" />
                            <span class="text-[10px] font-semibold tracking-normal">Light Mode</span>
                        </Button>

                        <Button
                            variant="outline"
                            @click="applyDarkMode('dark')"
                            :class="[
                                'h-auto flex-col gap-3 py-6 rounded-lg border-2 transition-all',
                                activeColorScheme === 'dark' ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/30',
                            ]"
                        >
                            <Moon class="h-6 w-6" />
                            <span class="text-[10px] font-semibold tracking-normal">Dark Mode</span>
                        </Button>

                        <Button
                            variant="outline"
                            @click="applyDarkMode('system')"
                            :class="[
                                'h-auto flex-col gap-3 py-6 rounded-lg border-2 transition-all',
                                activeColorScheme === 'system' ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/30',
                            ]"
                        >
                            <Monitor class="h-6 w-6" />
                            <span class="text-[10px] font-semibold tracking-normal">System</span>
                        </Button>
                    </div>
                </div>

                <div class="pt-8 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-4">
                        <label class="flex items-center gap-2 text-[10px] font-medium tracking-normal text-tertiary-text">
                            <Globe class="h-3 w-3" /> Ngôn ngữ vùng
                        </label>
                        <select v-model="lang" class="h-12 w-full rounded-lg border border-border bg-card px-4 text-sm font-semibold text-primary-text outline-none focus:ring-1 focus:ring-primary">
                            <option value="vi">Tiếng Việt (Vietnam)</option>
                            <option value="en">English (United States)</option>
                        </select>
                    </div>
                    <div class="space-y-4">
                        <label class="flex items-center gap-2 text-[10px] font-medium tracking-normal text-tertiary-text">
                            <LayoutPanelLeft class="h-3 w-3" /> Độ dày dữ liệu
                        </label>
                        <label class="flex items-center justify-between h-12 px-4 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted transition-colors">
                            <span class="text-xs font-semibold text-secondary-text">Chế độ Compact (Bảng gọn)</span>
                            <input v-model="compactTables" type="checkbox" class="h-5 w-5 rounded border-border text-primary focus:ring-primary" />
                        </label>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Attendance Logic Section -->
          <div v-else-if="activeTab === 'attendance'" class="space-y-6">
            <Card class="border-border shadow-none rounded-lg overflow-hidden bg-card">
              <CardHeader class="p-8 pb-4 border-b border-border/50">
                <CardTitle class="flex items-center gap-2 text-[10px] font-semibold tracking-normal text-primary">
                    <ShieldCheck class="h-3 w-3" /> Cấu hình bảo mật chấm công
                </CardTitle>
              </CardHeader>
              <CardContent class="p-8 space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-4 p-6 rounded-lg bg-muted/30 border border-border/50">
                        <label class="flex items-center gap-2 text-[10px] font-medium tracking-normal text-tertiary-text">
                            <MapPin class="h-3 w-3" /> Bán kính tối đa (m)
                        </label>
                        <input type="number" value="50" class="h-12 w-full rounded-lg border border-border bg-card px-4 text-sm font-semibold text-primary outline-none focus:ring-1 focus:ring-primary" />
                        <p class="text-[10px] font-medium italic text-tertiary-text">Áp dụng cho chấm công qua định vị GPS trên Web/Mobile</p>
                    </div>
                    <div class="space-y-4 p-6 rounded-lg bg-muted/30 border border-border/50">
                        <label class="flex items-center gap-2 text-[10px] font-medium tracking-normal text-tertiary-text">
                            <Laptop class="h-3 w-3" /> Danh sách IP cho phép
                        </label>
                        <textarea class="min-h-12.5 w-full rounded-lg border border-border bg-card p-4 font-mono text-sm font-semibold text-primary-text outline-none focus:ring-1 focus:ring-primary" placeholder="192.168.1.1, 10.0.0.*"></textarea>
                        <p class="text-[10px] font-medium italic text-tertiary-text">Mỗi IP/Dải IP cách nhau bởi dấu phẩy</p>
                    </div>
                </div>

                <div class="space-y-4">
                    <label class="flex items-center gap-2 text-[10px] font-medium tracking-normal text-tertiary-text">
                        <Clock class="h-3 w-3" /> Quy tắc thời gian
                    </label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div class="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                            <span class="text-xs font-semibold text-secondary-text">Cho phép đi muộn (phút)</span>
                            <input type="number" value="15" class="h-8 w-16 rounded-lg border-none bg-muted/50 text-center text-sm font-semibold text-primary" />
                         </div>
                         <div class="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                            <span class="text-xs font-semibold text-secondary-text">Cho phép về sớm (phút)</span>
                            <input type="number" value="15" class="h-8 w-16 rounded-lg border-none bg-muted/50 text-center text-sm font-semibold text-primary" />
                         </div>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>


          <!-- Notification Section -->
          <div v-else-if="activeTab === 'notifications'" class="space-y-6">
            <Card class="border-border shadow-none rounded-lg overflow-hidden bg-card">
              <CardHeader class="p-8 pb-4 border-b border-border/50">
                <CardTitle class="flex items-center gap-2 text-[10px] font-semibold tracking-normal text-primary">
                    <Bell class="h-3 w-3" /> Thông báo & Tin nhắn
                </CardTitle>
              </CardHeader>
              <CardContent class="p-8 space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div v-for="notif in [
                        { id: 'attendance', name: 'Nhắc nhở chấm công', desc: 'Gửi thông báo trước 15 phút giờ vào/ra ca', icon: Clock },
                        { id: 'approval', name: 'Phê duyệt đơn từ', desc: 'Thông báo khi đơn nghỉ phép được duyệt/từ chối', icon: Bell },
                        { id: 'system', name: 'Cập nhật hệ thống', desc: 'Thông báo về các tính năng mới và bảo trì', icon: Sparkles },
                        { id: 'mobile', name: 'Thông báo Mobile', desc: 'Gửi thông báo đẩy về ứng dụng di động', icon: Laptop }
                    ]" :key="notif.id"
                    class="p-6 rounded-lg border border-border bg-card hover:bg-muted/30 transition-all flex items-start gap-4">
                        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-tertiary-text">
                            <component :is="notif.icon" class="h-5 w-5" />
                        </div>
                        <div class="flex-1 space-y-1">
                            <p class="text-sm font-semibold tracking-normal text-primary-text">{{ notif.name }}</p>
                            <p class="text-[10px] font-medium tracking-normal text-tertiary-text">{{ notif.desc }}</p>
                        </div>
                        <input type="checkbox" checked class="h-5 w-5 rounded border-border text-primary focus:ring-primary" />
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
