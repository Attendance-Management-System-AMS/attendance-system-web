<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Construction } from 'lucide-vue-next'
import PageHeader from '@/shared/ui/PageHeader.vue'

const route = useRoute()

const title = computed(() =>
  typeof route.meta.title === 'string' ? route.meta.title : 'Tính năng',
)
</script>

<template>
  <div class="space-y-6">
    <PageHeader :title="title" />

    <div
      class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border-standard bg-card py-24 dark:border-border dark:bg-card"
    >
      <div
        class="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/10 mb-4"
      >
        <Construction class="h-8 w-8 text-primary" />
      </div>
      <h3 class="text-base font-bold text-primary-text dark:text-primary-text">Đang phát triển</h3>
      <p class="mt-1.5 text-sm text-tertiary-text text-center max-w-xs">
        Tính năng <span class="font-semibold text-primary">{{ title }}</span> đang được hoàn
        thiện theo tiêu chuẩn Enterprise.
      </p>
    </div>
  </div>
</template>
