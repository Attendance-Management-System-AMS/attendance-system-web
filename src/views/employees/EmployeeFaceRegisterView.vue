<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import axios from 'axios'
import { ArrowLeft, CheckCircle2, ScanFace, XCircle } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import { employeeApi } from '@/services/employee.service'
import { useEmployees } from '@/composables/useEmployees'
import { useFaceDetection } from '@/composables/useFaceDetection'
import type { Employee } from '@/types/employee'

const route = useRoute()
const router = useRouter()
const { registerFaceDescriptor } = useEmployees()

const employeeId = computed(() => Number(route.params.id))

const employeeQuery = useQuery<Employee>({
  queryKey: ['employee', employeeId],
  queryFn: async () => {
    const res = await employeeApi.getById(employeeId.value)
    return res.data.result
  },
  enabled: computed(() => Number.isFinite(employeeId.value) && employeeId.value > 0),
})

const employee = computed(() => employeeQuery.data.value)

const ui = reactive({
  locked: false,
  progress: 0,
  feedback: { status: 'idle' as 'idle' | 'success' | 'error', msg: '' },
})

const { videoRef, isLoaded, loadModels, setupCamera, detectFace, stopCamera } = useFaceDetection()
let scanTimer: number | undefined
let faceDetectedStartTime: number | null = null

function parseApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data as { message?: string } | undefined
    if (msg?.message) return msg.message
    if (err.message) return err.message
  }
  if (err instanceof Error) return err.message
  return 'Không thể đăng ký khuôn mặt.'
}

const submitDescriptor = async (descriptor: Float32Array) => {
  ui.locked = true
  ui.progress = 0
  const progressInterval = window.setInterval(() => {
    if (ui.progress < 90) ui.progress += 12
  }, 60)

  try {
    const descriptorArray = Array.from(descriptor) as number[]
    await registerFaceDescriptor.mutateAsync({
      id: employeeId.value,
      body: { descriptor: descriptorArray },
    })
    ui.progress = 100
    ui.feedback = { status: 'success', msg: 'Đã lưu khuôn mặt thành công.' }
  } catch (err) {
    ui.feedback = { status: 'error', msg: parseApiError(err) }
  } finally {
    window.clearInterval(progressInterval)
  }

  window.setTimeout(() => {
    Object.assign(ui, {
      locked: false,
      progress: 0,
      feedback: { status: 'idle', msg: '' },
    })
    runScanner()
  }, 3200)
}

const runScanner = async () => {
  if (!ui.locked && isLoaded.value) {
    const det = await detectFace()
    if (det && det.detection.score > 0.72) {
      if (!faceDetectedStartTime) {
        faceDetectedStartTime = Date.now()
      } else {
        const duration = Date.now() - faceDetectedStartTime
        if (duration >= 1800) {
          faceDetectedStartTime = null
          if (scanTimer) window.clearTimeout(scanTimer)
          await submitDescriptor(det.descriptor)
          return
        }
      }
    } else {
      faceDetectedStartTime = null
    }
  } else {
    faceDetectedStartTime = null
  }
  scanTimer = window.setTimeout(runScanner, 200)
}

onMounted(async () => {
  try {
    await loadModels()
    await setupCamera()
    runScanner()
  } catch (err) {
    console.error(err)
    ui.feedback = { status: 'error', msg: 'Không mở được camera hoặc tải model AI.' }
  }
})

onUnmounted(() => {
  if (scanTimer) window.clearTimeout(scanTimer)
  stopCamera()
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Đăng ký khuôn mặt"
      :description="
        employee
          ? `${employee.fullName} · ${employee.employeeCode}`
          : 'Quét khuôn mặt để lưu descriptor (face-api.js, 128 chiều)'
      "
    >
      <template #actions>
        <button
          type="button"
          @click="router.push(employee ? `/employees/${employee.id}` : '/employees')"
          class="flex items-center gap-2 h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <ArrowLeft class="h-4 w-4" />
          Quay lại
        </button>
      </template>
    </PageHeader>

    <div
      v-if="employeeQuery.isLoading.value"
      class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900"
    >
      Đang tải thông tin nhân viên...
    </div>

    <div
      v-else-if="employeeQuery.isError.value || !employee"
      class="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
    >
      Không tìm thấy nhân viên.
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm dark:border-slate-800">
        <div class="relative aspect-4/3 w-full">
          <video
            ref="videoRef"
            autoplay
            muted
            playsinline
            class="absolute inset-0 h-full w-full object-cover scale-x-[-1] opacity-90"
          />
          <div
            class="pointer-events-none absolute inset-0 flex items-center justify-center border-[3px] border-white/20"
          >
            <div
              class="h-[68%] max-h-[min(420px,70vw)] w-[55%] max-w-[min(340px,85vw)] rounded-[50%] border-2 border-dashed border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
            />
          </div>
          <div
            class="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 rounded-xl bg-black/55 px-4 py-3 text-xs text-white backdrop-blur-md"
          >
            <ScanFace class="h-4 w-4 shrink-0 text-indigo-300" />
            <span>
              Đặt mặt trong khung, ánh sáng đều. Giữ yên khoảng <strong>2 giây</strong> để hệ thống chụp descriptor.
            </span>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Trạng thái</p>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
            <span v-if="employee.faceRegistered" class="text-emerald-600 dark:text-emerald-400">
              Đã có khuôn mặt đăng ký — lần lưu tiếp theo sẽ <strong>cập nhật</strong> mẫu.
            </span>
            <span v-else>Chưa đăng ký — lưu lần đầu để dùng chấm công nhận diện.</span>
          </p>

          <div v-if="!isLoaded" class="mt-3 text-xs text-amber-600 dark:text-amber-400">
            Đang tải model nhận diện...
          </div>

          <div v-if="ui.progress > 0 && ui.progress < 100" class="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              class="h-full rounded-full bg-indigo-500 transition-[width] duration-150"
              :style="{ width: `${ui.progress}%` }"
            />
          </div>

          <div
            v-if="ui.feedback.status === 'success'"
            class="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200"
          >
            <CheckCircle2 class="mt-0.5 h-5 w-5 shrink-0" />
            <span>{{ ui.feedback.msg }}</span>
          </div>
          <div
            v-if="ui.feedback.status === 'error'"
            class="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <XCircle class="mt-0.5 h-5 w-5 shrink-0" />
            <span>{{ ui.feedback.msg }}</span>
          </div>
        </div>

        <div
          class="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400"
        >
          <p class="font-semibold text-slate-700 dark:text-slate-200">Lưu ý</p>
          <ul class="mt-2 list-disc space-y-1 pl-4">
            <li>Dùng cùng thư viện <code class="rounded bg-slate-200 px-1 dark:bg-slate-800">face-api.js</code> với máy chấm công.</li>
            <li>Descriptor gồm đúng 128 số — backend lưu và dùng để so khớp khi check-in.</li>
            <li>Nếu chấm công sai người, đăng ký lại tại đây (PUT cập nhật mẫu).</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
