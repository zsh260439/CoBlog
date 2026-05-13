<script setup lang="ts">
import * as echarts from 'echarts'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface DistributionItem { label: string; value: number }

const props = defineProps<{ items: DistributionItem[] }>()

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

  const chartData = props.items.map((item) => ({
    name: item.label,
    value: item.value,
  }))
  instance.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      bottom: 0,
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: '#4b5563',
        fontSize: 12,
      },
    },
    series: [{
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['50%', '42%'],
      data: chartData,
      label: {
        show: true,
        color: '#374151',
        formatter: '{b}\n{c}',
        fontSize: 12,
      },
      labelLine: {
        show: true,
        length: 14,
        length2: 12,
      },
      emphasis: {
        scale: true,
        scaleSize: 6,
      },
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
