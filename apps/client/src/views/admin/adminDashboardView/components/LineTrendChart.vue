<script setup lang="ts">
import * as echarts from 'echarts'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface TrendItem { label: string; value: number }

const props = defineProps<{ items: TrendItem[] }>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const handleResize = () => chart?.resize()

const ensureChart = async () => {
  await nextTick()
  if (!chartRef.value) return null
  if (!chart) chart = echarts.init(chartRef.value)
  return chart
}

const render = async () => {
  const instance = await ensureChart()
  if (!instance) return

  instance.setOption({
    grid: { left: 28, right: 18, top: 26, bottom: 28, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: props.items.map((i) => i.label) },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{
      data: props.items.map((i) => i.value),
      type: 'line',
      smooth: true,
      symbolSize: 8,
      label: {
        show: true,
        position: 'top',
        formatter: '{c}'
      },
      areaStyle: { opacity: 0.08 },
      lineStyle: { width: 3 },
    }],
  })

  instance.resize()
}

onMounted(() => {
  render()
  window.addEventListener('resize', handleResize)
})

watch(() => props.items, () => {
  render()
}, { deep: true, immediate: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 390px;"></div>
</template>
