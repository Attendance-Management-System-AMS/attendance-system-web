import { describe, expect, it } from 'vitest'
import {
  getUserRoleLabel,
  hasAnyRoleAccess,
  permissionScreens,
  roleGroups,
} from './access-control'

describe('access-control', () => {
  it('prioritizes the highest-privilege role when resolving the display label', () => {
    expect(getUserRoleLabel(['ROLE_EMPLOYEE', 'ROLE_ADMIN'])).toBe('Quản trị viên')
    expect(getUserRoleLabel(['ROLE_MANAGER'])).toBe('Quản lý')
  })

  it('matches access only when the current user has one of the allowed roles', () => {
    expect(hasAnyRoleAccess(['ROLE_MANAGER'], roleGroups.operations)).toBe(true)
    expect(hasAnyRoleAccess(['ROLE_MANAGER'], roleGroups.adminHr)).toBe(false)
  })

  it('keeps restricted screens out of manager and HR access where required', () => {
    const scheduleAssignments = permissionScreens.find((screen) => screen.key === 'schedule-assignments')
    const permissions = permissionScreens.find((screen) => screen.key === 'permissions')

    expect(scheduleAssignments?.access.ROLE_MANAGER).toBe('none')
    expect(permissions?.access.ROLE_HR).toBe('none')
    expect(permissions?.access.ROLE_ADMIN).toBe('full')
  })
})
