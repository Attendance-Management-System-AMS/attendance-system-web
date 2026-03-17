<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'

const route = useRoute()
</script>

<template>
  <template v-if="!route.meta.hideLayout">
      <RouterView />
  </template>
  <template v-else>
    <RouterView />
  </template>
</template>
