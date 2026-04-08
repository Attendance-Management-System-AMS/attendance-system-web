<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  Clock,
  ClipboardList,
  Download,
  LayoutDashboard,
  Lock,
  Settings,
  Timer,
} from 'lucide-vue-next'
import { useAuth, type UserRole } from '@/composables/useAuth'

interface NavItem {
  label: string
  to: string
  icon: unknown
  roles?: UserRole[]
  children?: Omit<NavItem, 'icon'>[]
}

interface NavGroup {
  label: string
  roles?: UserRole[]
  items: NavItem[]
}

const props = defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const route = useRoute()
const { user, hasRole } = useAuth()

const navGroups: NavGroup[] = [
  {
    label: 'Tổng quan',
    items: [
      {
        label: 'Dashboard',
        to: '/dashboard',
        icon: LayoutDashboard,
        roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'],
      },
      {
        label: 'Chấm công hôm nay',
        to: '/attendance',
        icon: Timer,
        roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'],
      },
      {
        label: 'Lịch làm việc',
        to: '/schedule',
        icon: CalendarDays,
        roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'],
        children: [
          { label: 'Bảng lịch', to: '/schedule' },
          { label: 'Phân công lịch', to: '/schedule/assignments' },
          { label: 'Mẫu lịch làm việc', to: '/schedule/templates' },
        ],
      },
    ],
  },
  {
    label: 'Cá nhân',
    roles: ['ROLE_EMPLOYEE', 'ROLE_ADMIN'],
    items: [
      { label: 'Bảng tin của tôi', to: '/my/dashboard', icon: LayoutDashboard },

      { label: 'Bảng công của tôi', to: '/my/attendance', icon: Timer },
      { label: 'Đơn từ của tôi', to: '/my/requests', icon: ClipboardList },
    ],
  },
  {
    label: 'Vận hành',
    roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'],
    items: [
      { label: 'Nghỉ phép', to: '/leaves', icon: ClipboardList },
      { label: 'Ca làm việc', to: '/shifts', icon: Timer, roles: ['ROLE_ADMIN', 'ROLE_HR'] },
      { label: 'Ngày nghỉ', to: '/holidays', icon: CalendarDays, roles: ['ROLE_ADMIN', 'ROLE_HR'] },
    ],
  },
  {
    label: 'Báo cáo',
    roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'],
    items: [
      { label: 'Phân tích', to: '/reports', icon: BarChart3 },
      { label: 'Xuất báo cáo', to: '/export', icon: Download, roles: ['ROLE_ADMIN', 'ROLE_HR'] },
    ],
  },
  {
    label: 'Hệ thống',
    roles: ['ROLE_ADMIN'],
    items: [
      { label: 'Cài đặt', to: '/settings', icon: Settings },
      { label: 'Phân quyền', to: '/permissions', icon: Lock },
    ],
  },
]

const filteredNavGroups = computed(() => {
  return navGroups
    .filter((group) => !group.roles || hasRole(group.roles))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || hasRole(item.roles)),
    }))
    .filter((group) => group.items.length > 0)
})

const userDisplayName = computed(() => user.value?.fullName || 'Người dùng')
const userRoleName = computed(() => {
  const roles = user.value?.roles ?? []
  if (roles.includes('ROLE_ADMIN')) return 'Quản trị viên'
  if (roles.includes('ROLE_HR')) return 'Nhân sự'
  if (roles.includes('ROLE_MANAGER')) return 'Quản lý'
  if (roles.includes('ROLE_EMPLOYEE')) return 'Nhân viên'
  return 'Khách'
})
const userInitials = computed(() => {
  if (!user.value?.fullName) return '??'
  return user.value.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(-2)
})

const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/')
</script>

