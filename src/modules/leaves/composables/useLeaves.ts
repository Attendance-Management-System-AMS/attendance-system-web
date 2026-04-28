import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/shared/lib/queryKeys'
import { leaveApi } from '@/modules/leaves/api/leave.api'
import type { CreateLeaveRequest, LeaveRequest, LeaveType } from '@/modules/leaves/types/leave.types'

type LeaveListResult =
  | LeaveRequest[]
  | {
      content?: LeaveRequest[]
      items?: LeaveRequest[]
      records?: LeaveRequest[]
      data?: LeaveRequest[]
    }
  | undefined

function normalizeLeave(raw: LeaveRequest): LeaveRequest {
  return {
    ...raw,
    departmentName: raw.departmentName,
    leaveType:
      raw.leaveType ??
      raw.leaveTypeName ??
      raw.leaveTypeCode ??
      (typeof raw.leaveType === 'string' ? raw.leaveType : undefined),
    fromDate: raw.fromDate ?? raw.startDate,
    toDate: raw.toDate ?? raw.endDate,
  }
}

function normalizeLeaveList(result: LeaveListResult): LeaveRequest[] {
  if (Array.isArray(result)) {
    return result.map(normalizeLeave)
  }
  if (result && typeof result === 'object') {
    const container =
      result.content ??
      result.items ??
      result.records ??
      result.data ??
      []

    if (Array.isArray(container)) {
      return container.map(normalizeLeave)
    }
  }
  return []
}

export function useLeaves() {
  const queryClient = useQueryClient()

  const leavesQuery = useQuery<LeaveRequest[]>({
    queryKey: queryKeys.leaves.all(),
    queryFn: async () => {
      const response = await leaveApi.getAll()
      return normalizeLeaveList(response.data?.result as LeaveListResult)
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  })

  const leaveTypesQuery = useQuery<LeaveType[]>({
    queryKey: ['leaves', 'types'],
    queryFn: async () => {
      const response = await leaveApi.getTypes()
      return response.data?.result ?? []
    },
    staleTime: 1000 * 60 * 10,
  })

  const createLeave = useMutation({
    mutationFn: (data: CreateLeaveRequest) => leaveApi.create(data).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all() }),
  })

  const deleteLeave = useMutation({
    mutationFn: (id: string | number) => leaveApi.delete(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all() }),
  })

  const approveLeave = useMutation({
    mutationFn: (id: string | number) => leaveApi.approve(id).then((res) => res.data.result),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all() })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })

  const rejectLeave = useMutation({
    mutationFn: (id: string | number) => leaveApi.reject(id).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all() }),
  })

  return {
    leavesQuery,
    leaveTypesQuery,
    createLeave,
    deleteLeave,
    approveLeave,
    rejectLeave,
  }
}
