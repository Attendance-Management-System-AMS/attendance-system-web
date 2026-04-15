<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import AppNavbar from './AppNavbar.vue'
import MobileHeader from './MobileHeader.vue'
import MobileBottomNav from './MobileBottomNav.vue'

const route = useRoute()
const sidebarCollapsed = ref(false)
const isMobileSidebarOpen = ref(false)

// Đóng sidebar khi đổi route trên mobile
watch(() => route.path, () => {
  isMobileSidebarOpen.value = false
})

const isEmployeePortal = computed(() => {
  return route.path.startsWith('/my')
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}
</script>

<template>
  <div
    class="flex min-h-screen bg-linear-to-brm-slate-50 via-white to-indigo-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30">
    
    <!-- Mobile Sidebar Backdrop -->
    <div 
      v-if="isMobileSidebarOpen && !isEmployeePortal" 
      class="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
      @click="isMobileSidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <AppSidebar 
      :class="[
        'z-50 lg:flex transition-all duration-300',
        !isEmployeePortal && isMobileSidebarOpen ? 'fixed translate-x-0' : 'hidden lg:flex'
      ]" 
      :collapsed="sidebarCollapsed" 
      @toggle="toggleSidebar" 
    />

    <!-- Mobile Bottom Navigation - Only show in Employee Portal (/my/*) -->
    <MobileBottomNav v-if="isEmployeePortal" />

    <!-- Main area -->
    <div :class="[
      'flex flex-1 flex-col min-w-0 transition-all duration-300 ease-in-out',
      'lg:pl-60', // Desktop padding
      sidebarCollapsed ? 'lg:pl-14' : 'lg:pl-60',
      'pl-0', // Mobile padding
    ]">
      <!-- Mobile Header -->
      <MobileHeader :show-menu="!isEmployeePortal" @menu-click="toggleMobileSidebar" />

      <!-- Navbar (Hidden on mobile for all) -->
      <AppNavbar class="hidden lg:flex" @toggle-sidebar="toggleSidebar" />

      <!-- Page content -->
      <main :class="['flex-1 overflow-y-auto px-4 py-6 lg:px-8', isEmployeePortal ? 'pb-24 lg:pb-6' : '']">
        <router-view />
      </main>
    </div>
  </div>
</template>
