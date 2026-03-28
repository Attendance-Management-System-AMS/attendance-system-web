import { attendanceApi } from '@/services/attendance.service';
import type { Attendance } from '@/types/attendance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export function useAttendance() {
    const queryClient = useQueryClient()

    // Query danh sách chấm công hôm nay
    const attendanceQuery = useQuery<Attendance[]>({
        queryKey: ['attendance', 'today'],
        queryFn: async () => {
            const response = await attendanceApi.getToday()
            if (response.data && response.data.success && response.data.result) {
                return response.data.result || []
            }
            return []
        },
        staleTime: 1000 * 60 * 1, // 1 phút
    })

    // Mutation check-in bằng khuôn mặt
    const checkIn = useMutation({
        mutationFn: (descriptor: number[]) => attendanceApi.checkInByFace(descriptor).then(data => data.result),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance', 'today'] })
        },
    })

    return {
        attendanceQuery,
        checkIn,
    }
}
