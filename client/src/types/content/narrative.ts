// 首页滚动叙事区块结构
export interface NarrativeSection {
  id: string // 叙事区块唯一标识
  title: string // 区块标题
  subtitle: string // 区块副标题
  content: string // 区块正文内容
  image?: string // 区块图片地址，可选
}
