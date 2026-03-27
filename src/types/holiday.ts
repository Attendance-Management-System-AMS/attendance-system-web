export interface Holiday {
  id: string | number
  holidayName?: string
  fromDate?: string // YYYY-MM-DD
  toDate?: string // YYYY-MM-DD
  isPaid?: boolean
}

export type CreateHoliday = {
  holidayName: string
  fromDate: string
  toDate: string
  isPaid: boolean
}

