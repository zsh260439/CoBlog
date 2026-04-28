import type { CSSProperties } from 'vue'

// 首页技能卡片顶部统计项结构
export interface HomeSkillMetric {
  label: string // 统计项名称
  value: string // 统计项值
}

// 首页技能卡片背面详情行结构
export interface HomeSkillDetail {
  name: string // 技能名称
  level: string // 掌握程度文案
}

// 首页单个技能分组结构
export interface HomeSkillGroup {
  id: string // 分组唯一标识
  badge: string // 左上角徽标缩写
  title: string // 分组标题
  subtitle: string // 分组说明
  metrics: HomeSkillMetric[] // 正面统计项数组
  details: HomeSkillDetail[] // 背面详情数组
}

// 首页单个项目卡结构
export interface HomeProjectItem {
  id: string // 项目唯一标识
  title: string // 项目标题
  summary: string // 项目简介
  year: string // 展示年份
  tags: string[] // 技术标签数组
  href: string // 跳转地址
  internal: boolean // 是否站内路由
}

// 首页项目卡接收的样式对象
export interface HomeProjectCardStyle extends CSSProperties {
  transform?: string // 鼠标联动生成的 3D transform
}
