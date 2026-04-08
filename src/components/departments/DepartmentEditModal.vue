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
import type { Department } from '@/types/department'

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
                class="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-112.5 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl focus:outline-none data-[state=open]:animate-contentShow data-[state=closed]:animate-contentHide dark:bg-slate-900">
                <DialogTitle class="m-0 text-lg font-medium text-slate-900 dark:text-white">
                    Sửa phòng ban
                </DialogTitle>
                <DialogDescription class="mb-5 mt-2 leading-normal text-slate-600 dark:text-slate-400">
                    Cập nhật thông tin phòng ban. Nhấn "Cập nhật" khi hoàn tất.
                </DialogDescription>

                <form @submit.prevent="handleSubmit" class="space-y-5">
                    <div>
                        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Tên phòng ban <span class="text-red-500">*</span>
                        </label>
                        <input v-model="name" required
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500"
                            placeholder="Ví dụ: Marketing" />
                    </div>

                    <div>
                        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Mô tả</label>
                        <textarea v-model="description" rows="3"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500"
                            placeholder="Mô tả ngắn về chức năng phòng ban..."></textarea>
                    </div>

                    <div>
                        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Trạng thái <span class="text-red-500">*</span>
                        </label>
                        <select v-model="status"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500">
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="INACTIVE">Ngừng hoạt động</option>
                        </select>
                    </div>

                    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

                    <div class="mt-6 flex justify-end gap-3">
                        <DialogClose as-child>
                            <button type="button"
                                class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                                :disabled="loading">
                                Hủy
                            </button>
                        </DialogClose>

                        <button type="submit"
                            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                            :disabled="loading">
                            {{ loading ? 'Đang cập nhật...' : 'Cập nhật' }}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>
