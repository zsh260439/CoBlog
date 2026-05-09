<script setup lang="ts">
import * as echarts from 'echarts'
import { onBeforeUnmount, ref, watch } from 'vue'

interface TrendItem { label: string; value: number }

const props = defineProps<{ items: TrendItem[] }>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const render = () => {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption({
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
      }
    }],
  })
}

watch(() => props.items, () => render(), { immediate: true })

onBeforeUnmount(() => chart?.dispose())
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 390px;"></div>
</template>
