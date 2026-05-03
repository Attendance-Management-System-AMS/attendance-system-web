import type { Page, Route } from '@playwright/test'

export type RoleKey = 'admin' | 'hr' | 'manager' | 'employee'

type MockUser = {
  id: number
  username: string
  fullName: string
  email: string
  roles: string[]
  departmentName?: string
  positionName?: string
  token: string
  refreshToken: string
}

type MockStore = ReturnType<typeof createMockStore>

const VALID_PASSWORD = 'Password123!'
const FACE_DESCRIPTOR = Array.from({ length: 128 }, (_, index) => Number((index / 128).toFixed(8)))

const USERS: Record<RoleKey, MockUser> = {
  admin: {
    id: 9001,
    username: 'admin',
    fullName: 'System Admin',
    email: 'admin@timemaster.vn',
    roles: ['ROLE_ADMIN'],
    departmentName: 'Ban dieu hanh',
    positionName: 'Administrator',
    token: 'token-admin',
    refreshToken: 'refresh-admin',
  },
  hr: {
    id: 9002,
    username: 'hr',
    fullName: 'Tran Thi HR',
    email: 'hr@timemaster.vn',
    roles: ['ROLE_HR'],
    departmentName: 'Nhan su',
    positionName: 'HR Specialist',
    token: 'token-hr',
    refreshToken: 'refresh-hr',
  },
  manager: {
    id: 9003,
    username: 'manager',
    fullName: 'Pham Van Manager',
    email: 'manager@timemaster.vn',
    roles: ['ROLE_MANAGER'],
    departmentName: 'Van hanh',
    positionName: 'Manager',
    token: 'token-manager',
    refreshToken: 'refresh-manager',
  },
  employee: {
    id: 1002,
    username: 'employee',
    fullName: 'Nguyen Van Employee',
    email: 'employee@timemaster.vn',
    roles: ['ROLE_EMPLOYEE'],
    departmentName: 'Ky thuat',
    positionName: 'Nhan vien',
    token: 'token-employee',
    refreshToken: 'refresh-employee',
  },
}

