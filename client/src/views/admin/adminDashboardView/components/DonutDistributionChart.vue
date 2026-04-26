<script setup lang="ts">
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface DistributionItem {
  label: string
  value: number
}

const props = defineProps<{
  items: DistributionItem[]
}>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 初始化并渲染图表
const initChart = () => {
  if (!chartRef.value) return

  // 直接创建图表
  chart = echarts.init(chartRef.value)

  // 转换数据格式
  const data = props.items.map((item) => ({
    name: item.label,
    value: item.value
  }))

  // 设置饼图配置
  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data
      }
    ]
  })
}

// 页面挂载 → 只渲染一次
onMounted(() => {
  initChart()
})

// 页面销毁
onBeforeUnmount(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 390px;"></div>
</template>

<style scoped>
/* 图表样式由 ECharts 控制 */
</style>