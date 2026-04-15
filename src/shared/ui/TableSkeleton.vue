<script setup lang="ts">
import SkeletonLoader from './SkeletonLoader.vue'

interface Props {
  rows?: number
  cols?: number
  hasActionColumn?: boolean
  hasAvatarColumn?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  rows: 5,
  cols: 4,
  hasActionColumn: false,
  hasAvatarColumn: false
})
</script>

<template>
  <div class="w-full overflow-hidden">
    <table class="w-full">
      <thead>
        <tr class="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <th v-if="props.hasAvatarColumn" class="px-4 py-3 text-left w-12">
             <SkeletonLoader width="24px" height="12px" rounded="full" />
          </th>
          <th v-for="c in props.cols" :key="c" class="px-4 py-3 text-left">
            <SkeletonLoader width="60%" height="12px" rounded="full" />
          </th>
          <th v-if="props.hasActionColumn" class="px-4 py-3 text-right w-20">
            <SkeletonLoader width="40px" height="12px" rounded="full" className="ml-auto" />
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
        <tr v-for="r in props.rows" :key="r" class="bg-white dark:bg-slate-900">
          <!-- Avatar column -->
          <td v-if="props.hasAvatarColumn" class="px-4 py-3">
            <SkeletonLoader width="32px" height="32px" rounded="full" />
          </td>
          
          <!-- Data columns -->
          <td v-for="c in props.cols" :key="c" class="px-4 py-3">
            <div class="space-y-2">
              <SkeletonLoader :width="c === 1 ? '80%' : '60%'" height="14px" rounded="md" />
              <SkeletonLoader v-if="c === 1" width="40%" height="10px" rounded="md" className="opacity-60" />
            </div>
          </td>
          
          <!-- Action column -->
          <td v-if="props.hasActionColumn" class="px-4 py-3 text-right">
            <div class="flex justify-end gap-2">
              <SkeletonLoader width="24px" height="24px" rounded="lg" />
              <SkeletonLoader width="24px" height="24px" rounded="lg" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