function timestamp() {
  return new Date().toISOString()
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function pageResult<T>(content: T[]) {
  return {
    content,
    page: 0,
    size: content.length || 10,
    totalElements: content.length,
    totalPages: content.length ? 1 : 0,
    last: true,
    first: true,
    numberOfElements: content.length,
  }
}

function apiEnvelope<T>(result: T, message = 'OK', code = 200) {
  return {
    success: code >= 200 && code < 300,
    code,
    message,
    result,
    timestamp: timestamp(),
  }
}

function createMockStore() {
  const departments = [
    {
      id: 1,
      name: 'Nhan su',
      description: 'Quan ly nhan su va van hoa',
      totalEmployees: 12,
      status: 'ACTIVE',
    },
    {
      id: 2,
      name: 'Ky thuat',
      description: 'Van hanh he thong attendance',
      totalEmployees: 25,
      status: 'ACTIVE',
    },
  ]

  const positions = [
    {
      id: 1,
      name: 'HR Specialist',
      code: 'HRS',
      departmentId: 1,
      departmentName: 'Nhan su',
      description: 'Phu trach nhan su',
      level: 2,
      status: 'active',
    },
    {
      id: 2,
      name: 'Backend Engineer',
      code: 'BE',
      departmentId: 2,
      departmentName: 'Ky thuat',
      description: 'Phat trien backend',
      level: 2,
      status: 'active',
    },
    {
      id: 3,
      name: 'Manager',
      code: 'MGR',
      departmentId: 2,
      departmentName: 'Ky thuat',
      description: 'Quan ly don vi',
      level: 3,
      status: 'active',
    },
  ]

  const employees = [
    {
      id: 1001,
      employeeCode: 'EMP001',
      fullName: 'Tran Thi HR',
      gender: 'FEMALE',
      email: 'hr@timemaster.vn',
      departmentId: 1,
      departmentName: 'Nhan su',
      positionId: 1,
      positionName: 'HR Specialist',
      managerId: 9003,
      managerName: 'Pham Van Manager',
      status: 'ACTIVE',
      biometricHash: 'face-hash-1',
      faceRegistered: true,
      joinDate: '2025-01-01',
      createdAt: timestamp(),
    },
    {
      id: 1002,
      employeeCode: 'EMP002',
      fullName: 'Nguyen Van Employee',
      gender: 'MALE',
      email: 'employee@timemaster.vn',
      departmentId: 2,
      departmentName: 'Ky thuat',
      positionId: 2,
      positionName: 'Backend Engineer',
      managerId: 9003,
      managerName: 'Pham Van Manager',
      status: 'ACTIVE',
      biometricHash: null,
      faceRegistered: false,
      joinDate: '2025-02-10',
      createdAt: timestamp(),
    },
  ]

  const attendance = [
    {
      id: 2001,
      employeeId: 1001,
      employee: clone(employees[0]),
      checkIn: '08:02',
      checkInTime: '2026-04-21T08:02:00+07:00',
      checkOut: '17:31',
      checkOutTime: '2026-04-21T17:31:00+07:00',
      workDate: '2026-04-21',
      shiftName: 'Hanh chinh',
      status: 'PRESENT',
      isRecorded: true,
    },
    {
      id: 2002,
      employeeId: 1002,
      employee: clone(employees[1]),
      checkIn: '08:15',
      checkInTime: '2026-04-21T08:15:00+07:00',
      checkOut: null,
      checkOutTime: null,
      workDate: '2026-04-21',
      shiftName: 'Ca sang',
      status: 'LATE',
      lateMinutes: 15,
      isRecorded: true,
    },
  ]

  const shifts = [
    {
      id: 3001,
      name: 'Hanh chinh',
      code: 'HC',
      startTime: '08:00',
      endTime: '17:30',
      breakMinutes: 60,
      status: 'ACTIVE',
    },
    {
      id: 3002,
      name: 'Ca sang',
      code: 'MORNING',
      startTime: '07:00',
      endTime: '15:00',
      breakMinutes: 30,
      status: 'ACTIVE',
    },
  ]

  const schedules = [
    {
      id: 4001,
      employeeId: 1002,
      shiftId: 3002,
      shiftName: 'Ca sang',
      startTime: '07:00',
      endTime: '15:00',
      dayOfWeek: 1,
      isActive: true,
      effectiveFrom: '2026-04-01',
      date: '2026-04-21',
    },
  ]

  const scheduleTemplates = [
    {
      id: 5001,
      name: 'Mau hanh chinh',
      description: 'Template cho khoi van phong',
      items: [{ id: 1, dayOfWeek: 1, shiftId: 3001 }],
    },
  ]

  const holidays = [
    {
      id: 6001,
      holidayName: 'Giai phong',
      fromDate: '2026-04-30',
      toDate: '2026-04-30',
      isPaid: false,
    },
  ]

  const leaveTypes = [
    { code: 'ANNUAL', name: 'Nghi phep nam' },
    { code: 'SICK', name: 'Nghi om' },
  ]

  const leaves = [
    {
      id: 7001,
      employeeId: 1002,
      employeeName: 'Nguyen Van Employee',
      employeeCode: 'EMP002',
      departmentName: 'Ky thuat',
      reason: 'Kham suc khoe dinh ky',
      leaveType: leaveTypes[1],
      fromDate: '2026-04-25',
      toDate: '2026-04-25',
      status: 'pending',
    },
  ]

  const authUsers = Object.values(USERS).map((user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    departmentName: user.departmentName ?? null,
    positionName: user.positionName ?? null,
    enabled: true,
    roles: [...user.roles],
    createdAt: timestamp(),
  }))

  return {
    nextId: 9000,
    authUsers,
    departments,
    positions,
    employees,
    attendance,
    shifts,
    schedules,
    scheduleTemplates,
    holidays,
    leaveTypes,
    leaves,
    nextFaceEvent: 'check-in' as 'check-in' | 'check-out',
  }
}

function getUserByRole(role: RoleKey) {
  return USERS[role]
}

function getUserByToken(rawToken?: string | null) {
  const token = rawToken?.replace(/^Bearer\s+/i, '').trim()
  return Object.values(USERS).find((user) => user.token === token)
}

