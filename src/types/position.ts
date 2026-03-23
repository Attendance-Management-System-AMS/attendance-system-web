export interface Position {
  id: string | number
  name: string
  code?: string
  description?: string
  employeeCount?: number
  level?: string
  status?: 'active' | 'inactive' | string
}

export interface CreatePosition {
  name: string
  code?: string
  description?: string
  level?: string
  status?: string
}
