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
  <div v-if="totalElements > 0" class="flex flex-col items-center justify-between gap-4 border-t border-border bg-surface px-4 py-3 sm:flex-row sm:pl-6 sm:pr-0">
    <!-- Info Section -->
    <div class="flex items-center gap-2.5">
      <span class="text-[10px] font-medium tracking-normal text-tertiary-text">Hiển thị</span>
      <div class="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-elevated px-3 py-1">
        <span class="font-mono text-xs font-semibold text-primary">{{ endRange }}</span>
        <span class="text-[10px] font-semibold text-tertiary-text">/</span>
        <span class="font-mono text-xs font-semibold text-secondary-text">{{ totalElements }}</span>
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
              :class="item.value === currentPage ? 'shadow-sm' : 'text-secondary-text hover:bg-elevated hover:text-primary-text'"
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
