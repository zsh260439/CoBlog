import type {  SiteNavItem } from '@/types/site'

export const siteConfig = {
  name: 'CoBlog',
  siteUrl: 'https://coblog.top',
  ownerName: 'Zsint',
  ownerRole: '全栈开发',
  ownerLocation: '湖北武汉',
  description: '一个记录学习过程的博客网站',
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
}
