export interface ApiResponse<T> {
  success: boolean
  code: number
  message: string
  result: T
  timestamp: string
}

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
  first?: boolean
  numberOfElements?: number
}
