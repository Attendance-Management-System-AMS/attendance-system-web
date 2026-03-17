<script setup lang="ts">
import { ref } from 'vue'
import {
    DialogRoot,
    DialogTrigger,
    DialogPortal,
    DialogOverlay,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from 'reka-ui'

const props = defineProps<{
    open: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'created', department: { name: string; description: string }): void
}>()

const name = ref('')
const description = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const handleSubmit = async () => {
    if (!name.value.trim()) {
        error.value = 'Tên phòng ban là bắt buộc'
        return
    }

    loading.value = true
    error.value = null

    try {
        // Thay bằng API call thực tế
        // await api.post('/departments', { name: name.value, description: description.value })
        console.log('Tạo phòng ban:', { name: name.value, description: description.value })
        emit('created', { name: name.value, description: description.value })

        resetForm()
        emit('close')
    } catch (err: any) {
        error.value = err.message || 'Lỗi khi tạo phòng ban'
    } finally {
        loading.value = false
    }
}

const resetForm = () => {
    name.value = ''
    description.value = ''
    error.value = null
}

const handleClose = () => {
    resetForm()
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
                    Thêm phòng ban mới
                </DialogTitle>
                <DialogDescription class="mb-5 mt-2 leading-normal text-slate-600 dark:text-slate-400">
                    Nhập tên và mô tả ngắn gọn. Nhấn "Tạo" khi hoàn tất.
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
                            {{ loading ? 'Đang tạo...' : 'Tạo phòng ban' }}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>

<style>
@keyframes overlayShow {
    from {
        opacity: 0
    }

    to {
        opacity: 1
    }
}

@keyframes overlayHide {
    from {
        opacity: 1
    }

    to {
        opacity: 0
    }
}

@keyframes contentShow {
    from {
        opacity: 0;
        transform: translate(-50%, -48%) scale(0.96)
    }

    to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1)
    }
}

@keyframes contentHide {
    from {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1)
    }

    to {
        opacity: 0;
        transform: translate(-50%, -48%) scale(0.96)
    }
}
</style>