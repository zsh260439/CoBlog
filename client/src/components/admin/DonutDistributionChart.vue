<script setup lang="ts">
import { computed } from 'vue'
import type { DonutDistributionChartProps } from '@/types/admin'

const props = defineProps<DonutDistributionChartProps>()

const palette = ['#2f2f32', '#616161', '#8b8b8b', '#b2b2b2', '#d0d0d0', '#ececec']

const total = computed(() => props.items.reduce((sum, item) => sum + item.value, 0))

const normalizedItems = computed(() => {
  if (!total.value) {
    return []
  }

  return props.items.map((item, index) => ({
    ...item,
    color: palette[index % palette.length],
    percentage: Math.round((item.value / total.value) * 100),
  }))
})

const gradient = computed(() => {
  if (!normalizedItems.value.length) {
    return 'conic-gradient(#ececec 0deg, #ececec 360deg)'
  }

  let start = 0
  const segments = normalizedItems.value.map((item) => {
    const sweep = (item.value / total.value) * 360
    const end = start + sweep
    const segment = `${item.color} ${start}deg ${end}deg`
    start = end
    return segment
  })

  return `conic-gradient(${segments.join(', ')})`
})
</script>

<template>
  <div class="donut-chart">
    <div class="donut-chart__visual">
      <div class="donut-chart__ring" :style="{ background: gradient }">
        <div class="donut-chart__center">
          <strong>{{ total }}</strong>
          <span>总量</span>
        </div>
      </div>
    </div>

    <div class="donut-chart__legend">
      <div v-for="item in normalizedItems" :key="item.label" class="donut-chart__legend-item">
        <div class="donut-chart__legend-left">
          <span class="donut-chart__dot" :style="{ background: item.color }"></span>
          <span>{{ item.label }}</span>
        </div>

        <div class="donut-chart__legend-right">
          <span>{{ item.value }}</span>
          <small>{{ item.percentage }}%</small>
        </div>
      </div>
    </div>
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
