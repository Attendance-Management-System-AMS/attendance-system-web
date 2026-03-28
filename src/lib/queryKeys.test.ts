import { describe, it, expect } from 'vitest'
import { queryKeys } from './queryKeys'

describe('queryKeys', () => {
  it('employees all/detail khớp tuple cache cũ', () => {
    expect(queryKeys.employees.all()).toEqual(['employees'])
    expect(queryKeys.employees.detail(42)).toEqual(['employee', 42])
  })

  it('shifts/holidays giữ prefix attendance-*', () => {
    expect(queryKeys.shifts.all()).toEqual(['attendance-shifts'])
    expect(queryKeys.shifts.detail(1)).toEqual(['attendance-shift', 1])
    expect(queryKeys.holidays.detail('x')).toEqual(['attendance-holiday', 'x'])
  })
})
