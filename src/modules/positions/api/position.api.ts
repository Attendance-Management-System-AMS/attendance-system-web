import api from '@/shared/api/client'
import type { ApiResponse, Page } from '@/shared/types/api'
import type { CreatePosition, Position } from '@/modules/positions/types/position.types'

export const positionApi = {
  getAll: () => api.get<ApiResponse<Page<Position>>>('/positions'),
  getById: (id: string | number) => api.get<ApiResponse<Position>>(`/positions/${id}`),
  create: (data: CreatePosition) => api.post<ApiResponse<Position>>('/positions', data),
  update: (id: string | number, data: Partial<CreatePosition>) =>
    api.put<ApiResponse<Position>>(`/positions/${id}`, data),
  delete: (id: string | number) => api.delete<ApiResponse<void>>(`/positions/${id}`),
}
