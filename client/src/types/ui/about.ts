// 关于页单个技术卡片结构
export interface AboutTechItem {
  name: string // 技术名称
  short: string // 技术简称或标识
  description: string // 技术说明文案
  icon: string // 技术图标地址
  accent: string // 技术强调色
}

// 关于页技术背景组件参数
export interface AboutTechHeroProps {
  eyebrow?: string // 顶部小标题，可选
  title: string // 主标题
  description: string // 说明文案
  items: AboutTechItem[] // 技术卡片数据数组
  repeat?: number // 每列重复次数，可选
  lanes?: number // 纵向列数，可选
  paused?: boolean // 是否暂停背景动效，可选
  displayCopy?: boolean // 是否显示文案层，可选
}
