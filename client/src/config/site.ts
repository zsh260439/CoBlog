import type { SiteCategory, SiteLink, SiteNavItem, SiteSection } from '@/types'

export const siteConfig = {
  name: 'CoBlog',
  ownerName: 'Zsint',
  ownerRole: '前端开发 / 内容记录',
  ownerLocation: '河南南阳',
  tagline: '代码与故事的交汇处',
  description: '记录开发实践、设计思考与持续表达的个人空间。',
  aboutHeroImage: '/images/about-hero.png',
  footerVersion: '2026.04.01',
  footerLicense: 'MIT License',
  siteStatsSnapshot: {
    onlineUsers: 15,
    todayViews: 25,
    totalViews: 5703,
    totalVisitors: 342
  }
}

export const primaryNav: SiteNavItem[] = [
  { label: '主页', path: '/', routeNames: ['home'] },
  { label: '博客', path: '/blog', routeNames: ['blog', 'article', 'category'] },
  { label: '归档', path: '/archive', routeNames: ['archive'] },
  { label: '留言', path: '/message', routeNames: ['message'] },
  { label: '关于', path: '/about', routeNames: ['about'] }
]

export const categoryOptions: SiteCategory[] = [
  { label: '心得', slug: 'insight' },
  { label: '日常', slug: 'daily' },
  { label: '技术', slug: 'technology' }
]

export const aboutSections: SiteSection[] = [
  {
    title: '关于我',
    paragraphs: [
      '这里是一个围绕前端开发、界面设计和内容表达展开的个人空间。它不追求喧闹，而是更在意信息是否清楚、节奏是否顺手、页面是否耐看。',
      '我更喜欢让页面在第一眼就建立氛围，然后在持续浏览时慢慢交付内容和细节，让设计真正服务于阅读。'
    ]
  },
  {
    title: '关于博客',
    paragraphs: [
      '这个博客承载的是长期积累：开发中的记录、布局上的尝试、组件拆分的思考，以及把想法整理成可阅读内容的过程。',
      '它既是作品集，也是实验场。每次改动都尽量沿着现有结构续写，而不是推倒重来。'
    ]
  },
  {
    title: '写作方式',
    paragraphs: [
      '文章会优先保证结构明确，先给上下文，再交付过程，最后给出结论和可复用的方法。',
      '界面上则保持克制：用清晰的层次、稳定的留白和适量的强调，避免视觉元素抢走内容本身的注意力。'
    ]
  }
]

export const messageSections: SiteSection[] = [
  {
    title: '留言说明',
    paragraphs: [
      '当前页面先预留了留言区的视觉结构，方便你后续直接接入后端接口和数据库模型。',
      '在正式留言功能接入前，这里更适合作为联系说明、合作意向和页面反馈的汇总入口。'
    ]
  },
  {
    title: '偏好内容',
    paragraphs: [
      '如果你在意的是页面布局、交互体验、组件拆分、可维护性或者工程化实践，这里会是比较适合交流的方向。',
      '后续上线真实留言功能后，可以在这个页面延续当前卡片布局，直接补充表单和消息列表。'
    ]
  }
]

export const contactLinks: SiteLink[] = [
  {
    label: 'GitHub',
    description: '代码仓库与项目沉淀，后续可以替换成真实地址。'
  },
  {
    label: '邮箱',
    description: '适合正式沟通、合作联系或较长内容的反馈。'
  },
  {
    label: '站内留言',
    description: '前端布局已预留，后端留言功能可在下一阶段接入。'
  }
]
