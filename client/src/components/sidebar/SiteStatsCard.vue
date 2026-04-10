<script setup lang="ts">
import { computed } from 'vue'
import { siteConfig } from '@/config/site'
import type { SiteStatsCardProps } from '@/types/ui'

const props = defineProps<SiteStatsCardProps>()

const resolvedItems = computed(() => {
  if (props.items?.length) {
    return props.items
  }

  const { onlineUsers, todayViews, totalViews, totalVisitors } = siteConfig.siteStatsSnapshot

  return [
    { label: '在线访客', value: String(onlineUsers) },
    { label: '今日浏览', value: String(todayViews) },
    { label: '总浏览量', value: String(totalViews) },
    { label: '总访客量', value: String(totalVisitors) }
  ]
})
</script>

<template>
  <el-card class="stats-card" shadow="never">
    <span class="stats-card__eyebrow">站点统计</span>

    <div class="stats-card__list">
      <div v-for="item in resolvedItems" :key="item.label" class="stats-card__row">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.stats-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.stats-card :deep(.el-card__body) {
  padding: 1.15rem;
}

.stats-card__eyebrow {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
}

.stats-card__list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.8rem;
}

.stats-card__row {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  color: var(--text-secondary);
}

.stats-card__row strong {
  color: var(--text-primary);
  font-weight: 500;
}
</style>
