<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts'

interface TrendItem {
  label: string
  value: number
}

const props = defineProps<{
  items: TrendItem[]
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

  const xData = props.items.map((item) => item.label)
  const yData = props.items.map((item) => item.value)

  currentChart.setOption({
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: {
        interval: 0,
        rotate: 0
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        data: yData,
        type: 'line'
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
   <div ref="chartRef" style="width:100%; height: 390px;">
   </div>
</template>
