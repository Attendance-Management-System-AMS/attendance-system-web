<script setup lang="ts">
import { ref, type Component } from 'vue'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/ui/PageHeader.vue'
import {
  FileSpreadsheet,
  FileText,
  FileDown,
  Download,
  Info
} from 'lucide-vue-next'

type Format = 'xlsx' | 'csv' | 'pdf'

const format = ref<Format>('xlsx')
const includeDetails = ref(true)
const rangeStart = ref('')
const rangeEnd = ref('')

const formats: { id: Format; label: string; desc: string; icon: Component }[] = [
  { id: 'xlsx', label: 'Microsoft Excel', desc: 'Báo cáo chi tiết dạng bảng tính (.xlsx)', icon: FileSpreadsheet },
  { id: 'csv', label: 'CSV Standard', desc: 'Dữ liệu thô phân tách bằng dấu phẩy (.csv)', icon: FileDown },
  { id: 'pdf', label: 'PDF Document', desc: 'Bản in báo cáo cố định, chuyên nghiệp (.pdf)', icon: FileText }
]

const handleExport = () => {
  // Demo action
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Phân tích & Báo cáo"
      description="Phân tích chuyên sâu dữ liệu chấm công và hiệu suất"
    />

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2 space-y-6">
        <!-- Format Selection -->
        <div class="space-y-4">
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            1. Chọn định dạng file
          </h3>
          <div class="grid gap-3 sm:grid-cols-3">
            <button
              v-for="f in formats"
              :key="f.id"
              type="button"
              @click="format = f.id"
              :class="[
                'relative rounded-xl border p-5 text-left transition-all duration-300 group',
                format === f.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xl shadow-primary/20 dark:bg-primary/20'
                  : 'border-border bg-card hover:border-slate-300 dark:hover:border-slate-700',
              ]"
            >
              <div
                :class="[
                  'mb-4 h-10 w-10 flex items-center justify-center rounded-xl transition-colors',
                  format === f.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400',
                ]"
              >
                <component :is="f.icon" class="h-5 w-5" />
              </div>
              <p class="font-black text-slate-900 dark:text-white">{{ f.label }}</p>
              <p class="mt-1 text-[11px] font-medium text-slate-500 leading-tight">{{ f.desc }}</p>

              <div
                v-if="format === f.id"
                class="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary animate-pulse"
              ></div>
            </button>
          </div>
        </div>

        <!-- Range Config -->
        <Card class="border-primary/10 shadow-none overflow-hidden rounded-xl">
          <CardHeader class="border-b bg-primary/5 py-4 flex flex-row items-center gap-3">
            <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500">
              2. Cấu hình thời gian & Dữ liệu
            </h3>
          </CardHeader>
          <CardContent class="pt-6 space-y-6">
            <div class="grid gap-6 sm:grid-cols-2">
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700 dark:text-slate-300"
                  >Ngày bắt đầu</label
                >
                <input
                  v-model="rangeStart"
                  type="date"
                  class="h-11 w-full rounded-xl border border-primary/10 bg-primary/5 px-4 text-sm font-bold text-slate-700 dark:text-white focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700 dark:text-slate-300"
                  >Ngày kết thúc</label
                >
                <input
                  v-model="rangeEnd"
                  type="date"
                  class="h-11 w-full rounded-xl border border-primary/10 bg-primary/5 px-4 text-sm font-bold text-slate-700 dark:text-white focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div
              class="p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div
                  class="h-5 w-5 flex items-center justify-center rounded-full bg-primary/20 text-primary"
                >
                  <Info class="h-3 w-3" />
                </div>
                <span class="text-sm font-bold text-slate-600 dark:text-slate-400"
                  >Giao diện chi tiết (Logs)</span
                >
              </div>
              <input
                v-model="includeDetails"
                type="checkbox"
                class="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Action Card -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          3. Xác nhận & Tải
        </h3>
        <Card
          class="border-primary/20 bg-linear-to-b from-primary/5 to-white dark:from-primary/10 dark:to-slate-950 shadow-none p-6"
        >
          <div class="space-y-4">
            <div
              class="flex flex-col items-center text-center space-y-2 pb-4 border-b border-primary/10"
            >
              <div
                class="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20"
              >
                <Download class="h-6 w-6" />
              </div>
              <h3 class="text-lg font-black text-slate-800 dark:text-white">Sẵn sàng trích xuất</h3>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                Báo cáo tổng hợp nhân sự
              </p>
            </div>

            <div class="space-y-2 pt-2">
              <div class="flex justify-between text-xs">
                <span class="text-slate-400 font-bold uppercase">Định dạng</span>
                <span class="text-primary font-black">{{ format.toUpperCase() }}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-400 font-bold uppercase">Chi tiết</span>
                <span class="text-slate-700 dark:text-slate-200 font-black">{{
                  includeDetails ? 'Có' : 'Không'
                }}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-400 font-bold uppercase">Trạng thái</span>
                <span class="text-emerald-600 font-black">Hợp lệ</span>
              </div>
            </div>

            <Button
              @click="handleExport"
              class="w-full h-12 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 dark:shadow-none text-sm font-black uppercase tracking-widest gap-2 text-primary-foreground"
            >
              Tạo & Tải về ngay
            </Button>

            <p class="text-[10px] text-center text-slate-400 font-medium leading-relaxed">
              Hệ thống sẽ tổng hợp dữ liệu từ cơ sở dữ liệu. Quá trình này có thể mất tới 10-15
              giây.
            </p>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>
