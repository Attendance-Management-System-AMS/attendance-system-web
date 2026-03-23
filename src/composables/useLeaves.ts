import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { leaveApi } from '@/services/leave.service'
import type { CreateLeaveRequest, LeaveRequest } from '@/types/leave'

export function useLeaves() {
  const queryClient = useQueryClient()

  const leavesQuery = useQuery<LeaveRequest[]>({
    queryKey: ['leaves'],
    queryFn: async () => {
      const response = await leaveApi.getAll()
      const result = response.data?.result as LeaveRequest[] | { content?: LeaveRequest[] } | undefined
      if (Array.isArray(result)) return result
      if (result && Array.isArray(result.content)) return result.content
      return []
    },
    staleTime: 1000 * 60 * 1,
  })

  const createLeave = useMutation({
    mutationFn: (data: CreateLeaveRequest) => leaveApi.create(data).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  })

  const deleteLeave = useMutation({
    mutationFn: (id: string | number) => leaveApi.delete(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  })

  const approveLeave = useMutation({
    mutationFn: (id: string | number) => leaveApi.approve(id).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  })

  const rejectLeave = useMutation({
    mutationFn: (id: string | number) => leaveApi.reject(id).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  })

  return {
    leavesQuery,
    createLeave,
    deleteLeave,
    approveLeave,
    rejectLeave,
  }
}
