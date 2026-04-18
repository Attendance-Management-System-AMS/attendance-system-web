<script setup lang="ts">
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { Button } from './button'

defineProps<{
  editTo?: string
  viewTo?: string
  itemId?: string | number
}>()

defineEmits<{
  (e: 'edit', id: string | number): void
  (e: 'delete', id: string | number): void
}>()
</script>

<template>
  <div class="flex justify-end pr-0">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0 text-tertiary-text hover:text-primary-text"
        >
          <MoreHorizontal class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-48">
        <DropdownMenuItem v-if="viewTo" @click="$router.push(viewTo)">
          <Eye class="mr-2 h-4 w-4 text-tertiary-text" />
          <span>Xem chi tiết</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem @click="itemId !== undefined && (editTo ? $router.push(editTo) : $emit('edit', itemId))">
          <Pencil class="mr-2 h-4 w-4 text-tertiary-text" />
          <span>Chỉnh sửa</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          variant="destructive" 
          class="text-rose-600 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-950/30"
          @click="itemId !== undefined && $emit('delete', itemId)"
        >
          <Trash2 class="mr-2 h-4 w-4" />
          <span>Xóa</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
