<script setup lang="ts">
import { computed } from 'vue'
import type { LineTrendChartProps } from '@/types/admin'

const props = defineProps<LineTrendChartProps>()

const width = 720
const height = 320
const padding = {
  top: 20,
  right: 18,
  bottom: 38,
  left: 42,
}

const chartWidth = width - padding.left - padding.right
const chartHeight = height - padding.top - padding.bottom

const maxValue = computed(() => {
  const value = Math.max(...props.items.map((item) => item.value), 0)
  return value > 0 ? value : 1
})

const yTicks = computed(() => {
  return Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4
    const value = Math.round(maxValue.value * (1 - ratio))
    const y = padding.top + chartHeight * ratio
    return { value, y }
  })
})

const points = computed(() => {
  if (!props.items.length) {
    return []
  }

  const denominator = Math.max(props.items.length - 1, 1)

  return props.items.map((item, index) => {
    const x = padding.left + (chartWidth * index) / denominator
    const y = padding.top + chartHeight - (item.value / maxValue.value) * chartHeight
    return {
      ...item,
      x,
      y,
    }
  })
})

const polylinePoints = computed(() => {
  return points.value.map((point) => `${point.x},${point.y}`).join(' ')
})

const areaPath = computed(() => {
  if (!points.value.length) {
    return ''
  }

  const first = points.value[0]
  const last = points.value[points.value.length - 1]

  const line = points.value.map((point) => `${point.x} ${point.y}`).join(' L ')
  return `M ${padding.left} ${height - padding.bottom} L ${first.x} ${first.y} L ${line} L ${last.x} ${height - padding.bottom} Z`
})
</script>

<template>
  <div class="trend-chart">
    <svg :viewBox="`0 0 ${width} ${height}`" class="trend-chart__svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="trend-area-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#111111" stop-opacity="0.12" />
          <stop offset="100%" stop-color="#111111" stop-opacity="0.01" />
        </linearGradient>
      </defs>

      <g>
        <line
          v-for="tick in yTicks"
          :key="tick.y"
          :x1="padding.left"
          :x2="width - padding.right"
          :y1="tick.y"
          :y2="tick.y"
          class="trend-chart__grid"
        />

        <text
          v-for="tick in yTicks"
          :key="`${tick.y}-label`"
          :x="padding.left - 10"
          :y="tick.y + 4"
          text-anchor="end"
          class="trend-chart__axis"
        >
          {{ tick.value }}
        </text>

        <path v-if="areaPath" :d="areaPath" class="trend-chart__area" />
        <polyline v-if="polylinePoints" :points="polylinePoints" class="trend-chart__line" />

        <circle v-for="point in points" :key="point.label" :cx="point.x" :cy="point.y" r="4.5" class="trend-chart__point" />

        <text
          v-for="point in points"
          :key="`${point.label}-x`"
          :x="point.x"
          :y="height - 14"
          text-anchor="middle"
          class="trend-chart__axis"
        >
          {{ point.label }}
        </text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.trend-chart {
  width: 100%;
  height: 320px;
}

.trend-chart__svg {
  width: 100%;
  height: 100%;
}

.trend-chart__grid {
  stroke: #e5e7eb;
  stroke-dasharray: 4 4;
}

.trend-chart__axis {
  fill: #9ca3af;
  font-size: 11px;
}

.trend-chart__area {
  fill: url(#trend-area-gradient);
}

.trend-chart__line {
  fill: none;
  stroke: #111111;
  stroke-width: 2.5;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.trend-chart__point {
  fill: #111111;
  stroke: #ffffff;
  stroke-width: 2;
}
</style>
