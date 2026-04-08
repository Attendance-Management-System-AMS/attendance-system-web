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
            <TableRow class="bg-slate-50/50 dark:bg-slate-900/50">
              <TableHead
                v-for="col in columns"
                :key="col.key"
                :class="[
                  'text-[11px] font-bold uppercase tracking-wider text-slate-500',
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
              <TableCell :colspan="columns.length" class="py-16 text-center text-sm text-slate-400">
                Không có dữ liệu
              </TableCell>
            </TableRow>
            <TableRow
              v-for="(row, idx) in rows"
              :key="idx"
              class="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50"
            >
              <TableCell
                v-for="col in columns"
                :key="col.key"
                :class="[
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                ]"
              >
                <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]" :index="idx">
                  <span class="text-sm text-slate-700 dark:text-slate-300">
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
