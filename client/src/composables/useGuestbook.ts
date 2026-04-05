import { computed } from 'vue'
import { siteConfig } from '@/config/site'
import type { GuestbookEntry } from '@/types'

const guestbookEntries: GuestbookEntry[] = [
  {
    id: 'message-1',
    author: 'FeiTwnd',
    location: '河南-方城',
    device: 'Android',
    browser: 'Chrome',
    content: '占楼占楼😙',
    createdAt: '2026-02-21T11:13:00.000Z'
  },
  {
    id: 'message-2',
    author: '宿傩',
    location: '河南-南阳',
    device: 'Android',
    browser: 'Chrome',
    content: '差点找不到在哪',
    createdAt: '2026-02-21T11:15:00.000Z'
  },
  {
    id: 'message-3',
    author: 'Zsint',
    location: '河南-南阳',
    device: 'Windows',
    browser: 'Edge',
    content: '这个页面后面会把真实留言接口接上，现在先把版式和视觉跑顺。',
    createdAt: '2026-02-21T11:22:00.000Z'
  },
  {
    id: 'message-4',
    author: 'Lemon',
    location: '江苏-苏州',
    device: 'iPhone',
    browser: 'Safari',
    content: '顶部大图和内容区的衔接现在顺眼多了，等评论接起来应该会更完整。',
    createdAt: '2026-02-21T11:39:00.000Z'
  }
]

export function useGuestbook() {
  const messages = computed(() => guestbookEntries)
  const totalMessages = computed(() => 24)

  const avatarStyle = (index: number) => ({
    backgroundImage: `url(${siteConfig.aboutHeroImage})`,
    backgroundPosition: `${20 + index * 18}% ${22 + index * 10}%`
  })

  return {
    messages,
    totalMessages,
    avatarStyle
  }
}
