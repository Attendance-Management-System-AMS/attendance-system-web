<script setup lang="ts">
defineProps<{
  columns: { key: string; label: string; align?: 'left' | 'center' | 'right' }[]
  rows: Record<string, unknown>[]
  loading?: boolean
}>()
</script>

<template>
  <div
    class="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900"
  >
    <!-- Loading overlay -->
    <div v-if="loading" class="flex h-64 items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
    </div>

    <template v-else>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
              <th
                v-for="col in columns"
                :key="col.key"
                :class="[
                  'px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400',
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                ]"
              >
                {{ col.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-if="rows.length === 0"
            >
              <td :colspan="columns.length" class="py-16 text-center text-sm text-slate-400">
                Không có dữ liệu
              </td>
            </tr>
            <tr
              v-for="(row, idx) in rows"
              :key="idx"
              class="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50"
            >
              <td
                v-for="col in columns"
                :key="col.key"
                :class="[
                  'px-4 py-3',
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                ]"
              >
                <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                  <span class="text-sm text-slate-700 dark:text-slate-300">
                    {{ row[col.key] as string }}
                  </span>
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
