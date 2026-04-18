<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Bell, ChevronDown, Home, LogOut, Menu, Moon, Search, Settings, Sun, User } from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'
import { clearAuthToken } from '@/shared/auth/token'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { useTheme } from '@/shared/theme/useTheme'

const emit = defineEmits<{
  (e: 'toggleSidebar'): void
}>()

const { user, setUser } = useAuth()
const route = useRoute()
const router = useRouter()
const { activeColorScheme, applyColorScheme } = useTheme()

const toggleColorScheme = () => {
  const newScheme = activeColorScheme.value === 'dark' ? 'light' : 'dark'
  applyColorScheme(newScheme)
}

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
const dropdownRef = ref<HTMLElement | null>(null)
const dropdownPosition = ref({ top: 0, right: 0 })

const toggleProfile = (event: MouseEvent) => {
  isProfileOpen.value = !isProfileOpen.value
  if (isProfileOpen.value) {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    dropdownPosition.value = {
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    }
  }
}

onClickOutside(dropdownRef, () => {
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
    class="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card/95 px-4 text-card-foreground shadow-sm backdrop-blur"
  >
    <!-- Left: Menu toggle + Breadcrumb -->
    <div class="flex flex-1 items-center gap-3 min-w-0">
      <!-- Hamburger -->
      <button
        @click="emit('toggleSidebar')"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-secondary-text hover:bg-elevated hover:text-primary-text transition-colors"
      >
        <Menu class="h-5 w-5" />
      </button>

      <!-- Breadcrumb -->
      <nav class="hidden md:flex items-center gap-1 text-sm min-w-0">
        <template v-for="(crumb, idx) in breadcrumbs" :key="crumb.to">
          <span v-if="idx > 0" class="text-tertiary-text mx-1">/</span>
          <RouterLink
            v-if="idx < breadcrumbs.length - 1"
            :to="crumb.to"
            class="flex items-center gap-1 text-secondary-text hover:text-primary-text transition-colors"
          >
            <Home v-if="idx === 0" class="h-3.5 w-3.5" />
            <span v-else class="truncate max-w-30">{{ crumb.label }}</span>
          </RouterLink>
          <span
            v-else
            class="font-semibold text-primary-text truncate max-w-37.5"
          >
            {{ crumb.label }}
          </span>
        </template>
      </nav>

      <!-- Global Search -->
      <div class="hidden lg:flex flex-1 max-w-xs ml-2">
        <div class="relative w-full">
          <Search
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary-text"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm nhân viên, phòng ban..."
            class="h-9 w-full rounded-lg border border-border-standard bg-surface pl-9 pr-4 text-sm text-primary-text placeholder:text-tertiary-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 transition-colors"
          />
        </div>
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-2 shrink-0">
      <!-- Theme toggle -->
      <button
        @click="toggleColorScheme"
        class="flex h-9 w-9 items-center justify-center rounded-lg text-secondary-text hover:bg-elevated hover:text-primary-text transition-colors"
        title="Đổi giao diện"
      >
        <Sun v-if="activeColorScheme === 'dark'" class="h-5 w-5" />
        <Moon v-else class="h-5 w-5" />
      </button>

      <!-- Bell notification -->
      <button
        class="relative flex h-9 w-9 items-center justify-center rounded-lg text-secondary-text hover:bg-elevated hover:text-primary-text transition-colors"
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
      <div class="h-6 w-px bg-border"></div>

      <!-- Avatar dropdown -->
      <div class="relative">
        <button
          ref="profileRef"
          @click="toggleProfile"
          class="flex items-center gap-2 rounded-lg p-1.5 text-secondary-text hover:bg-elevated hover:text-primary-text transition-colors"
          aria-label="Tài khoản cá nhân"
        >
          <div
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground shrink-0"
          >
            {{ userInitials }}
          </div>
          <span class="hidden md:block text-sm font-medium pr-1">{{ userDisplayName }}</span>
          <ChevronDown
            :class="['h-4 w-4 transition-transform duration-200 hidden md:block', isProfileOpen && 'rotate-180']"
          />
        </button>

        <!-- Dropdown menu — Teleported to body to avoid overflow clipping -->
        <Teleport to="body">
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-1"
          >
            <div
              v-if="isProfileOpen"
              ref="dropdownRef"
              :style="{ top: dropdownPosition.top + 'px', right: dropdownPosition.right + 'px' }"
              class="fixed w-72 rounded-xl border border-border-standard bg-popover text-popover-foreground shadow-2xl z-[200] overflow-hidden"
            >
              <!-- User info header -->
              <div class="px-4 py-3 border-b border-border">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold"
                  >
                    {{ userInitials }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-primary-text truncate">
                      {{ userDisplayName }}
                    </p>
                    <p class="text-[11px] font-medium text-primary truncate" v-if="user?.positionName || user?.departmentName">
                      {{ user?.positionName }}{{ user?.departmentName ? ' • ' + user?.departmentName : '' }}
                    </p>
                    <p class="text-[10px] text-tertiary-text truncate">{{ userRoleLabel }} • {{ userEmail }}</p>
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
                  class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-secondary-text hover:bg-elevated hover:text-primary-text transition-colors"
                >
                  <component :is="item.icon" class="h-4 w-4 text-tertiary-text shrink-0" />
                  {{ item.label }}
                </RouterLink>
              </div>

              <!-- Logout -->
              <div class="border-t border-border p-1.5">
                <button
                  @click="handleLogout"
                  class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-500/10"
                >
                  <LogOut class="h-4 w-4 shrink-0" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </Transition>
        </Teleport>
      </div>
    </div>
  </header>
</template>
