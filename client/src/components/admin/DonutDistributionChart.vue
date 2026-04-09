<script setup lang="ts">
import * as echarts from 'echarts'
import { useArticles } from '@/composables/useArticles'
import { onBeforeUnmount, ref, watch } from 'vue'
const { articles } = useArticles()
const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const ensureChart = () => {
  if (!chartRef.value) {
    return null
  }

  chart = echarts.getInstanceByDom(chartRef.value) ?? echarts.init(chartRef.value)
  return chart
}

const updateChart = () => {
  const currentChart = ensureChart()
  if (!currentChart) {
    return
  }

  const categoryMap = new Map<string, number>()
  articles.value.forEach((article) => {
    const name = article.category
    categoryMap.set(name, (categoryMap.get(name) || 0) + 1)
  })

  const data = Array.from(categoryMap.entries()).map(([name, count]) => ({
    value: count,
    name
  }))

  currentChart.setOption({
    series: [
      {
        type: 'pie',
        data
      }
    ]
  })
}

watch(articles, () => {
  updateChart()
}, { immediate: true })

onBeforeUnmount(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 390px;">
  </div>
</template>

<style scoped>
.donut-chart {
  display: grid;
  grid-template-columns: minmax(200px, 240px) minmax(0, 1fr);
  gap: 1.25rem;
  align-items: center;
}

.donut-chart__visual {
  display: flex;
  justify-content: center;
}

.donut-chart__ring {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.donut-chart__center {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-chart__center strong {
  font-size: 1.6rem;
  color: #303133;
}

.donut-chart__center span,
.donut-chart__legend-right small {
  color: #909399;
}

.donut-chart__legend {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.donut-chart__legend-item,
.donut-chart__legend-left,
.donut-chart__legend-right {
  display: flex;
  align-items: center;
}

.donut-chart__legend-item {
  justify-content: space-between;
  gap: 1rem;
}

.donut-chart__legend-left {
  gap: 0.6rem;
  color: #606266;
}

.donut-chart__legend-right {
  gap: 0.45rem;
  color: #303133;
  font-weight: 600;
}

.donut-chart__dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}

@media (max-width: 960px) {
  .donut-chart {
    grid-template-columns: 1fr;
  }
}
</style>
