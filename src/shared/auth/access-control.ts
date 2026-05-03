import type { UserRole } from '@/modules/auth/composables/useAuth'

export type PermissionLevel = 'full' | 'manage' | 'view' | 'self' | 'none'

export interface RoleDefinition {
  key: UserRole
  label: string
  description: string
  summary: string
}

export interface PermissionScreen {
  key: string
  group: string
  label: string
  description: string
  route?: string
  note?: string
  access: Record<UserRole, PermissionLevel>
}

const rolePriority: readonly UserRole[] = [
  'ROLE_ADMIN',
  'ROLE_HR',
  'ROLE_MANAGER',
  'ROLE_EMPLOYEE',
]

export const roleDefinitions: RoleDefinition[] = [
  {
    key: 'ROLE_ADMIN',
    label: 'Quản trị viên',
    description: 'Toàn quyền vận hành và cấu hình hệ thống',
    summary: 'Quản lý tất cả màn nghiệp vụ, cấu hình và phân quyền.',
  },
  {
    key: 'ROLE_HR',
    label: 'Nhân sự',
    description: 'Quản lý nhân sự, chấm công, lịch và đơn từ',
    summary: 'Gần như Admin ở nghiệp vụ, nhưng không vào Cài đặt và Phân quyền.',
  },
  {
    key: 'ROLE_MANAGER',
    label: 'Quản lý',
    description: 'Theo dõi vận hành, duyệt đơn và xem báo cáo',
    summary: 'Không quản lý danh mục nhân sự, ca làm, ngày nghỉ hay cấu hình hệ thống.',
  },
  {
    key: 'ROLE_EMPLOYEE',
    label: 'Nhân viên',
    description: 'Tự chấm công và theo dõi dữ liệu cá nhân',
    summary: 'Chỉ thao tác trên hồ sơ, bảng công, lịch và đơn của chính mình.',
  },
]

export const roleGroups: {
  adminOnly: readonly UserRole[]
  adminHr: readonly UserRole[]
  operations: readonly UserRole[]
  selfService: readonly UserRole[]
  authenticated: readonly UserRole[]
} = {
  adminOnly: ['ROLE_ADMIN'],
  adminHr: ['ROLE_ADMIN', 'ROLE_HR'],
  operations: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'],
  selfService: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'],
  authenticated: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'],
}

export const permissionLevelMeta: Record<
  PermissionLevel,
  { label: string; description: string }
> = {
  full: {
    label: 'Toàn quyền',
    description: 'Xem, thêm, sửa, xóa và cấu hình toàn bộ module.',
  },
  manage: {
    label: 'Xử lý',
    description: 'Được xem và thao tác nghiệp vụ trong module.',
  },
  view: {
    label: 'Xem',
    description: 'Chỉ xem dữ liệu tổng hợp hoặc danh sách nghiệp vụ.',
  },
  self: {
    label: 'Cá nhân',
    description: 'Chỉ xem và thao tác trên dữ liệu của chính mình.',
  },
  none: {
    label: 'Không có',
    description: 'Không hiển thị và không được truy cập.',
  },
}

