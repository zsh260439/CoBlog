// 趋势图单个数据点结构
export interface TrendItem {
  label: string // 横轴显示文本
  value: number // 对应的数值大小
}

// 趋势图组件参数结构
export interface LineTrendChartProps {
  items: TrendItem[] // 趋势图的数据点数组
}

// 分布图单个数据项结构
export interface DistributionItem {
  label: string // 分布项名称
  value: number // 分布项数值
}

// 环形分布图组件参数结构
export interface DonutDistributionChartProps {
  items: DistributionItem[] // 环形图的数据项数组
}
