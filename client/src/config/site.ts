import type {  SiteNavItem } from '@/types/site'
import type { AboutTechItem } from '@/types/ui'

export const siteConfig = {
  name: 'CoBlog',
  ownerName: 'Zsint',
  ownerRole: '前端开发',
  ownerLocation: '湖北武汉',
  tagline: '分享自己的学习过程',
  description: '一个记录学习过程的个人博客网站',
  aboutHeroImage: '/images/about-hero.png',
  footerVersion: 'Hello World!',
  footerLicense: '共同学习!',
  siteStatsSnapshot: {
    onlineUsers: 0,
    todayViews: 0,
    totalViews: 0,
    totalVisitors: 0
  }
}

export const primaryNav: SiteNavItem[] = [
  { label: '主页', path: '/', routeNames: ['home'] },
  { label: '博客', path: '/blog', routeNames: ['blog', 'article', 'category'] },
  { label: '归档', path: '/archive', routeNames: ['archive'] },
  { label: '留言', path: '/message', routeNames: ['message'] },
  { label: '关于', path: '/about', routeNames: ['about'] }
]


export const aboutProfileCard = {
  avatar: '/images/about-hero.png',
  email: '2604391962@qq.com',
  socials: ['GitHub', 'QQ', 'Gitee'],
}

export const aboutTechItems: AboutTechItem[] = [
  {
    name: 'JavaScript',
    short: 'JS',
    description: '事件循环 / 原型链 / 浏览器执行上下文',
    icon: 'https://cdn.simpleicons.org/javascript/F7DF1E',
    accent: '#f7df1e'
  },
  {
    name: 'Vue',
    short: 'VUE',
    description: '响应式视图层 / 组件抽象 / 组合式逻辑',
    icon: 'https://cdn.simpleicons.org/vuedotjs/42b883',
    accent: '#42b883'
  },
  {
    name: 'Nuxt',
    short: 'NXT',
    description: '同构渲染 / 内容驱动 / 站点级工程方案',
    icon: 'https://cdn.simpleicons.org/nuxt/00dc82',
    accent: '#00dc82'
  },
  {
    name: 'NestJS',
    short: 'NST',
    description: '模块化后端 / 装饰器风格 / 服务边界清晰',
    icon: 'https://cdn.simpleicons.org/nestjs/e0234e',
    accent: '#e0234e'
  },
  {
    name: 'Node.js',
    short: 'NOD',
    description: '运行时生态 / 脚本自动化 / 服务编排基础',
    icon: 'https://cdn.simpleicons.org/nodedotjs/5fa04e',
    accent: '#5fa04e'
  },
  {
    name: 'TypeScript',
    short: 'TS',
    description: '类型约束 / 接口协作 / 工程可维护性',
    icon: 'https://cdn.simpleicons.org/typescript/3178c6',
    accent: '#3178c6'
  },
  {
    name: 'Express',
    short: 'EXP',
    description: '轻量服务层 / 中间件生态 / 接口原型搭建',
    icon: 'https://cdn.simpleicons.org/express/3a3f46',
    accent: '#3a3f46'
  },
  {
    name: 'MongoDB',
    short: 'MDB',
    description: '文档数据建模 / 内容存储 / 灵活扩展结构',
    icon: 'https://cdn.simpleicons.org/mongodb/47a248',
    accent: '#47a248'
  },
  {
    name: 'Element Plus',
    short: 'EL+',
    description: '后台交互组件 / 表单体系 / 管理端效率',
    icon: 'https://cdn.simpleicons.org/element/409eff',
    accent: '#409eff'
  },
  {
    name: 'ECharts',
    short: 'ECH',
    description: '图表表达 / 数据面板 / 后台可视化能力',
    icon: 'https://cdn.simpleicons.org/apacheecharts/aa344d',
    accent: '#aa344d'
  },
  {
    name: 'Markdown',
    short: 'MD',
    description: '结构化写作 / 内容沉淀 / 长期维护友好',
    icon: 'https://cdn.simpleicons.org/markdown/000000',
    accent: '#6b7280'
  },
  {
    name: 'Vite',
    short: 'VIT',
    description: '开发期极速反馈 / 构建链简洁 / 工具现代化',
    icon: 'https://cdn.simpleicons.org/vite/646cff',
    accent: '#646cff'
  }
]
