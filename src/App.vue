<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <!-- Hiển thị Sidebar & Header nếu không có flag hideLayout trong meta của route -->
    <template v-if="!route.meta.hideLayout">
      <AppSidebar />
      <div class="min-h-screen pl-64 transition-all duration-300">
        <AppHeader />
        <main class="px-6 py-6 lg:px-8">
          <RouterView />
        </main>
      </div>
    </template>

    <!-- Chỉ hiển thị nội dung trang (như Kiosk) nếu có flag hideLayout -->
    <template v-else>
      <RouterView />
    </template>
  </div>
</template>
