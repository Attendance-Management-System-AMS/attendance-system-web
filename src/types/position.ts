export interface Position {
  id: string | number
  name: string
  departmentId?: string | number
  departmentName?: string
  code?: string
  description?: string
  employeeCount?: number
  level?: number | string
  status?: 'active' | 'inactive' | string
}

export interface CreatePosition {
  name: string
  departmentId?: string | number
  code?: string
  description?: string
  level?: number | string
  status?: string
}
