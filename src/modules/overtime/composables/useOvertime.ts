import { computed, type Ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { overtimeApi } from '@/modules/overtime/api/overtime.api'
import type {
  CreateOvertimeRequest,
  OvertimeQueryParams,
} from '@/modules/overtime/types/overtime.types'
import { queryKeys } from '@/shared/lib/queryKeys'

type MaybeRefParams = OvertimeQueryParams | Ref<OvertimeQueryParams>

function resolveParams(params?: MaybeRefParams) {
  return computed(() => {
    if (!params) return undefined
    return 'value' in params ? params.value : params
  })
}

export function useOvertimeRequests(params?: MaybeRefParams) {
  const queryClient = useQueryClient()
  const resolvedParams = resolveParams(params)

  const overtimeQuery = useQuery({
    queryKey: computed(() => [...queryKeys.overtime.all(), resolvedParams.value] as const),
    queryFn: () => overtimeApi.getAll(resolvedParams.value).then((res) => res.data.result),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  })

  const createOvertime = useMutation({
    mutationFn: (data: CreateOvertimeRequest) =>
      overtimeApi.create(data).then((res) => res.data.result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.overtime.all() })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })

  const approveOvertime = useMutation({
    mutationFn: ({ id, note }: { id: string | number; note?: string }) =>
      overtimeApi.approve(id, note).then((res) => res.data.result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.overtime.all() })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })

  const rejectOvertime = useMutation({
    mutationFn: ({ id, note }: { id: string | number; note?: string }) =>
      overtimeApi.reject(id, note).then((res) => res.data.result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.overtime.all() })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })

  const cancelOvertime = useMutation({
    mutationFn: (id: string | number) => overtimeApi.cancel(id).then((res) => res.data.result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.overtime.all() })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })

  return {
    overtimeQuery,
    createOvertime,
    approveOvertime,
    rejectOvertime,
    cancelOvertime,
  }
}

export function useMyOvertimeRequests(params?: MaybeRefParams) {
  const queryClient = useQueryClient()
  const resolvedParams = resolveParams(params)

  const overtimeQuery = useQuery({
    queryKey: computed(() => [...queryKeys.overtime.me(), resolvedParams.value] as const),
    queryFn: () => overtimeApi.getMe(resolvedParams.value).then((res) => res.data.result),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  })

  const createOvertime = useMutation({
    mutationFn: (data: CreateOvertimeRequest) =>
      overtimeApi.createMe(data).then((res) => res.data.result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.overtime.me() })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })

  const cancelOvertime = useMutation({
    mutationFn: (id: string | number) => overtimeApi.cancelMe(id).then((res) => res.data.result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.overtime.me() })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })

  return {
    overtimeQuery,
    createOvertime,
    cancelOvertime,
  }
}

export function formatMinutes(minutes?: number | null) {
  const value = minutes ?? 0
  const hours = Math.floor(value / 60)
  const rest = value % 60
  if (!hours) return `${rest}p`
  if (!rest) return `${hours}h`
  return `${hours}h ${rest}p`
}

export function overtimeStatusLabel(status?: string | null) {
  switch (String(status || '').toUpperCase()) {
    case 'APPROVED':
      return 'Đã duyệt'
    case 'REJECTED':
      return 'Từ chối'
    case 'CANCELLED':
      return 'Đã huỷ'
    case 'PENDING':
      return 'Chờ duyệt'
    default:
      return status || 'Không rõ'
  }
}

export function overtimeStatusClass(status?: string | null) {
  switch (String(status || '').toUpperCase()) {
    case 'APPROVED':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    case 'REJECTED':
      return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    case 'CANCELLED':
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    default:
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  }
}
