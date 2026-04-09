<script setup lang="ts">
import { computed } from 'vue'
import {
  Calendar,
  CollectionTag,
  Document,
  Files,
  Reading,
  Timer,
} from '@element-plus/icons-vue'
import DonutDistributionChart from '@/components/admin/DonutDistributionChart.vue'
import LineTrendChart from '@/components/admin/LineTrendChart.vue'
import { useArticles } from '@/composables/useArticles'
import { summarizeCategories } from '@/utils'

const { articles, isLoading } = useArticles()

const totalWords = computed(() => {
  return articles.value.reduce((sum, article) => sum + (article.wordCount ?? 0), 0)
})

const todayKey = new Date().toISOString().slice(0, 10)

const todayArticles = computed(() => {
  return articles.value.filter((article) => article.createdAt.slice(0, 10) === todayKey).length
})

const recentWeekArticles = computed(() => {
  const endDate = articles.value.length
    ? new Date(articles.value[0].createdAt)
    : new Date()

  const startTime = new Date(endDate)
  startTime.setDate(startTime.getDate() - 6)
  startTime.setHours(0, 0, 0, 0)

  return articles.value.filter((article) => {
    const currentTime = new Date(article.createdAt).getTime()
    return currentTime >= startTime.getTime() && currentTime <= endDate.getTime()
  }).length
})

const statsPrimary = computed(() => [
  { label: '文章总数', value: articles.value.length, icon: Document },
  { label: '分类总数', value: summarizeCategories(articles.value).length, icon: Files },
  { label: '标签总数', value: new Set(articles.value.flatMap((article) => article.tags)).size, icon: CollectionTag },
  { label: '总字数', value: totalWords.value, icon: Reading },
])

const statsSecondary = computed(() => [
  { label: '今日文章', value: todayArticles.value, badge: '今日' },
  { label: '近 7 天文章', value: recentWeekArticles.value, badge: '近7天' },
  { label: '最近更新', value: articles.value[0]?.createdAt?.slice(5, 10) ?? '--', badge: '最新' },
  { label: '活跃分类', value: summarizeCategories(articles.value).length, badge: '分类' },
])

const trendData = computed(() => {
  const endDate = articles.value.length ? new Date(articles.value[0].createdAt) : new Date()
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 6)

  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + index)
    const key = currentDate.toISOString().slice(5, 10)

    const value = articles.value.filter((article) => article.createdAt.slice(5, 10) === key).length
    return {
      label: key,
      value,
    }
  })
})

const distributionData = computed(() => {
  return summarizeCategories(articles.value).map((item) => ({
    label: item.label,
    value: item.count,
  }))
})
</script>

<template>
  <div class="dashboard">
    <div v-loading="isLoading" class="stat-grid stat-grid--primary">
      <div v-for="card in statsPrimary" :key="card.label" class="stat-card stat-card--primary">
        <div class="stat-icon stat-icon--dark">
          <el-icon><component :is="card.icon" /></el-icon>
        </div>

        <div class="stat-info">
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-label">{{ card.label }}</div>
        </div>
      </div>
    </div>

    <div class="stat-grid stat-grid--secondary">
      <div v-for="card in statsSecondary" :key="card.label" class="stat-card stat-card--secondary">
        <div class="stat-info">
          <div class="stat-value stat-value--small">{{ card.value }}</div>
          <div class="stat-label">{{ card.label }}</div>
        </div>

        <el-tag size="small" effect="plain">{{ card.badge }}</el-tag>
      </div>
    </div>

    <div class="chart-row chart-row--main">
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">内容趋势（最近几天）</span>
        </div>

        <LineTrendChart :items="trendData" />
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">分类分布</span>
        </div>

        <DonutDistributionChart v-if="distributionData.length" :items="distributionData" />
        <el-empty v-else description="暂无分类数据" :image-size="80" />
      </div>
    </div>

    <div class="run-banner">
      <div class="run-banner-inner">
        <el-icon class="run-icon"><Timer /></el-icon>
        <span class="run-text">后台已接入文章内容管理，共</span>
        <span class="run-days">{{ articles.length }}</span>
        <span class="run-unit">篇内容</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stat-grid {
  display: grid;
  gap: 16px;
}

.stat-grid--primary {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.stat-grid--secondary {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.stat-card {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 18px;
}

.stat-card--primary {
  padding: 20px 18px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card--secondary {
  padding: 18px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon--dark {
  background: #111111;
  color: #ffffff;
}

.stat-icon .el-icon {
  font-size: 22px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #111111;
  line-height: 1.2;
}

.stat-value--small {
  font-size: 18px;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 6px;
}

.chart-row {
  display: grid;
  gap: 16px;
}

.chart-row--main {
  grid-template-columns: minmax(0, 1.8fr) minmax(360px, 0.9fr);
}

.chart-card {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 18px;
  padding: 20px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 8px;
}

.chart-title {
  font-size: 15px;
  font-weight: 700;
  color: #111111;
}

.run-banner {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 18px;
  padding: 12px 24px;
}

.run-banner-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.run-icon {
  font-size: 18px;
  color: #303133;
}

.run-text,
.run-unit {
  font-size: 15px;
  color: #606266;
}

.run-days {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

@media (max-width: 1200px) {
  .stat-grid--primary,
  .stat-grid--secondary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-row--main {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .stat-grid--primary,
  .stat-grid--secondary {
    grid-template-columns: 1fr;
  }
}
</style>
