<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import {
    DialogRoot,
    DialogPortal,
    DialogOverlay,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from 'reka-ui'
import type { Department } from '@/modules/departments/types/department.types'

const props = defineProps<{
    open: boolean
    department: Department | null
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'updated', id: string | number, data: Partial<Department>): void
}>()

const name = ref('')
const description = ref('')
const status = ref<'ACTIVE' | 'INACTIVE'>('ACTIVE')
const loading = ref(false)
const error = ref<string | null>(null)

watchEffect(() => {
    if (props.department && props.open) {
        name.value = props.department.name || ''
        description.value = props.department.description || ''
        status.value = props.department.status || 'ACTIVE'
    }
})

const handleSubmit = async () => {
    if (!name.value.trim()) {
        error.value = 'Tên phòng ban là bắt buộc'
        return
    }

    if (!props.department?.id) return

    loading.value = true
    error.value = null

    try {
        emit('updated', props.department.id, {
            name: name.value.trim(),
            description: description.value.trim(),
            status: status.value,
        })
        emit('close')
    } catch (err: unknown) {
        error.value = err instanceof Error ? err.message : 'Lỗi khi cập nhật phòng ban'
    } finally {
        loading.value = false
    }
}

const handleClose = () => {
    error.value = null
    emit('close')
}
</script>

<template>
    <DialogRoot :open="open" @update:open="handleClose">
        <DialogPortal>
            <DialogOverlay
                class="fixed inset-0 bg-black/40 backdrop-blur-sm data-[state=open]:animate-overlayShow data-[state=closed]:animate-overlayHide" />

            <DialogContent
                class="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-112.5 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-card p-6 shadow-2xl focus:outline-none data-[state=open]:animate-contentShow data-[state=closed]:animate-contentHide dark:bg-card">
                <DialogTitle class="m-0 text-lg font-medium text-primary-text dark:text-primary-text">
                    Sửa phòng ban
                </DialogTitle>
                <DialogDescription class="mb-5 mt-2 leading-normal text-secondary-text dark:text-tertiary-text">
                    Cập nhật thông tin phòng ban. Nhấn "Cập nhật" khi hoàn tất.
                </DialogDescription>

                <form @submit.prevent="handleSubmit" class="space-y-5">
                    <div>
                        <label class="mb-1 block text-sm font-medium text-primary-text dark:text-tertiary-text">
                            Tên phòng ban <span class="text-red-500">*</span>
                        </label>
                        <input v-model="name" required
                            class="w-full rounded-lg border border-border-standard px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-ring/40 dark:border-border dark:bg-elevated dark:text-primary-text dark:focus:border-primary"
                            placeholder="Ví dụ: Marketing" />
                    </div>

                    <div>
                        <label class="mb-1 block text-sm font-medium text-primary-text dark:text-tertiary-text">Mô tả</label>
                        <textarea v-model="description" rows="3"
                            class="w-full rounded-lg border border-border-standard px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-ring/40 dark:border-border dark:bg-elevated dark:text-primary-text dark:focus:border-primary"
                            placeholder="Mô tả ngắn về chức năng phòng ban..."></textarea>
                    </div>

                    <div>
                        <label class="mb-1 block text-sm font-medium text-primary-text dark:text-tertiary-text">
                            Trạng thái <span class="text-red-500">*</span>
                        </label>
                        <select v-model="status"
                            class="w-full rounded-lg border border-border-standard px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-ring/40 dark:border-border dark:bg-elevated dark:text-primary-text dark:focus:border-primary">
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="INACTIVE">Ngừng hoạt động</option>
                        </select>
                    </div>

                    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

                    <div class="mt-6 flex justify-end gap-3">
                        <DialogClose as-child>
                            <button type="button"
                                class="rounded-lg border border-border-standard px-4 py-2 text-sm font-medium text-primary-text hover:bg-surface dark:border-border dark:text-tertiary-text dark:hover:bg-elevated"
                                :disabled="loading">
                                Hủy
                            </button>
                        </DialogClose>

                        <button type="submit"
                            class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary disabled:opacity-50"
                            :disabled="loading">
                            {{ loading ? 'Đang cập nhật...' : 'Cập nhật' }}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>
