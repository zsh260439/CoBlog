<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts'
import {useArticles} from '@/composables/useArticles'
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

  const dateMap = new Map<string, number>()
  articles.value.forEach((article) => {
    const date = article.createdAt.split('T')[0]
    dateMap.set(date, (dateMap.get(date) || 0) + 1)
  })

  const sortedData = Array.from(dateMap.entries()).sort(
    (left, right) => new Date(left[0]).getTime() - new Date(right[0]).getTime()
  )

  const xData = sortedData.map((item) => item[0])
  const yData = sortedData.map((item) => item[1])

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
   <div ref="chartRef" style="width:100%; height: 390px;">
   </div>
</template>
