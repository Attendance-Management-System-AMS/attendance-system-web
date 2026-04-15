<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Bell, ChevronDown, Home, LogOut, Menu, Search, Settings, User } from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'
import { clearAuthToken } from '@/shared/auth/token'
import { useAuth } from '@/modules/auth/composables/useAuth'

const emit = defineEmits<{
  (e: 'toggleSidebar'): void
}>()

const { user, setUser } = useAuth()
const route = useRoute()
const router = useRouter()

const userDisplayName = computed(() => user.value?.fullName || 'Người dùng')
const userEmail = computed(() => user.value?.email || '')
const userInitials = computed(() => {
  if (!user.value?.fullName) return '??'
  return user.value.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(-2)
})

const userRoleLabel = computed(() => {
  const roles = user.value?.roles ?? []
  if (roles.includes('ROLE_ADMIN')) return 'Quản trị viên'
  if (roles.includes('ROLE_HR')) return 'Nhân sự'
  if (roles.includes('ROLE_MANAGER')) return 'Quản lý'
  if (roles.includes('ROLE_EMPLOYEE')) return 'Nhân viên'
  return 'Khách'
})
const searchQuery = ref('')
const isProfileOpen = ref(false)
const profileRef = ref<HTMLElement | null>(null)

onClickOutside(profileRef, () => {
  isProfileOpen.value = false
})

// Generate breadcrumb from route path
const breadcrumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  const map: Record<string, string> = {
    dashboard: 'Dashboard',
    attendance: 'Chấm công hôm nay',
    schedule: 'Lịch làm việc',
    employees: 'Nhân viên',
    new: 'Thêm mới',
    edit: 'Chỉnh sửa',
    departments: 'Phòng ban',
    positions: 'Chức vụ',
    leaves: 'Nghỉ phép',
    profile: 'Hồ sơ cá nhân',
    reports: 'Báo cáo',
    export: 'Xuất báo cáo',
    settings: 'Cài đặt',
    permissions: 'Phân quyền',
  }

  const crumbs = [{ label: 'Trang chủ', to: '/dashboard' }]
  segments.forEach((seg, idx) => {
    const label = map[seg] || seg
    const to = '/' + segments.slice(0, idx + 1).join('/')
    crumbs.push({ label, to })
  })
  return crumbs
})

const menuItems = [
  { label: 'Hồ sơ cá nhân', icon: User, to: '/profile' },
  { label: 'Cài đặt', icon: Settings, to: '/settings' },
]

const handleLogout = () => {
  setUser(null)
  clearAuthToken()
  isProfileOpen.value = false
  router.push('/login')
}
</script>

<template>
  <header
    class="sticky top-0 z-40 flex h-16 items-center gap-4 bg-primary px-4 shadow-lg shadow-primary/20 dark:bg-slate-900"
  >
    <!-- Left: Menu toggle + Breadcrumb -->
    <div class="flex flex-1 items-center gap-3 min-w-0">
      <!-- Hamburger -->
      <button
        @click="emit('toggleSidebar')"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors"
      >
        <Menu class="h-5 w-5" />
      </button>

      <!-- Breadcrumb -->
      <nav class="hidden md:flex items-center gap-1 text-sm min-w-0">
        <template v-for="(crumb, idx) in breadcrumbs" :key="crumb.to">
          <span v-if="idx > 0" class="text-white/40 mx-1">/</span>
          <RouterLink
            v-if="idx < breadcrumbs.length - 1"
            :to="crumb.to"
            class="flex items-center gap-1 text-white/70 hover:text-white transition-colors"
          >
            <Home v-if="idx === 0" class="h-3.5 w-3.5" />
            <span v-else class="truncate max-w-30">{{ crumb.label }}</span>
          </RouterLink>
          <span
            v-else
            class="font-black text-white truncate max-w-37.5 uppercase tracking-tight"
          >
            {{ crumb.label }}
          </span>
        </template>
      </nav>

      <!-- Global Search -->
      <div class="hidden lg:flex flex-1 max-w-xs ml-2">
        <div class="relative w-full">
          <Search
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm nhân viên, phòng ban..."
            class="h-9 w-full rounded-full bg-white/10 pl-9 pr-4 text-sm text-white placeholder:text-white/40 border border-white/10 focus:border-white/30 focus:outline-none focus:ring-0 transition-colors"
          />
        </div>
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-2 shrink-0">
      <!-- Announcement chip -->
      <div
        class="hidden md:flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
        Phiên bản 2.0
      </div>

      <!-- Bell notification -->
      <button
        class="relative flex h-9 w-9 items-center justify-center rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors"
      >
        <Bell class="h-5 w-5" />
        <span
          class="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-rose-500"
        >
          <span
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"
          ></span>
        </span>
      </button>

      <!-- Divider -->
      <div class="h-6 w-px bg-white/20"></div>

      <!-- Avatar dropdown -->
      <div ref="profileRef" class="relative">
        <button
          @click="isProfileOpen = !isProfileOpen"
          class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <div
            class="flex h-8 w-8 items-center justify-center rounded-md bg-white/20 text-xs font-bold text-white"
          >
            {{ userInitials }}
          </div>
          <span class="hidden md:block text-sm font-medium">{{ userDisplayName }}</span>
          <ChevronDown
            :class="['h-4 w-4 transition-transform duration-200', isProfileOpen && 'rotate-180']"
          />
        </button>

        <!-- Dropdown menu -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-1"
        >
          <div
            v-if="isProfileOpen"
            class="absolute right-0 top-full mt-2 w-64 rounded-md border border-slate-200 bg-white shadow-xl shadow-slate-200/60 z-50 overflow-hidden dark:bg-slate-900 dark:border-slate-800"
          >
            <!-- User info header -->
            <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-600 text-white text-sm font-bold"
                >
                  {{ userInitials }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">
                    {{ userDisplayName }}
                  </p>
                  <p
                    class="text-[11px] font-medium text-indigo-600 dark:text-indigo-400"
                    v-if="user?.positionName || user?.departmentName"
                  >
                    {{ user?.positionName
                    }}{{ user?.departmentName ? ' • ' + user?.departmentName : '' }}
                  </p>
                  <p class="text-[10px] text-slate-500">{{ userRoleLabel }} • {{ userEmail }}</p>
                </div>
              </div>
            </div>

            <!-- Menu items -->
            <div class="p-1.5">
              <RouterLink
                v-for="item in menuItems"
                :key="item.label"
                :to="item.to"
                @click="isProfileOpen = false"
                class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <component :is="item.icon" class="h-4 w-4 text-slate-400" />
                {{ item.label }}
              </RouterLink>
            </div>

            <!-- Logout -->
            <div class="border-t border-slate-100 dark:border-slate-800 p-1.5">
              <button
                @click="handleLogout"
                class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut class="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>
