import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/shared/lib/queryKeys'
import { leaveApi } from '@/modules/leaves/api/leave.api'
import type { CreateLeaveRequest, LeaveRequest, LeaveType } from '@/modules/leaves/types/leave.types'

export function useLeaves() {
  const queryClient = useQueryClient()

  const leavesQuery = useQuery<LeaveRequest[]>({
    queryKey: queryKeys.leaves.all(),
    queryFn: async () => {
      const response = await leaveApi.getAll()
      const result = response.data?.result as LeaveRequest[] | { content?: LeaveRequest[] } | undefined
      if (Array.isArray(result)) return result
      if (result && Array.isArray(result.content)) return result.content
      return []
    },
    staleTime: 1000 * 60 * 1,
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
