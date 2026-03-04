<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const route = useRoute()

const title = computed(() =>
  typeof route.meta.title === 'string' ? route.meta.title : 'Tính năng',
)
</script>

<template>
  <Card class="border-slate-200">
    <CardHeader>
      <CardTitle class="text-lg font-semibold text-slate-900">
        {{ title }}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p class="text-sm text-slate-500">
        Nội dung đang được hoàn thiện theo tiêu chuẩn Enterprise. Vui lòng quay lại sau.
      </p>
    </CardContent>
  </Card>
</template>
