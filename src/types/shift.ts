export interface Shift {
  id: string | number
  name?: string
  startTime?: string // HH:mm:ss
  endTime?: string // HH:mm:ss
  breakStart?: string | null // HH:mm:ss
  breakEnd?: string | null // HH:mm:ss
  gracePeriod?: number | null
  createdAt?: string
}

export type CreateShift = {
  name: string
  startTime: string // HH:mm:ss
  endTime: string // HH:mm:ss
  breakStart?: string | null
  breakEnd?: string | null
  gracePeriod?: number | null
}

