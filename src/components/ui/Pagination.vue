<script setup lang="ts">
import { computed } from 'vue'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from './pagination'
import { Button } from './button'

const props = withDefaults(defineProps<{
  modelValue: number
  totalPages: number
  totalElements: number
  pageSize: number
  label?: string
}>(), {
  label: 'bản ghi'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

// Shadcn Pagination uses 1-based indexing for internal state
const currentPage = computed({
  get: () => props.modelValue + 1,
  set: (val) => emit('update:modelValue', val - 1)
})

const endRange = computed(() => Math.min((props.modelValue + 1) * props.pageSize, props.totalElements))
</script>

<template>
  <div v-if="totalElements > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 pl-6 pr-0 py-3 border-t border-border bg-slate-50/30 dark:bg-slate-900/10">
    <!-- Info Section -->
    <div class="flex items-center gap-2.5">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hiển thị</span>
      <div class="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 border border-border/50">
        <span class="text-xs font-bold text-indigo-600 font-mono">{{ endRange }}</span>
        <span class="text-[10px] text-slate-300 font-bold">/</span>
        <span class="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">{{ totalElements }}</span>
      </div>
    </div>

    <!-- Pagination Section -->
    <Pagination
      v-model:page="currentPage"
      :total="totalElements"
      :items-per-page="pageSize"
      :sibling-count="1"
      show-edges
    >
      <PaginationContent v-slot="{ items }" class="flex items-center gap-0.5">
        <PaginationFirst />
        <PaginationPrevious />

        <template v-for="(item, index) in items">
          <PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
            <Button
              class="w-8 h-8 p-0 text-xs font-bold transition-all"
              :variant="item.value === currentPage ? 'default' : 'ghost'"
              :class="item.value === currentPage ? 'shadow-md shadow-indigo-200 dark:shadow-none bg-indigo-600' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'"
              size="sm"
            >
              {{ item.value }}
            </Button>
          </PaginationItem>
          <PaginationEllipsis v-else :key="item.type" :index="index" />
        </template>

        <PaginationNext />
        <PaginationLast />
      </PaginationContent>
    </Pagination>
  </div>
</template>
