<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <Sidebar />
    <div class="min-h-screen pl-64">
      <Header />
      <main class="px-6 py-6 lg:px-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
