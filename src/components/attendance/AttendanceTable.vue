<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Attendance } from '@/types/attendance'

defineProps<{
  items: Attendance[]
}>()

const badgeVariantByStatus: Record<Attendance['status'], 'success' | 'warning' | 'secondary'> = {
  'Có mặt': 'success',
  'Đi muộn': 'warning',
  'Nghỉ phép': 'secondary',
}
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Nhân viên</TableHead>
        <TableHead>Giờ vào</TableHead>
        <TableHead>Giờ ra</TableHead>
        <TableHead>Trạng thái</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="record in items" :key="record.id">
        <TableCell>
          <div class="flex items-center gap-3">
            <Avatar class="size-9">
              <AvatarImage :src="record.employee?.avatarUrl ?? ''" :alt="record.employee?.fullName ?? ''" />
              <AvatarFallback>
                {{ (record.employee?.fullName ?? '?').slice(0, 2).toUpperCase() }}
              </AvatarFallback>
            </Avatar>
            <div>
              <p class="text-sm font-medium text-slate-900">
                {{ record.employee?.fullName ?? '—' }}
              </p>
              <p class="text-xs text-slate-500">
                {{ record.employee?.departmentName ?? '—' }} · {{ record.employee?.positionName ?? '—' }}
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell>{{ record.checkIn }}</TableCell>
        <TableCell>{{ record.checkOut }}</TableCell>
        <TableCell>
          <Badge :variant="badgeVariantByStatus[record.status]">
            {{ record.status }}
          </Badge>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>