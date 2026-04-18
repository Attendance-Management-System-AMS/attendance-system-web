<script setup lang="ts" generic="T extends Record<string, any>">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

import { Skeleton } from './skeleton'

defineProps<{
  columns: { key: string; label: string; align?: 'left' | 'center' | 'right'; class?: string }[]
  rows: T[]
  loading?: boolean
}>()
</script>

<template>
  <div class="overflow-hidden">
    <!-- Loading skeleton -->
    <div v-if="loading" class="p-4 space-y-4">
      <div v-for="i in 6" :key="i" class="flex items-center gap-4">
        <Skeleton class="h-10 w-full" />
      </div>
    </div>

    <template v-else>
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow class="bg-muted/60">
              <TableHead
                v-for="col in columns"
                :key="col.key"
                :class="[
                  'text-xs font-medium text-muted-foreground',
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                ]"
              >
                {{ col.label }}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-if="rows.length === 0"
            >
              <TableCell :colspan="columns.length" class="py-16 text-center text-sm text-muted-foreground">
                Không có dữ liệu
              </TableCell>
            </TableRow>
            <TableRow
              v-for="(row, idx) in rows"
              :key="idx"
              class="border-b border-border hover:bg-muted/40 transition-colors"
            >
              <TableCell
                v-for="col in columns"
                :key="col.key"
                :class="[
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                ]"
              >
                <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]" :index="idx">
                  <span class="text-sm text-foreground">
                    {{ row[col.key] }}
                  </span>
                </slot>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </template>
  </div>
</template>
