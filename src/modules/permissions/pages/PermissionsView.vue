<script setup lang="ts">
import { computed } from 'vue'
import { Lock, ShieldCheck } from 'lucide-vue-next'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import {
  countAccessibleScreens,
  permissionLevelMeta,
  permissionScreens,
  roleDefinitions,
  type PermissionLevel,
} from '@/shared/auth/access-control'

const groupedScreens = computed(() => {
  const groups = new Map<string, typeof permissionScreens>()

  for (const screen of permissionScreens) {
    const currentScreens = groups.get(screen.group) ?? []
    currentScreens.push(screen)
    groups.set(screen.group, currentScreens)
  }

  return Array.from(groups.entries()).map(([label, screens]) => ({
    label,
    screens,
  }))
})

const roleSummaries = computed(() =>
  roleDefinitions.map((role) => ({
    ...role,
    accessibleCount: countAccessibleScreens(role.key),
  })),
)

const hrRestrictedSystemScreens = computed(() =>
  permissionScreens.filter(
    (screen) => screen.access.ROLE_ADMIN === 'full' && screen.access.ROLE_HR === 'none',
  ),
)

function getLevelBadgeClass(level: PermissionLevel) {
  switch (level) {
    case 'full':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
    case 'manage':
      return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300'
    case 'view':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'
    case 'self':
      return 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/50 dark:bg-cyan-950/30 dark:text-cyan-300'
    default:
      return 'border-border bg-surface text-tertiary-text dark:bg-card dark:text-secondary-text'
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <PageHeader
        title="Phân quyền"
        description="Ma trận quyền đang dùng chung cho giao diện điều hướng và màn hình hệ thống."
      />
      <Button disabled class="gap-2">
        <Lock class="h-4 w-4" />
        Chính sách cố định
      </Button>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card
        v-for="role in roleSummaries"
        :key="role.key"
        class="border-border shadow-none"
      >
        <CardContent class="space-y-3 p-5">
          <div class="flex items-start justify-between gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
            >
              <ShieldCheck class="h-5 w-5" />
            </div>
            <span
              class="rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-secondary-text"
            >
              {{ role.accessibleCount }} màn
            </span>
          </div>

          <div class="space-y-1">
            <p class="text-sm font-semibold text-primary-text">{{ role.label }}</p>
            <p class="text-[11px] font-medium text-secondary-text">{{ role.description }}</p>
          </div>

          <p class="text-[11px] leading-5 text-tertiary-text">
            {{ role.summary }}
          </p>
        </CardContent>
      </Card>
    </div>

    <Card class="overflow-hidden border-border shadow-none">
      <CardContent class="p-0">
        <div class="overflow-x-auto">
          <table class="w-full min-w-245 text-sm">
            <thead>
              <tr class="border-b bg-surface/60 dark:bg-card/60">
                <th
                  class="min-w-80 px-6 py-4 text-left text-[10px] font-semibold tracking-normal text-tertiary-text"
                >
                  Màn hình
                </th>
                <th
                  v-for="role in roleDefinitions"
                  :key="role.key"
                  class="px-3 py-4 text-center text-[10px] font-semibold tracking-normal text-tertiary-text"
                >
                  <span class="block text-primary-text">{{ role.label }}</span>
                  <span class="mt-0.5 block font-medium normal-case text-tertiary-text">
                    {{ countAccessibleScreens(role.key) }} màn khả dụng
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="group in groupedScreens" :key="group.label">
                <tr class="border-b bg-primary/5">
                  <td
                    :colspan="roleDefinitions.length + 1"
                    class="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-primary"
                  >
                    {{ group.label }}
                  </td>
                </tr>

                <tr
                  v-for="screen in group.screens"
                  :key="screen.key"
                  class="border-b transition-colors hover:bg-surface/40 dark:hover:bg-card/50"
                >
                  <td class="px-6 py-4 align-top">
                    <div class="space-y-1.5">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="font-semibold text-primary-text">{{ screen.label }}</p>
                        <span
                          v-if="screen.route"
                          class="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-secondary-text"
                        >
                          {{ screen.route }}
                        </span>
                      </div>
                      <p class="text-[11px] leading-5 text-secondary-text">
                        {{ screen.description }}
                      </p>
                      <p
                        v-if="screen.note"
                        class="text-[11px] leading-5 text-amber-600 dark:text-amber-300"
                      >
                        {{ screen.note }}
                      </p>
                    </div>
                  </td>

                  <td
                    v-for="role in roleDefinitions"
                    :key="role.key"
                    class="px-3 py-4 text-center align-top"
                  >
                    <div class="flex justify-center">
                      <span
                        :class="[
                          'inline-flex min-w-22 items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                          getLevelBadgeClass(screen.access[role.key]),
                        ]"
                        :title="permissionLevelMeta[screen.access[role.key]].description"
                      >
                        {{ permissionLevelMeta[screen.access[role.key]].label }}
                      </span>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <div class="grid gap-4 xl:grid-cols-2">
      <Card class="border-amber-200 bg-amber-50/40 shadow-none dark:border-amber-900/40 dark:bg-amber-950/10">
        <CardContent class="space-y-3 p-5">
          <div class="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Lock class="h-4 w-4" />
            <p class="text-sm font-semibold">Khác nhau giữa HR và Admin</p>
          </div>
          <p class="text-[11px] leading-5 text-amber-800/90 dark:text-amber-200">
            HR đang có quyền nghiệp vụ gần tương đương Admin ở các màn hình vận hành, nhưng không
            truy cập được các màn cấu hình cấp hệ thống dưới đây:
          </p>
          <ul class="space-y-1 text-[11px] font-medium text-amber-800/90 dark:text-amber-200">
            <li v-for="screen in hrRestrictedSystemScreens" :key="screen.key">
              {{ screen.label }}
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card class="border-border shadow-none">
        <CardContent class="space-y-3 p-5">
          <p class="text-sm font-semibold text-primary-text">Chú giải mức quyền</p>
          <div class="grid gap-2 sm:grid-cols-2">
            <div
              v-for="([level, meta], index) in Object.entries(permissionLevelMeta)"
              :key="level"
              class="rounded-xl border border-border bg-surface p-3"
            >
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'inline-flex min-w-22 items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                    getLevelBadgeClass(level as PermissionLevel),
                  ]"
                >
                  {{ meta.label }}
                </span>
                <span class="text-[10px] font-medium text-tertiary-text">Mức {{ index + 1 }}</span>
              </div>
              <p class="mt-2 text-[11px] leading-5 text-secondary-text">
                {{ meta.description }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
