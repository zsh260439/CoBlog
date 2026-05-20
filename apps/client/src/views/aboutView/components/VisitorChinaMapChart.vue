<script setup lang="ts">
import { CanvasRenderer } from 'echarts/renderers'
import { MapChart } from 'echarts/charts'
import {
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components'
import { init, registerMap, use } from 'echarts/core'
import type { ECharts } from 'echarts/core'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import chinaJson from '@/assets/maps/china.json'
import type { VisitCityItem } from '@/types/visit'

use([CanvasRenderer, MapChart, TooltipComponent, VisualMapComponent])

registerMap('china', chinaJson as never)

const props = defineProps<{ items: VisitCityItem[] }>()

const chartRef = ref<HTMLElement | null>(null)
let chart: ECharts | null = null

const municipalities = ['北京', '天津', '上海', '重庆']
const autonomousRegions = ['内蒙古', '广西', '西藏', '宁夏', '新疆']
const specialRegions = ['香港', '澳门']

function normalizeProvinceName(location: string) {
  const normalized = location.trim()
  if (!normalized) return ''

  const province = normalized.split(' ')[0]?.trim() || ''
  if (!province) return ''

  if (municipalities.includes(province)) return `${province}市`
  if (autonomousRegions.includes(province)) {
    if (province === '内蒙古') return '内蒙古自治区'
    if (province === '广西') return '广西壮族自治区'
    if (province === '西藏') return '西藏自治区'
    if (province === '宁夏') return '宁夏回族自治区'
    if (province === '新疆') return '新疆维吾尔自治区'
  }
  if (specialRegions.includes(province)) return `${province}特别行政区`
  if (province === '黑龙江') return '黑龙江省'

  if (province.endsWith('省') || province.endsWith('市') || province.endsWith('自治区') || province.endsWith('特别行政区')) {
    return province
  }

  return `${province}省`
}

function buildProvinceData(items: VisitCityItem[]) {
  const provinceMap = new Map<string, number>()

  items.forEach((item) => {
    const provinceName = normalizeProvinceName(item.label)
    if (!provinceName) return

    provinceMap.set(provinceName, (provinceMap.get(provinceName) || 0) + item.value)
  })

  return Array.from(provinceMap.entries()).map(([name, value]) => ({
    name,
    value,
  }))
}

const handleResize = () => {
  chart?.resize()
}

const ensureChart = async () => {
  await nextTick()
  if (!chartRef.value) return null
  if (!chart) chart = init(chartRef.value)
  return chart
}

const render = async () => {
  const instance = await ensureChart()
  if (!instance) return

  const chartData = buildProvinceData(props.items)
  const maxValue = chartData.length
    ? Math.max(...chartData.map((item) => item.value), 1)
    : 1

  instance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: ({ name, value }: { name: string; value?: number }) => `${name}：${value || 0} 次访问`,
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e5e7eb',
      textStyle: { color: '#374151' },
    },
    visualMap: {
      min: 0,
      max: maxValue,
      left: 0,
      bottom: 8,
      text: ['高', '低'],
      calculable: true,
      itemWidth: 12,
      itemHeight: 96,
      inRange: {
        color: ['#e8f1ff', '#bfd8ff', '#7aa8ff', '#2563eb'],
      },
      textStyle: {
        color: '#6b7280',
        fontSize: 11,
      },
    },
    series: [{
      type: 'map',
      map: 'china',
      roam: true,
      zoom: 1.1,
      label: {
        show: true,
        fontSize: 10,
        color: '#475569',
      },
      itemStyle: {
        areaColor: '#f8fafc',
        borderColor: '#ffffff',
        borderWidth: 1,
      },
      emphasis: {
        label: {
          color: '#111827',
          fontWeight: 'bold',
        },
        itemStyle: {
          areaColor: '#f59e0b',
          shadowBlur: 14,
          shadowColor: 'rgba(15, 23, 42, 0.18)',
        },
      },
      data: chartData,
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
  chart = null
})
</script>

<template>
  <div ref="chartRef" class="visitor-china-map"></div>
</template>

<style scoped>
.visitor-china-map {
  width: 100%;
  height: 390px;
}
</style>
