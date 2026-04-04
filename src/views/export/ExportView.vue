<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import { ref } from 'vue'
import { Download, FileSpreadsheet, FileText, Table2 } from 'lucide-vue-next'

type Format = 'pdf' | 'excel' | 'csv'

const format = ref<Format>('excel')
const rangeStart = ref('')
const rangeEnd = ref('')
const includeDetails = ref(true)

const formats: { id: Format; label: string; desc: string; icon: typeof FileText }[] = [
  { id: 'pdf', label: 'PDF', desc: 'Báo cáo tóm tắt, ký số', icon: FileText },
  { id: 'excel', label: 'Excel', desc: 'Xử lý số liệu, pivot', icon: FileSpreadsheet },
  { id: 'csv', label: 'CSV', desc: 'Nhập hệ thống khác', icon: Table2 },
]

const handleExport = () => {
  // Demo — gắn API sau
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Xuất báo cáo"
      description="Tải dữ liệu chấm công, nghỉ phép và tổng hợp theo kỳ"
    />

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2 space-y-4">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Định dạng</p>
        <div class="grid gap-3 sm:grid-cols-3">
          <button
            v-for="f in formats"
            :key="f.id"
            type="button"
            @click="format = f.id"
            :class="[
              'rounded-2xl border p-4 text-left transition-all',
              format === f.id
                ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-500/10 dark:border-indigo-400 dark:bg-indigo-950/50'
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900',
            ]"
          >
            <component
              :is="f.icon"
              :class="[
                'mb-3 h-8 w-8',
                format === f.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400',
              ]"
            />
            <p class="font-bold text-slate-900 dark:text-white">{{ f.label }}</p>
            <p class="mt-1 text-xs text-slate-500">{{ f.desc }}</p>
          </button>
        </div>

        <div
          class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Khoảng thời gian</p>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >Từ ngày</label
              >
              <input
                v-model="rangeStart"
                type="date"
                class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >Đến ngày</label
              >
              <input
                v-model="rangeEnd"
                type="date"
                class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
          <label class="mt-4 flex cursor-pointer items-center gap-3">
            <input
              v-model="includeDetails"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            <span class="text-sm text-slate-600 dark:text-slate-400"
              >Gồm chi tiết từng lần chấm công</span
            >
          </label>
        </div>
      </div>

      <div
        class="h-fit rounded-2xl border border-slate-200 bg-linear-to-b from-violet-50/80 to-white p-6 shadow-sm dark:border-slate-800 dark:from-violet-950/30 dark:to-slate-900"
      >
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">Tóm tắt xuất</h3>
        <ul class="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>
            · Định dạng:
            <strong class="text-slate-900 dark:text-white">{{ format.toUpperCase() }}</strong>
          </li>
          <li>· Phạm vi: toàn bộ phòng ban (có thể lọc sau)</li>
          <li v-if="includeDetails">· Bao gồm log chi tiết</li>
        </ul>
        <button
          type="button"
          @click="handleExport"
          class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-700"
        >
          <Download class="h-4 w-4" />
          Tạo & tải xuống
        </button>
        <p class="mt-3 text-center text-[11px] text-slate-400">
          File được tạo trên máy chủ, có thể mất vài giây.
        </p>
      </div>
    </div>
  </div>
</template>
