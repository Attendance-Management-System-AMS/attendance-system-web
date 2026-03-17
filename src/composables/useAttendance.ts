import { attendanceApi } from '@/services/attendance.service';
import type { Attendance } from '@/types/attendance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export function useAttendance() {
    const queryClient = useQueryClient()

    // Query danh sách
    const attendanceQuery = useQuery<Attendance[]>({
        queryKey: ['attendance'],
        queryFn: async () => {
            const response = await attendanceApi.getAll()
            if (response.data && response.data.success && response.data.result) {
                return response.data.result.content || []
            }
            return []
        },
        staleTime: 1000 * 60 * 1, // 1 phút
    })

    // Mutation check-in
    const checkIn = useMutation({
        mutationFn: (descriptor: number[]) => attendanceApi.checkIn(descriptor).then(data => data.result),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] })
        },
    })

    return {
        attendanceQuery,
        checkIn,
    }
}