function getUserByRefreshToken(refreshToken?: string | null) {
  return Object.values(USERS).find((user) => user.refreshToken === refreshToken)
}

function resolveRoleFromEmail(email?: string) {
  const normalized = String(email ?? '').toLowerCase()
  if (normalized.startsWith('admin')) return 'admin'
  if (normalized.startsWith('hr')) return 'hr'
  if (normalized.startsWith('manager')) return 'manager'
  return 'employee'
}

function getCurrentUser(route: Route) {
  const authHeader = route.request().headers().authorization
  return getUserByToken(authHeader)
}

function json(route: Route, result: unknown, message = 'OK', status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(apiEnvelope(result, message, status)),
  })
}

function raw(route: Route, body: string | Buffer, contentType: string, extraHeaders?: Record<string, string>) {
  return route.fulfill({
    status: 200,
    body,
    contentType,
    headers: extraHeaders,
  })
}

function unauthorized(route: Route, message = 'Unauthorized') {
  return route.fulfill({
    status: 401,
    contentType: 'application/json',
    body: JSON.stringify(apiEnvelope(null, message, 401)),
  })
}

function parseId(path: string) {
  const match = path.match(/\/(\d+)(?:\/|$)/)
  return match ? Number(match[1]) : null
}

function safeJson(route: Route) {
  try {
    return route.request().postDataJSON() as Record<string, unknown>
  } catch {
    return {}
  }
}

function fulfillAvatar(route: Route) {
  return route.fulfill({ status: 204, body: '' })
}

