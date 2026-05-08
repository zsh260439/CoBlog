<script setup lang="ts">
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface DistributionItem { label: string; value: number }

const props = defineProps<{ items: DistributionItem[] }>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const render = () => {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [{ type: 'pie', radius: ['40%', '70%'], data: props.items }],
  })
}

onMounted(() => render())

watch(() => props.items, () => render(), { deep: true })

onBeforeUnmount(() => chart?.dispose())
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 390px;"></div>
</template>