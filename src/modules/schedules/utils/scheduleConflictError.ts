type RecordLike = Record<string, unknown>

interface ScheduleConflictDetail {
  dayOfWeek: number
  newShiftName: string
  existingShiftName: string
}

const isRecord = (value: unknown): value is RecordLike =>
  typeof value === 'object' && value !== null

const toConflictDetail = (value: unknown): ScheduleConflictDetail | null => {
  if (!isRecord(value)) return null

  const { dayOfWeek, newShiftName, existingShiftName } = value
  if (typeof dayOfWeek !== 'number' || typeof newShiftName !== 'string' || typeof existingShiftName !== 'string') {
    return null
  }

  return { dayOfWeek, newShiftName, existingShiftName }
}

const getResponsePayload = (error: unknown): unknown => {
  if (!isRecord(error) || !isRecord(error.response) || !isRecord(error.response.data)) {
    return undefined
  }

  return error.response.data.result ?? error.response.data.data
}

const formatDayOfWeek = (dayOfWeek: number) => (dayOfWeek === 7 ? 'Chủ nhật' : `Thứ ${dayOfWeek}`)

export const formatScheduleConflictError = (error: unknown, prefix = 'Xung đột lịch'): string | null => {
  const payload = getResponsePayload(error)
  if (!Array.isArray(payload)) return null

  const details = payload
    .map(toConflictDetail)
    .filter((detail): detail is ScheduleConflictDetail => detail !== null)

  if (details.length === 0) return null

  const conflicts = details
    .map((conflict) => `${formatDayOfWeek(conflict.dayOfWeek)}: ${conflict.newShiftName} trùng với ${conflict.existingShiftName}`)
    .join(', ')

  return `${prefix}: ${conflicts}`
}
