<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  BarChart3,
  Building2,
  Briefcase,
  CalendarDays,
  ChevronLeft,
  Clock,
  ClipboardList,
  LayoutDashboard,
  Lock,
  Settings,
  Timer,
  Users,
} from 'lucide-vue-next'
import { useAuth, type UserRole } from '@/modules/auth/composables/useAuth'

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
    label: 'Nhân sự',
    roles: ['ROLE_ADMIN', 'ROLE_HR'],
    items: [
      { label: 'Nhân viên', to: '/employees', icon: Users },
      { label: 'Phòng ban', to: '/departments', icon: Building2 },
      { label: 'Chức vụ', to: '/positions', icon: Briefcase },
    ],
  },
  {
    label: 'Cá nhân',
    roles: ['ROLE_EMPLOYEE', 'ROLE_ADMIN'],
    items: [
      { label: 'Bảng tin của tôi', to: '/my/dashboard', icon: LayoutDashboard },

      { label: 'Bảng công của tôi', to: '/my/attendance', icon: Timer },
      { label: 'Lịch làm việc của tôi', to: '/my/schedule', icon: CalendarDays },
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
      { label: 'Phân tích & Báo cáo', to: '/reports', icon: BarChart3 },
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
      'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-card text-card-foreground transition-all duration-300 ease-in-out',
      props.collapsed ? 'w-14' : 'w-60',
    ]"
  >
    <!-- Logo section -->
    <div
      :class="[
        'flex h-16 shrink-0 items-center border-b border-border',
        props.collapsed ? 'justify-center px-2' : 'gap-3 px-3',
      ]"
    >
      <div
        :class="[
          'flex shrink-0 items-center justify-center rounded-md bg-primary shadow-lg shadow-primary/20',
          props.collapsed ? 'h-8 w-8' : 'h-9 w-9',
        ]"
      >
        <Clock :class="[props.collapsed ? 'h-4 w-4' : 'h-5 w-5', 'text-primary-foreground']" />
      </div>
      <Transition name="fade-slide">
        <div v-if="!props.collapsed" class="overflow-hidden">
          <p class="text-sm font-semibold text-primary-text leading-none">TimeMaster</p>
          <p class="text-[10px] font-medium text-tertiary-text leading-none mt-0.5">AMS Pro</p>
        </div>
      </Transition>
      <Transition name="fade-slide">
        <button
          v-if="!props.collapsed"
          @click="emit('toggle')"
          class="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-tertiary-text hover:bg-elevated hover:text-primary-text transition-colors"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>
      </Transition>
    </div>

    <!-- Online chip -->
    <Transition name="fade-slide">
      <div v-if="!props.collapsed" class="px-3 py-2 shrink-0">
        <div class="flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-1.5">
          <span class="relative flex h-2 w-2">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span class="text-[10px] font-medium text-emerald-500">Hệ thống · Online</span>
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
            class="px-2 pt-4 pb-1 text-xs font-medium text-tertiary-text select-none"
          >
            {{ group.label }}
          </p>
        </Transition>
        <div v-if="props.collapsed" class="py-1">
          <div class="border-t border-border"></div>
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
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-secondary-text hover:bg-elevated hover:text-primary-text',
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
              class="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg border border-border-standard bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl"
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
                  ? 'text-primary font-semibold bg-primary/5'
                  : 'text-tertiary-text hover:text-primary-text hover:bg-elevated',
              ]"
            >
              <div
                :class="[
                  'h-1.5 w-1.5 rounded-full',
                  route.path === child.to
                    ? 'bg-primary'
                    : 'bg-border-standard',
                ]"
              ></div>
              <span>{{ child.label }}</span>
            </RouterLink>
          </template>
        </template>
      </template>
    </nav>

    <!-- User card footer -->
    <div :class="['shrink-0 border-t border-border', props.collapsed ? 'p-2' : 'p-3']">
      <RouterLink
        to="/profile"
        :class="[
          'flex items-center rounded-lg border border-border-subtle bg-surface transition-colors hover:bg-elevated hover:border-primary/20',
          props.collapsed ? 'h-10 w-10 justify-center p-1' : 'gap-3 px-3 py-2.5',
        ]"
        :title="props.collapsed ? userDisplayName : undefined"
      >
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground"
        >
          {{ userInitials }}
        </div>
        <Transition name="fade-slide">
          <div v-if="!props.collapsed" class="flex-1 overflow-hidden">
            <p class="text-xs font-semibold text-primary-text truncate">
              {{ userDisplayName }}
            </p>
            <p
              v-if="user?.departmentName || user?.positionName"
              class="text-[10px] text-secondary-text font-medium truncate"
            >
              {{ user?.positionName }}{{ user?.departmentName ? ' • ' + user?.departmentName : '' }}
            </p>
            <p class="text-[9px] text-tertiary-text truncate">
              {{ userRoleName }}
            </p>
          </div>
        </Transition>
      </RouterLink>

      <!-- Expand button when collapsed -->
      <button
        v-if="props.collapsed"
        @click="emit('toggle')"
        class="mt-2 flex h-8 w-8 mx-auto items-center justify-center rounded-lg text-tertiary-text hover:bg-elevated hover:text-primary-text transition-colors"
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