<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out',
      'dark:bg-slate-950 dark:border-slate-800',
      props.collapsed ? 'w-14' : 'w-60',
    ]"
  >
    <!-- Logo section -->
    <div
      :class="[
        'flex items-center h-16 px-3 border-b border-slate-100 dark:border-slate-800 shrink-0',
        props.collapsed ? 'justify-center' : 'gap-3',
      ]"
    >
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary shadow-lg shadow-primary/20"
      >
        <Clock class="h-5 w-5 text-white" />
      </div>
      <Transition name="fade-slide">
        <div v-if="!props.collapsed" class="overflow-hidden">
          <p class="text-sm font-bold text-slate-900 dark:text-white leading-none">TimeMaster</p>
          <p class="text-[10px] font-medium text-slate-400 leading-none mt-0.5">AMS Pro</p>
        </div>
      </Transition>
      <Transition name="fade-slide">
        <button
          v-if="!props.collapsed"
          @click="emit('toggle')"
          class="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>
      </Transition>
    </div>

    <!-- Online chip -->
    <Transition name="fade-slide">
      <div v-if="!props.collapsed" class="px-3 py-2 shrink-0">
        <div class="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5">
          <span class="relative flex h-2 w-2">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span class="text-[10px] font-bold text-emerald-600">Hệ thống · Online</span>
        </div>
      </div>
    </Transition>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-1">
      <template v-for="group in filteredNavGroups" :key="group.label">
        <!-- Group label -->
        <Transition name="fade-slide">
          <p
            v-if="!props.collapsed"
            class="px-2 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none"
          >
            {{ group.label }}
          </p>
        </Transition>
        <div v-if="props.collapsed" class="py-1">
          <div class="border-t border-slate-100 dark:border-slate-800"></div>
        </div>

        <!-- Nav items -->
        <template v-for="item in group.items" :key="item.label">
          <RouterLink
            :to="item.to"
            :title="props.collapsed ? item.label : undefined"
            :class="[
              'relative flex items-center rounded-md transition-all duration-150 group mb-1',
              props.collapsed ? 'h-10 w-10 mx-auto justify-center' : 'gap-3 px-3 py-2',
              isActive(item.to)
                ? 'bg-primary/10 text-primary font-black dark:bg-primary/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
            ]"
          >
            <!-- Active indicator -->
            <span
              v-if="isActive(item.to) && !props.collapsed"
              class="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary"
            ></span>

            <component
              :is="item.icon"
              :class="[
                'shrink-0 transition-colors',
                props.collapsed ? 'h-5 w-5' : 'h-4 w-4',
                isActive(item.to) ? 'text-primary' : '',
              ]"
            />

            <Transition name="fade-slide">
              <span v-if="!props.collapsed" class="text-sm truncate">{{ item.label }}</span>
            </Transition>

            <!-- Tooltip for collapsed mode -->
            <div
              v-if="props.collapsed"
              class="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl"
            >
              {{ item.label }}
            </div>
          </RouterLink>

          <!-- Nested items -->
          <template v-if="item.children && !props.collapsed && isActive(item.to)">
            <RouterLink
              v-for="child in item.children"
              :key="child.label"
              :to="child.to"
              :class="[
                'flex items-center gap-3 pl-10 pr-3 py-1.5 text-xs rounded-lg transition-all duration-150 group mb-1',
                route.path === child.to
                  ? 'text-primary font-black bg-primary/5 dark:bg-primary/10'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800',
              ]"
            >
              <div
                :class="[
                  'h-1.5 w-1.5 rounded-full',
                  route.path === child.to
                    ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]'
                    : 'bg-slate-300 dark:bg-slate-700',
                ]"
              ></div>
              <span>{{ child.label }}</span>
            </RouterLink>
          </template>
        </template>
      </template>
    </nav>

    <!-- User card footer -->
    <div :class="['shrink-0 border-t border-slate-100 dark:border-slate-800 p-3']">
      <div
        :class="[
          'flex items-center rounded-xl bg-slate-50 dark:bg-slate-900 transition-colors',
          props.collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2.5',
        ]"
      >
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold"
        >
          {{ userInitials }}
        </div>
        <Transition name="fade-slide">
          <div v-if="!props.collapsed" class="overflow-hidden">
            <p class="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {{ userDisplayName }}
            </p>
            <p
              v-if="user?.departmentName || user?.positionName"
              class="text-[10px] text-slate-500 font-medium truncate"
            >
              {{ user?.positionName }}{{ user?.departmentName ? ' • ' + user?.departmentName : '' }}
            </p>
            <p class="text-[9px] text-slate-400 truncate uppercase tracking-tighter">
              {{ userRoleName }}
            </p>
          </div>
        </Transition>
      </div>

      <!-- Expand button when collapsed -->
      <button
        v-if="props.collapsed"
        @click="emit('toggle')"
        class="mt-2 flex h-8 w-8 mx-auto items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        title="Mở rộng sidebar"
      >
        <ChevronLeft class="h-4 w-4 rotate-180" />
      </button>
    </div>
  </aside>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
