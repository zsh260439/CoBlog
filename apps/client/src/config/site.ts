import type { SiteNavItem } from '@/types/site'

export const siteConfig = {
  name: 'CoBlog',
  siteUrl: 'https://coblog.top',
  ownerName: 'Zsint',
  ownerRole: '全栈开发',
  ownerLocation: '湖北武汉',
  description: '一个记录学习过程的博客网站',
  aboutHeroImage: '/images/about-hero.png',
  footerLicense: '共同学习!',
  beian: {
    icpNumber: '鄂ICP备2026024086号-1',
    icpUrl: 'https://beian.miit.gov.cn/',
    publicSecurityNumber: '',
    publicSecurityUrl: '',
  },
  siteStatsSnapshot: {
    onlineUsers: 0,
    todayViews: 0,
    totalViews: 0,
    totalVisitors: 0,
  },
}

export const primaryNav: SiteNavItem[] = [
  { label: '主页', path: '/', routeNames: ['home'] },
  { label: '博客', path: '/blog', routeNames: ['blog', 'article', 'category'] },
  { label: '归档', path: '/archive', routeNames: ['archive'] },
  { label: '留言', path: '/message', routeNames: ['message'] },
  { label: '关于', path: '/about', routeNames: ['about'] },
]

export const aboutProfileCard = {
  avatar: '/images/about-hero.png',
  email: '2604391962@qq.com',
}
