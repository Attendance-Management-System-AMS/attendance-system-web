import api from '@/shared/api/client'
import type { ApiResponse, Page } from '@/shared/types/api'
import type {
  CreateOvertimeRequest,
  OvertimeQueryParams,
  OvertimeRequest,
} from '@/modules/overtime/types/overtime.types'

function normalizeTime(value: string) {
  return value.length === 5 ? `${value}:00` : value
}

function buildBody(data: CreateOvertimeRequest) {
  return {
    ...(data.employeeId ? { employeeId: data.employeeId } : {}),
    workDate: data.workDate,
    startTime: normalizeTime(data.startTime),
    endTime: normalizeTime(data.endTime),
    reason: data.reason?.trim() || null,
  }
}

export const overtimeApi = {
  getAll: (params?: OvertimeQueryParams) =>
    api.get<ApiResponse<Page<OvertimeRequest>>>('/overtime-requests', { params }),
  getMe: (params?: OvertimeQueryParams) =>
    api.get<ApiResponse<Page<OvertimeRequest>>>('/overtime-requests/me', { params }),
  create: (data: CreateOvertimeRequest) =>
    api.post<ApiResponse<OvertimeRequest>>('/overtime-requests', buildBody(data)),
  createMe: (data: CreateOvertimeRequest) =>
    api.post<ApiResponse<OvertimeRequest>>('/overtime-requests/me', buildBody(data)),
  approve: (id: string | number, note?: string) =>
    api.put<ApiResponse<OvertimeRequest>>(`/overtime-requests/${id}/approve`, {
      note: note?.trim() || null,
    }),
  reject: (id: string | number, note?: string) =>
    api.put<ApiResponse<OvertimeRequest>>(`/overtime-requests/${id}/reject`, {
      note: note?.trim() || null,
    }),
  cancel: (id: string | number) =>
    api.delete<ApiResponse<OvertimeRequest>>(`/overtime-requests/${id}`),
  cancelMe: (id: string | number) =>
    api.delete<ApiResponse<OvertimeRequest>>(`/overtime-requests/me/${id}`),
}
