<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { Check } from 'lucide-vue-next'

const { activeThemeName, THEMES, applyTheme } = useTheme()
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <button
        v-for="t in THEMES"
        :key="t.name"
        @click="applyTheme(t.name)"
        :class="[
          'relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 group',
          activeThemeName === t.name
            ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
            : 'border-slate-100 hover:border-slate-200'
        ]"
      >
        <!-- Color Circle -->
        <div
          class="h-8 w-8 rounded-full shadow-inner flex items-center justify-center transition-transform group-hover:scale-110"
          :style="{ backgroundColor: `oklch(${t.primary})` }"
        >
          <Check v-if="activeThemeName === t.name" class="h-4 w-4 text-white" />
        </div>

        <!-- Label -->
        <span
          :class="[
            'text-[9px] font-black uppercase tracking-widest text-center leading-tight',
            activeThemeName === t.name ? 'text-primary' : 'text-slate-400'
          ]"
        >
          {{ t.label.split(' ')[0] }}
        </span>

        <!-- Indicator -->
        <div
          v-if="activeThemeName === t.name"
          class="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
        ></div>
      </button>
    </div>
  </div>
</template>
