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
      class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-24 dark:border-slate-800 dark:bg-slate-900"
    >
      <div
        class="flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 mb-4"
      >
        <Construction class="h-8 w-8 text-indigo-400" />
      </div>
      <h3 class="text-base font-bold text-slate-900 dark:text-white">Đang phát triển</h3>
      <p class="mt-1.5 text-sm text-slate-400 text-center max-w-xs">
        Tính năng <span class="font-semibold text-indigo-600">{{ title }}</span> đang được hoàn
        thiện theo tiêu chuẩn Enterprise.
      </p>
    </div>
  </div>
</template>
