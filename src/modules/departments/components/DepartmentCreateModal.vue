<script setup lang="ts">
import { ref } from 'vue'
import {
    DialogRoot,
    DialogPortal,
    DialogOverlay,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from 'reka-ui'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'

defineProps<{
    open: boolean
    isSubmitting?: boolean
    submitError?: string | null
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'created', payload: {
        data: { name: string; description: string }
        onSuccess: () => void
        onError: (err: unknown) => void
    }): void
}>()

const name = ref('')
const description = ref('')
const error = ref<string | null>(null)

const handleSubmit = () => {
    if (!name.value.trim()) {
        error.value = 'Tên phòng ban là bắt buộc'
        return
    }

    error.value = null

    emit('created', {
        data: { name: name.value, description: description.value },
        onSuccess: () => {
            resetForm()
            loading.value = false
            emit('close')
        },
        onError: (err: unknown) => {
            error.value = getApiErrorMessage(err, 'Lỗi khi tạo phòng ban')
            loading.value = false
        },
    })
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
                class="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-112.5 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-card p-6 shadow-2xl focus:outline-none data-[state=open]:animate-contentShow data-[state=closed]:animate-contentHide dark:bg-card">
                <DialogTitle class="m-0 text-lg font-medium text-primary-text dark:text-primary-text">
                    Thêm phòng ban mới
                </DialogTitle>
                <DialogDescription class="mb-5 mt-2 leading-normal text-secondary-text dark:text-tertiary-text">
                    Nhập tên và mô tả ngắn gọn. Nhấn "Tạo" khi hoàn tất.
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

                    <p v-if="error || submitError" class="text-sm text-red-600">{{ error || submitError }}</p>

                    <div class="mt-6 flex justify-end gap-3">
                        <DialogClose as-child>
                            <button type="button"
                                class="rounded-lg border border-border-standard px-4 py-2 text-sm font-medium text-primary-text hover:bg-surface dark:border-border dark:text-tertiary-text dark:hover:bg-elevated"
                                :disabled="isSubmitting">
                                Hủy
                            </button>
                        </DialogClose>

                        <button type="submit"
                            class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary disabled:opacity-50"
                            :disabled="isSubmitting">
                            {{ isSubmitting ? 'Đang tạo...' : 'Tạo phòng ban' }}
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
