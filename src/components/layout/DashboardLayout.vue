<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppNavbar from './AppNavbar.vue'

const sidebarCollapsed = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div
    class="flex min-h-screen bg-linear-to-brm-slate-50 via-white to-indigo-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30">
    <!-- Sidebar -->
    <AppSidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />

    <!-- Main area -->
    <div :class="[
      'flex flex-1 flex-col min-w-0 transition-all duration-300 ease-in-out',
      sidebarCollapsed ? 'pl-14' : 'pl-60',
    ]">
      <!-- Navbar -->
      <AppNavbar @toggle-sidebar="toggleSidebar" />

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
        <router-view />
      </main>
    </div>
  </div>
</template>
