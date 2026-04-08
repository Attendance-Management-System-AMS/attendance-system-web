<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppNavbar from './AppNavbar.vue'
import MobileHeader from './MobileHeader.vue'
import MobileBottomNav from './MobileBottomNav.vue'
const sidebarCollapsed = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div
    class="flex min-h-screen bg-linear-to-brm-slate-50 via-white to-indigo-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30">
    <!-- Sidebar (Hidden on mobile) -->
    <AppSidebar class="hidden lg:flex" :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />

    <!-- Mobile Bottom Navigation -->
    <MobileBottomNav />

    <!-- Main area -->
    <div :class="[
      'flex flex-1 flex-col min-w-0 transition-all duration-300 ease-in-out',
      'lg:pl-60', // Desktop padding
      sidebarCollapsed ? 'lg:pl-14' : 'lg:pl-60',
      'pl-0', // Mobile padding
    ]">
      <!-- Mobile Header -->
      <MobileHeader />

      <!-- Navbar (Hidden on mobile for all) -->
      <AppNavbar class="hidden lg:flex" @toggle-sidebar="toggleSidebar" />

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
        <router-view />
      </main>
    </div>
  </div>
</template>