export const permissionScreens: PermissionScreen[] = [
  {
    key: 'dashboard',
    group: 'Điều hành',
    label: 'Dashboard vận hành',
    route: '/dashboard',
    description: 'Số liệu tổng quan hệ thống và tình hình đi muộn, vắng mặt, đơn từ.',
    access: {
      ROLE_ADMIN: 'view',
      ROLE_HR: 'view',
      ROLE_MANAGER: 'view',
      ROLE_EMPLOYEE: 'none',
    },
  },
  {
    key: 'attendance',
    group: 'Điều hành',
    label: 'Chấm công hôm nay',
    route: '/attendance',
    description: 'Theo dõi check-in/check-out và xử lý nghiệp vụ chấm công trong ngày.',
    access: {
      ROLE_ADMIN: 'manage',
      ROLE_HR: 'manage',
      ROLE_MANAGER: 'manage',
      ROLE_EMPLOYEE: 'none',
    },
  },
  {
    key: 'leave-operations',
    group: 'Điều hành',
    label: 'Quản lý đơn từ',
    route: '/leaves',
    description: 'Duyệt, từ chối và theo dõi tất cả đơn nghỉ phép trong hệ thống.',
    access: {
      ROLE_ADMIN: 'manage',
      ROLE_HR: 'manage',
      ROLE_MANAGER: 'manage',
      ROLE_EMPLOYEE: 'none',
    },
  },
  {
    key: 'reports',
    group: 'Điều hành',
    label: 'Báo cáo và phân tích',
    route: '/reports',
    description: 'Xem số liệu chuyên cần, tổng hợp bảng công và báo cáo tổng quan.',
    note: 'Manager xem theo phạm vi được phân quyền, thường là dữ liệu phòng ban.',
    access: {
      ROLE_ADMIN: 'view',
      ROLE_HR: 'view',
      ROLE_MANAGER: 'view',
      ROLE_EMPLOYEE: 'none',
    },
  },
  {
    key: 'schedule-board',
    group: 'Lịch và chấm công',
    label: 'Bảng lịch làm việc',
    route: '/schedule',
    description: 'Xem lịch đang có hiệu lực, đối chiếu lịch theo ngày và nhân viên.',
    note: 'Màn này dùng dữ liệu danh mục nhân sự và ca làm nên chỉ mở cho Admin/HR.',
    access: {
      ROLE_ADMIN: 'view',
      ROLE_HR: 'view',
      ROLE_MANAGER: 'none',
      ROLE_EMPLOYEE: 'none',
    },
  },
  {
    key: 'schedule-assignments',
    group: 'Lịch và chấm công',
    label: 'Phân công lịch',
    route: '/schedule/assignments',
    description: 'Gán ca làm và thiết lập khoảng hiệu lực cho nhân viên.',
    access: {
      ROLE_ADMIN: 'manage',
      ROLE_HR: 'manage',
      ROLE_MANAGER: 'none',
      ROLE_EMPLOYEE: 'none',
    },
  },
  {
    key: 'schedule-templates',
    group: 'Lịch và chấm công',
    label: 'Mẫu lịch làm việc',
    route: '/schedule/templates',
    description: 'Tạo và áp dụng mẫu lịch cho nhiều nhân viên.',
    access: {
      ROLE_ADMIN: 'manage',
      ROLE_HR: 'manage',
      ROLE_MANAGER: 'none',
      ROLE_EMPLOYEE: 'none',
    },
  },
  {
    key: 'shifts',
    group: 'Lịch và chấm công',
    label: 'Ca làm việc',
    route: '/shifts',
    description: 'Quản lý giờ vào, giờ ra và quy tắc của từng ca.',
    access: {
      ROLE_ADMIN: 'manage',
      ROLE_HR: 'manage',
      ROLE_MANAGER: 'none',
      ROLE_EMPLOYEE: 'none',
    },
  },
  {
    key: 'holidays',
    group: 'Lịch và chấm công',
    label: 'Ngày nghỉ',
    route: '/holidays',
    description: 'Cấu hình ngày lễ, ngày nghỉ đặc biệt ảnh hưởng đến bảng công.',
    access: {
      ROLE_ADMIN: 'manage',
      ROLE_HR: 'manage',
      ROLE_MANAGER: 'none',
      ROLE_EMPLOYEE: 'none',
    },
  },
  {
    key: 'employees',
    group: 'Nhân sự',
    label: 'Nhân viên',
    route: '/employees',
    description: 'Quản lý hồ sơ nhân viên, tài khoản và đăng ký khuôn mặt.',
    access: {
      ROLE_ADMIN: 'manage',
      ROLE_HR: 'manage',
      ROLE_MANAGER: 'none',
      ROLE_EMPLOYEE: 'none',
    },
  },
  {
    key: 'departments',
    group: 'Nhân sự',
    label: 'Phòng ban',
    route: '/departments',
    description: 'Quản lý danh mục phòng ban trong tổ chức.',
    access: {
      ROLE_ADMIN: 'manage',
      ROLE_HR: 'manage',
      ROLE_MANAGER: 'none',
      ROLE_EMPLOYEE: 'none',
    },
  },
  {
    key: 'positions',
    group: 'Nhân sự',
    label: 'Chức vụ',
    route: '/positions',
    description: 'Quản lý danh mục chức vụ và cấp bậc nhân sự.',
    access: {
      ROLE_ADMIN: 'manage',
      ROLE_HR: 'manage',
      ROLE_MANAGER: 'none',
      ROLE_EMPLOYEE: 'none',
    },
  },
  {
    key: 'profile',
    group: 'Cá nhân',
    label: 'Hồ sơ cá nhân',
    route: '/profile',
    description: 'Xem thông tin tài khoản và vai trò đang đăng nhập.',
    access: {
      ROLE_ADMIN: 'self',
      ROLE_HR: 'self',
      ROLE_MANAGER: 'self',
      ROLE_EMPLOYEE: 'self',
    },
  },
  {
    key: 'my-dashboard',
    group: 'Cá nhân',
    label: 'Bảng tin của tôi',
    route: '/my/dashboard',
    description: 'Tổng hợp dữ liệu chấm công và đơn từ của cá nhân.',
    access: {
      ROLE_ADMIN: 'self',
      ROLE_HR: 'self',
      ROLE_MANAGER: 'self',
      ROLE_EMPLOYEE: 'self',
    },
  },
  {
    key: 'my-attendance',
    group: 'Cá nhân',
    label: 'Bảng công của tôi',
    route: '/my/attendance',
    description: 'Xem check-in, check-out, trạng thái công và lịch sử chấm công của mình.',
    access: {
      ROLE_ADMIN: 'self',
      ROLE_HR: 'self',
      ROLE_MANAGER: 'self',
      ROLE_EMPLOYEE: 'self',
    },
  },
  {
    key: 'my-schedule',
    group: 'Cá nhân',
    label: 'Lịch làm việc của tôi',
    route: '/my/schedule',
    description: 'Theo dõi lịch đang có hiệu lực và ca được phân cho bản thân.',
    access: {
      ROLE_ADMIN: 'self',
      ROLE_HR: 'self',
      ROLE_MANAGER: 'self',
      ROLE_EMPLOYEE: 'self',
    },
  },
  {
    key: 'my-requests',
    group: 'Cá nhân',
    label: 'Đơn từ của tôi',
    route: '/my/requests',
    description: 'Tạo đơn và theo dõi trạng thái xử lý của cá nhân.',
    access: {
      ROLE_ADMIN: 'self',
      ROLE_HR: 'self',
      ROLE_MANAGER: 'self',
      ROLE_EMPLOYEE: 'self',
    },
  },
  {
    key: 'settings',
    group: 'Hệ thống',
    label: 'Cài đặt',
    route: '/settings',
    description: 'Cấu hình tham số và hành vi vận hành của hệ thống.',
    access: {
      ROLE_ADMIN: 'full',
      ROLE_HR: 'none',
      ROLE_MANAGER: 'none',
      ROLE_EMPLOYEE: 'none',
    },
  },
  {
    key: 'permissions',
    group: 'Hệ thống',
    label: 'Phân quyền',
    route: '/permissions',
    description: 'Theo dõi ma trận vai trò và chính sách truy cập hiện tại.',
    access: {
      ROLE_ADMIN: 'full',
      ROLE_HR: 'none',
      ROLE_MANAGER: 'none',
      ROLE_EMPLOYEE: 'none',
    },
  },
]

export function getPrimaryRole(roles: readonly UserRole[]): UserRole | null {
  return rolePriority.find((role) => roles.includes(role)) ?? null
}

export function getUserRoleLabel(roles: readonly UserRole[]): string {
  const primaryRole = getPrimaryRole(roles)
  return roleDefinitions.find((role) => role.key === primaryRole)?.label ?? 'Khách'
}

export function hasAnyRoleAccess(
  userRoles: readonly UserRole[],
  allowedRoles?: readonly UserRole[],
): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true
  return userRoles.some((role) => allowedRoles.includes(role))
}

export function countAccessibleScreens(role: UserRole): number {
  return permissionScreens.filter((screen) => screen.access[role] !== 'none').length
}
