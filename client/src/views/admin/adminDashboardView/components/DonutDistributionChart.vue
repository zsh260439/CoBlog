<script setup lang="ts">
import * as echarts from 'echarts'
import { onBeforeUnmount, ref, watch } from 'vue'

interface DistributionItem {
  label: string
  value: number
}

const props = defineProps<{
  items: DistributionItem[]
}>()

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

  const data = props.items.map((item) => ({
    name: item.label,
    value: item.value
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

watch(
  () => props.items,
  () => {
    updateChart()
  },
  { immediate: true }
)

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
/* Chart container uses echarts, no additional styles needed */
</style>
