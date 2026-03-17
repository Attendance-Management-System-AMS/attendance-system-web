<script setup lang="ts">
import { ref } from 'vue'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { onClickOutside } from '@vueuse/core'

const props = defineProps<{
  editTo?: string
  viewTo?: string
  itemId?: string | number
}>()

const emit = defineEmits<{
  (e: 'delete', id: string | number): void
}>()

const isOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const router = useRouter()

onClickOutside(menuRef, () => {
  isOpen.value = false
})

const handleEdit = () => {
  isOpen.value = false
  if (props.editTo) router.push(props.editTo)
}

const handleView = () => {
  isOpen.value = false
  if (props.viewTo) router.push(props.viewTo)
}

const handleDelete = () => {
  isOpen.value = false
  if (props.itemId !== undefined) emit('delete', props.itemId)
}
</script>

<template>
  <div ref="menuRef" class="relative">
    <button
      @click.stop="isOpen = !isOpen"
      class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-300"
    >
      <MoreHorizontal class="h-4 w-4" />
    </button>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden dark:bg-slate-900 dark:border-slate-800"
      >
        <div class="p-1">
          <button
            v-if="viewTo"
            @click="handleView"
            class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Eye class="h-4 w-4 text-slate-400" />
            Xem chi tiết
          </button>
          <button
            v-if="editTo"
            @click="handleEdit"
            class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Pencil class="h-4 w-4 text-slate-400" />
            Chỉnh sửa
          </button>
        </div>
        <div class="border-t border-slate-100 dark:border-slate-800 p-1">
          <button
            @click="handleDelete"
            class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 class="h-4 w-4" />
            Xóa
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
