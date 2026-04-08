<script setup lang="ts">
import { ref, nextTick, watch, onBeforeUnmount } from 'vue'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const props = defineProps<{
  editTo?: string
  viewTo?: string
  itemId?: string | number
}>()

const emit = defineEmits<{
  (e: 'edit', id: string | number): void
  (e: 'delete', id: string | number): void
}>()

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const router = useRouter()
const menuStyle = ref<Record<string, string>>({})

const MENU_WIDTH = 192
const VIEWPORT_PADDING = 8
const MENU_GAP = 6

const updateMenuPosition = () => {
  const trigger = triggerRef.value
  if (!trigger) return

  const rect = trigger.getBoundingClientRect()
  const dropdownHeight = dropdownRef.value?.offsetHeight ?? 170
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let left = rect.right - MENU_WIDTH
  if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING
  if (left + MENU_WIDTH > viewportWidth - VIEWPORT_PADDING) {
    left = viewportWidth - VIEWPORT_PADDING - MENU_WIDTH
  }

  let top = rect.bottom + MENU_GAP
  if (top + dropdownHeight > viewportHeight - VIEWPORT_PADDING) {
    top = rect.top - dropdownHeight - MENU_GAP
  }
  if (top < VIEWPORT_PADDING) top = VIEWPORT_PADDING

  menuStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    width: `${MENU_WIDTH}px`,
  }
}

const closeOnOutsideClick = (event: MouseEvent) => {
  if (!isOpen.value) return
  const target = event.target as Node | null
  if (!target) return
  if (triggerRef.value?.contains(target) || dropdownRef.value?.contains(target)) return
  isOpen.value = false
}

const closeOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') isOpen.value = false
}

const toggleMenu = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await nextTick()
    updateMenuPosition()
  }
}

watch(isOpen, async (open) => {
  if (open) {
    await nextTick()
    updateMenuPosition()
  }
})

window.addEventListener('mousedown', closeOnOutsideClick)
window.addEventListener('keydown', closeOnEscape)
window.addEventListener('resize', updateMenuPosition)
window.addEventListener('scroll', updateMenuPosition, true)

onBeforeUnmount(() => {
  window.removeEventListener('mousedown', closeOnOutsideClick)
  window.removeEventListener('keydown', closeOnEscape)
  window.removeEventListener('resize', updateMenuPosition)
  window.removeEventListener('scroll', updateMenuPosition, true)
})

const handleEdit = () => {
  isOpen.value = false
  if (props.editTo) {
    router.push(props.editTo)
  } else if (props.itemId !== undefined) {
    emit('edit', props.itemId)
  }
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
  <!-- Full-width wrapper to push trigger flush-right in table cells -->
  <div class="relative flex w-full justify-end -mr-4">
    <button
      ref="triggerRef"
      @click.stop="toggleMenu"
      class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-300"
    >
      <MoreHorizontal class="h-4 w-4" />
    </button>
  </div>

  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        ref="dropdownRef"
        v-if="isOpen"
        :style="menuStyle"
        class="z-1000 rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden dark:bg-slate-900 dark:border-slate-800"
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
            v-if="editTo || itemId"
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
  </Teleport>
</template>