async function handleApiRoute(route: Route, store: MockStore) {
  const request = route.request()
  const url = new URL(request.url())
  const path = url.pathname.replace(/^\/api/, '') || '/'
  const method = request.method()

  if (path.startsWith('/avatar/')) {
    return fulfillAvatar(route)
  }

  if (path === '/auth/login' && method === 'POST') {
    const body = safeJson(route)
    if (body.password !== VALID_PASSWORD) {
      return unauthorized(route, 'Sai tai khoan hoac mat khau.')
    }

    const role = resolveRoleFromEmail(String(body.email ?? body.username ?? ''))
    const user = getUserByRole(role)
    return json(
      route,
      {
        accessToken: user.token,
        refreshToken: user.refreshToken,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          departmentName: user.departmentName,
          positionName: user.positionName,
          roles: user.roles,
        },
      },
      'Dang nhap thanh cong',
    )
  }

  if (path === '/auth/refresh' && method === 'POST') {
    const body = safeJson(route)
    const user = getUserByRefreshToken(String(body.refreshToken ?? ''))
    if (!user) {
      return unauthorized(route, 'Refresh token khong hop le.')
    }

    return json(route, {
      accessToken: user.token,
      refreshToken: user.refreshToken,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        departmentName: user.departmentName,
        positionName: user.positionName,
        roles: user.roles,
      },
    })
  }

  if (path === '/auth/me' && method === 'GET') {
    const user = getCurrentUser(route)
    if (!user) return unauthorized(route)

    return json(route, {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      departmentName: user.departmentName,
      positionName: user.positionName,
      roles: user.roles,
    })
  }

  if (path === '/auth/roles' && method === 'GET') {
    const roleDefinitions = [
      { roleName: 'ROLE_ADMIN', description: 'Quản trị và kiểm toán hệ thống' },
      { roleName: 'ROLE_HR', description: 'Nhân sự và vận hành chấm công' },
      { roleName: 'ROLE_MANAGER', description: 'Quản lý phòng ban' },
      { roleName: 'ROLE_EMPLOYEE', description: 'Nhân viên thông thường' },
    ]

    return json(
      route,
      roleDefinitions.map((role) => ({
        ...role,
        userCount: store.authUsers.filter((user) => user.roles.includes(role.roleName)).length,
      })),
    )
  }

  if (path === '/auth/admin/users' && method === 'GET') {
    const keyword = String(url.searchParams.get('keyword') ?? '').trim().toLowerCase()
    const enabled = url.searchParams.get('enabled')
    const role = String(url.searchParams.get('role') ?? '').trim()

    let filtered = [...store.authUsers]

    if (keyword) {
      filtered = filtered.filter((user) =>
        user.username.toLowerCase().includes(keyword)
        || String(user.email ?? '').toLowerCase().includes(keyword))
    }

    if (enabled === 'true') {
      filtered = filtered.filter((user) => user.enabled)
    } else if (enabled === 'false') {
      filtered = filtered.filter((user) => !user.enabled)
    }

    if (role) {
      filtered = filtered.filter((user) => user.roles.includes(role))
    }

    return json(route, pageResult(filtered))
  }

  if (path.startsWith('/auth/admin/users/') && path.endsWith('/access') && method === 'PUT') {
    const id = parseId(path)
    const body = safeJson(route)
    const index = store.authUsers.findIndex((user) => user.id === id)

    if (index < 0) {
      return route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify(apiEnvelope(null, 'Khong tim thay tai khoan', 404)),
      })
    }

    store.authUsers[index] = {
      ...store.authUsers[index],
      enabled: Boolean(body.enabled),
      roles: Array.isArray(body.roles) ? body.roles.map(String) : store.authUsers[index].roles,
    }

    return json(route, store.authUsers[index], 'Cap nhat quyen truy cap thanh cong')
  }

  if (path === '/departments' && method === 'GET') {
    return json(route, pageResult(store.departments))
  }

  if (path === '/departments' && method === 'POST') {
    const body = safeJson(route)
    const record = {
      id: ++store.nextId,
      name: String(body.name ?? 'Phong ban moi'),
      description: String(body.description ?? ''),
      totalEmployees: 0,
      status: 'ACTIVE',
    }
    store.departments.unshift(record)
    return json(route, record, 'Tao phong ban thanh cong', 201)
  }

  if (path.startsWith('/departments/') && method === 'GET') {
    return json(route, store.departments.find((item) => item.id === parseId(path)) ?? store.departments[0])
  }

  if (path.startsWith('/departments/') && method === 'PUT') {
    const id = parseId(path)
    const body = safeJson(route)
    const index = store.departments.findIndex((item) => item.id === id)
    if (index >= 0) {
      store.departments[index] = { ...store.departments[index], ...body }
      return json(route, store.departments[index], 'Cap nhat phong ban thanh cong')
    }
  }

  if (path.startsWith('/departments/') && method === 'DELETE') {
    const id = parseId(path)
    store.departments = store.departments.filter((item) => item.id !== id)
    return json(route, null, 'Xoa phong ban thanh cong')
  }

  if (path === '/positions' && method === 'GET') {
    return json(route, pageResult(store.positions))
  }

  if (path === '/positions' && method === 'POST') {
    const body = safeJson(route)
    const department =
      store.departments.find((item) => item.id === Number(body.departmentId)) ?? store.departments[0]
    const record = {
      id: ++store.nextId,
      name: String(body.name ?? 'Chuc vu moi'),
      code: String(body.code ?? `POS-${store.nextId}`),
      departmentId: department.id,
      departmentName: department.name,
      description: String(body.description ?? ''),
      level: Number(body.level ?? 1),
      status: String(body.status ?? 'active'),
    }
    store.positions.unshift(record)
    return json(route, record, 'Tao chuc vu thanh cong', 201)
  }

  if (path.startsWith('/positions/') && method === 'GET') {
    return json(route, store.positions.find((item) => item.id === parseId(path)) ?? store.positions[0])
  }

  if (path.startsWith('/positions/') && method === 'PUT') {
    const id = parseId(path)
    const body = safeJson(route)
    const index = store.positions.findIndex((item) => item.id === id)
    if (index >= 0) {
      store.positions[index] = { ...store.positions[index], ...body }
      return json(route, store.positions[index], 'Cap nhat chuc vu thanh cong')
    }
  }

  if (path.startsWith('/positions/') && method === 'DELETE') {
    const id = parseId(path)
    store.positions = store.positions.filter((item) => item.id !== id)
    return json(route, null, 'Xoa chuc vu thanh cong')
  }

  if (path === '/employees' && method === 'GET') {
    const keyword = (url.searchParams.get('keyword') ?? '').toLowerCase()
    const filtered = keyword
      ? store.employees.filter(
          (item) =>
            item.fullName.toLowerCase().includes(keyword) ||
            item.employeeCode.toLowerCase().includes(keyword) ||
            item.email.toLowerCase().includes(keyword),
        )
      : store.employees
    return json(route, pageResult(filtered))
  }

  if (path === '/employees' && method === 'POST') {
    const body = safeJson(route)
    const department = store.departments.find((item) => item.id === Number(body.departmentId)) ?? store.departments[0]
    const position = store.positions.find((item) => item.id === Number(body.positionId)) ?? store.positions[0]
    const record = {
      id: ++store.nextId,
      employeeCode: String(body.employeeCode ?? `EMP${store.nextId}`),
      fullName: String(body.fullName ?? 'Nhan vien moi'),
      gender: String(body.gender ?? 'OTHER'),
      email: String(body.email ?? `employee${store.nextId}@timemaster.vn`),
      departmentId: department.id,
      departmentName: department.name,
      positionId: position.id,
      positionName: position.name,
      managerId: USERS.manager.id,
      managerName: USERS.manager.fullName,
      status: String(body.status ?? 'ACTIVE'),
      biometricHash: null,
      faceRegistered: false,
      joinDate: String(body.joinDate ?? '2026-04-21'),
      createdAt: timestamp(),
    }
    store.employees.unshift(record)
    return json(route, record, 'Tao nhan vien thanh cong', 201)
  }

  if (path.startsWith('/employees/') && path.endsWith('/face-descriptor') && method === 'PUT') {
    const id = parseId(path)
    const employee = store.employees.find((item) => item.id === id)
    if (!employee) return unauthorized(route, 'Khong tim thay nhan vien.')

    employee.faceRegistered = true
    employee.biometricHash = 'descriptor-saved'
    return json(route, employee, 'Da luu descriptor khuon mat')
  }

  if (path.startsWith('/employees/') && method === 'GET') {
    return json(route, store.employees.find((item) => item.id === parseId(path)) ?? store.employees[0])
  }

  if (path.startsWith('/employees/') && method === 'PUT') {
    const id = parseId(path)
    const body = safeJson(route)
    const index = store.employees.findIndex((item) => item.id === id)
    if (index >= 0) {
      store.employees[index] = { ...store.employees[index], ...body }
      return json(route, store.employees[index], 'Cap nhat nhan vien thanh cong')
    }
  }

  if (path.startsWith('/employees/') && method === 'DELETE') {
    const id = parseId(path)
    store.employees = store.employees.filter((item) => item.id !== id)
    return json(route, null, 'Xoa nhan vien thanh cong')
  }

  if (path === '/attendance' && method === 'GET') {
    return json(route, pageResult(store.attendance))
  }

  if (path === '/attendance/me' && method === 'GET') {
    const user = getCurrentUser(route) ?? USERS.employee
    const rows = store.attendance
      .filter((item) => item.employeeId === user.id)
      .map((item) => ({
        ...item,
        checkIn: item.checkInTime,
        checkOut: item.checkOutTime,
        lateMinutes: item.lateMinutes ?? (item.status === 'LATE' ? 15 : 0),
      }))
    return json(route, pageResult(rows))
  }

  if (path === '/attendance/today/me' && method === 'GET') {
    const user = getCurrentUser(route) ?? USERS.employee
    const row = store.attendance.find((item) => item.employeeId === user.id) ?? null
    return json(route, row)
  }

  if (path === '/attendance/schedules/me' && method === 'GET') {
    const user = getCurrentUser(route) ?? USERS.employee
    const rows = store.schedules.filter((item) => item.employeeId === user.id)
    return json(route, rows)
  }

  if (path === '/attendance/scan-by-face' && method === 'POST') {
    const employee = clone(store.employees.find((item) => item.id === 1002) ?? store.employees[0])
    const isCheckOut = store.nextFaceEvent === 'check-out'
    store.nextFaceEvent = isCheckOut ? 'check-in' : 'check-out'
    return json(route, {
      id: 8001,
      employeeId: employee.id,
      checkInTime: '2026-04-21T08:05:00+07:00',
      checkOutTime: isCheckOut ? '2026-04-21T17:32:00+07:00' : null,
      workDate: '2026-04-21',
      status: isCheckOut ? 'COMPLETED' : 'PRESENT',
      employee,
      employeeFullName: employee.fullName,
      employeeSnapshotCode: employee.employeeCode,
      employeeSnapshotDepartmentName: employee.departmentName,
      employeeSnapshotPositionName: employee.positionName,
    })
  }

  if (path.startsWith('/attendance/check-in/') && method === 'POST') {
    return json(route, {
      id: 8101,
      employeeId: parseId(path),
      checkInTime: '2026-04-21T08:00:00+07:00',
      status: 'PRESENT',
    })
  }

  if (path.startsWith('/attendance/check-out/') && method === 'POST') {
    return json(route, {
      id: 8101,
      employeeId: parseId(path),
      checkInTime: '2026-04-21T08:00:00+07:00',
      checkOutTime: '2026-04-21T17:30:00+07:00',
      status: 'COMPLETED',
    })
  }

  if (path.startsWith('/attendance/') && method === 'DELETE') {
    const id = parseId(path)
    store.attendance = store.attendance.filter((item) => Number(item.id) !== id)
    return json(route, null, 'Xoa ban ghi chinh cong thanh cong')
  }

  if (path === '/attendance/shifts' && method === 'GET') {
    return json(route, pageResult(store.shifts))
  }

  if (path === '/attendance/shifts' && method === 'POST') {
    const body = safeJson(route)
    const record = {
      id: ++store.nextId,
      name: String(body.name ?? 'Ca moi'),
      code: String(body.code ?? `SHIFT-${store.nextId}`),
      startTime: String(body.startTime ?? '09:00'),
      endTime: String(body.endTime ?? '18:00'),
      breakMinutes: Number(body.breakMinutes ?? 60),
      status: 'ACTIVE',
    }
    store.shifts.unshift(record)
    return json(route, record, 'Tao ca lam thanh cong', 201)
  }

  if (path.startsWith('/attendance/shifts/') && method === 'GET') {
    return json(route, store.shifts.find((item) => item.id === parseId(path)) ?? store.shifts[0])
  }

  if (path.startsWith('/attendance/shifts/') && method === 'PUT') {
    const id = parseId(path)
    const body = safeJson(route)
    const index = store.shifts.findIndex((item) => item.id === id)
    if (index >= 0) {
      store.shifts[index] = { ...store.shifts[index], ...body }
      return json(route, store.shifts[index], 'Cap nhat ca lam thanh cong')
    }
  }

  if (path.startsWith('/attendance/shifts/') && method === 'DELETE') {
    const id = parseId(path)
    store.shifts = store.shifts.filter((item) => item.id !== id)
    return json(route, null, 'Xoa ca lam thanh cong')
  }

  if (path === '/attendance/schedules' && method === 'GET') {
    return json(route, pageResult(store.schedules))
  }

  if (path.startsWith('/attendance/schedules/employee/') && method === 'GET') {
    const employeeId = parseId(path)
    return json(route, store.schedules.filter((item) => item.employeeId === employeeId))
  }

  if (path === '/attendance/schedules' && method === 'POST') {
    const body = safeJson(route)
    const shift = store.shifts.find((item) => item.id === Number(body.shiftId)) ?? store.shifts[0]
    const record = {
      id: ++store.nextId,
      employeeId: Number(body.employeeId ?? 1002),
      shiftId: shift.id,
      shiftName: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      dayOfWeek: Number(body.dayOfWeek ?? 1),
      isActive: Boolean(body.isActive ?? true),
      effectiveFrom: String(body.effectiveFrom ?? '2026-04-21'),
    }
    store.schedules.unshift(record)
    return json(route, record, 'Tao lich lam thanh cong', 201)
  }

  if (path === '/attendance/schedules/bulk' && method === 'POST') {
    return json(route, null, 'Phan cong lich hang loat thanh cong')
  }

  if (path === '/attendance/schedules/apply-template' && method === 'POST') {
    return json(route, null, 'Ap dung mau lich thanh cong')
  }

  if (path.startsWith('/attendance/schedules/') && method === 'DELETE') {
    const id = parseId(path)
    store.schedules = store.schedules.filter((item) => item.id !== id)
    return json(route, null, 'Xoa lich lam thanh cong')
  }

  if (path === '/attendance/schedule-templates' && method === 'GET') {
    return json(route, store.scheduleTemplates)
  }

  if (path.startsWith('/attendance/schedule-templates/') && method === 'GET') {
    return json(
      route,
      store.scheduleTemplates.find((item) => item.id === parseId(path)) ?? store.scheduleTemplates[0],
    )
  }

  if (path === '/attendance/schedule-templates' && method === 'POST') {
    const body = safeJson(route)
    const record = {
      id: ++store.nextId,
      name: String(body.name ?? 'Template moi'),
      description: String(body.description ?? ''),
      items: Array.isArray(body.items) ? body.items : [],
    }
    store.scheduleTemplates.unshift(record)
    return json(route, record, 'Tao template thanh cong', 201)
  }

  if (path.startsWith('/attendance/schedule-templates/') && method === 'PUT') {
    const id = parseId(path)
    const body = safeJson(route)
    const index = store.scheduleTemplates.findIndex((item) => item.id === id)
    if (index >= 0) {
      store.scheduleTemplates[index] = { ...store.scheduleTemplates[index], ...body }
      return json(route, store.scheduleTemplates[index], 'Cap nhat template thanh cong')
    }
  }

  if (path.startsWith('/attendance/schedule-templates/') && method === 'DELETE') {
    const id = parseId(path)
    store.scheduleTemplates = store.scheduleTemplates.filter((item) => item.id !== id)
    return json(route, null, 'Xoa template thanh cong')
  }

  if (path === '/attendance/holidays' && method === 'GET') {
    return json(route, pageResult(store.holidays))
  }

  if (path === '/attendance/holidays' && method === 'POST') {
    const body = safeJson(route)
    const record = {
      id: ++store.nextId,
      holidayName: String(body.holidayName ?? body.name ?? 'Ngay nghi moi'),
      fromDate: String(body.fromDate ?? body.startDate ?? '2026-05-01'),
      toDate: String(body.toDate ?? body.endDate ?? '2026-05-01'),
      isPaid: Boolean(body.isPaid ?? false),
    }
    store.holidays.unshift(record)
    return json(route, record, 'Tao ngay nghi thanh cong', 201)
  }

  if (path.startsWith('/attendance/holidays/') && method === 'GET') {
    return json(route, store.holidays.find((item) => item.id === parseId(path)) ?? store.holidays[0])
  }

  if (path.startsWith('/attendance/holidays/') && method === 'PUT') {
    const id = parseId(path)
    const body = safeJson(route)
    const index = store.holidays.findIndex((item) => item.id === id)
    if (index >= 0) {
      store.holidays[index] = { ...store.holidays[index], ...body }
      return json(route, store.holidays[index], 'Cap nhat ngay nghi thanh cong')
    }
  }

  if (path.startsWith('/attendance/holidays/') && method === 'DELETE') {
    const id = parseId(path)
    store.holidays = store.holidays.filter((item) => item.id !== id)
    return json(route, null, 'Xoa ngay nghi thanh cong')
  }

  if (path === '/leaves/types' && method === 'GET') {
    return json(route, store.leaveTypes)
  }

  if (path === '/leaves' && method === 'GET') {
    return json(route, pageResult(store.leaves))
  }

  if (path === '/leaves/me' && method === 'GET') {
    const user = getCurrentUser(route) ?? USERS.employee
    const rows = store.leaves.filter((item) => Number(item.employeeId) === user.id)
    return json(route, pageResult(rows))
  }

  if (path === '/leaves' && method === 'POST') {
    const body = safeJson(route)
    const employee = store.employees.find((item) => item.id === Number(body.employeeId)) ?? store.employees[0]
    const leaveType = store.leaveTypes.find((item) => item.code === String(body.leaveTypeCode)) ?? store.leaveTypes[0]
    const record = {
      id: ++store.nextId,
      employeeId: employee.id,
      employeeName: employee.fullName,
      employeeCode: employee.employeeCode,
      departmentName: employee.departmentName ?? '',
      reason: String(body.reason ?? ''),
      leaveType,
      fromDate: String(body.fromDate ?? '2026-04-26'),
      toDate: String(body.toDate ?? '2026-04-26'),
      status: 'pending',
    }
    store.leaves.unshift(record)
    return json(route, record, 'Tao don nghi thanh cong', 201)
  }

  if (path === '/leaves/me' && method === 'POST') {
    const user = getCurrentUser(route) ?? USERS.employee
    const employee = store.employees.find((item) => item.id === user.id) ?? store.employees[1]
    const body = safeJson(route)
    const leaveType = store.leaveTypes.find((item) => item.code === String(body.leaveTypeCode)) ?? store.leaveTypes[0]
    const record = {
      id: ++store.nextId,
      employeeId: employee.id,
      employeeName: employee.fullName,
      employeeCode: employee.employeeCode,
      departmentName: employee.departmentName ?? '',
      reason: String(body.reason ?? ''),
      leaveType,
      fromDate: String(body.fromDate ?? '2026-04-26'),
      toDate: String(body.toDate ?? '2026-04-26'),
      status: 'pending',
    }
    store.leaves.unshift(record)
    return json(route, record, 'Gui don thanh cong', 201)
  }

  if (path.startsWith('/leaves/') && path.endsWith('/approve') && method === 'PUT') {
    const id = parseId(path)
    const leave = store.leaves.find((item) => Number(item.id) === id)
    if (leave) leave.status = 'approved'
    return json(route, leave ?? null, 'Da phe duyet don nghi')
  }

  if (path.startsWith('/leaves/') && path.endsWith('/reject') && method === 'PUT') {
    const id = parseId(path)
    const leave = store.leaves.find((item) => Number(item.id) === id)
    if (leave) leave.status = 'rejected'
    return json(route, leave ?? null, 'Da tu choi don nghi')
  }

  if (path.startsWith('/leaves/') && method === 'GET') {
    return json(route, store.leaves.find((item) => Number(item.id) === parseId(path)) ?? store.leaves[0])
  }

  if (path.startsWith('/leaves/') && method === 'DELETE') {
    const id = parseId(path)
    store.leaves = store.leaves.filter((item) => Number(item.id) !== id)
    return json(route, null, 'Xoa don nghi thanh cong')
  }

  if (path === '/reports/monthly-attendance/export' && method === 'GET') {
    const year = url.searchParams.get('year') ?? '2026'
    const month = String(url.searchParams.get('month') ?? '4').padStart(2, '0')
    const body = Buffer.from(`Employee\tDate\tStatus\nEMP002\t${year}-${month}-21\tPRESENT\n`)
    return raw(route, body, 'application/vnd.ms-excel', {
      'content-disposition': `attachment; filename="attendance-${year}-${month}.xls"`,
    })
  }

  return json(route, {}, 'Mocked fallback response')
}

export async function installMockApi(page: Page) {
  const store = createMockStore()
  await page.context().route('**/api/**', async (route) => handleApiRoute(route, store))
  return store
}

export async function seedAuthenticatedSession(page: Page, role: RoleKey) {
  const user = USERS[role]
  await page.addInitScript(
    ({ token, refreshToken }) => {
      window.localStorage.setItem('token', token)
      window.localStorage.setItem('refreshToken', refreshToken)
    },
    { token: user.token, refreshToken: user.refreshToken },
  )
}

export async function enableFaceDetectionStub(page: Page) {
  await page.addInitScript((descriptor) => {
    window.__ATTENDANCE_E2E_FACE__ = {
      async loadModels() {},
      async setupCamera() {},
      async detectFace() {
        return {
          detection: {
            score: 0.99,
          },
          descriptor: new Float32Array(descriptor),
        }
      },
      stopCamera() {},
    }
  }, FACE_DESCRIPTOR)
}

export { USERS, VALID_PASSWORD }
