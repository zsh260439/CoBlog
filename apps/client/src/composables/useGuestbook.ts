import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { UAParser } from 'ua-parser-js'
import { createMessage, getMessageList, getMyMessageList } from '@/servers/message'
import type { GuestbookEntry, MessageFormData } from '@/types/message'
import { getClientLocation } from '@/utils'

// senderId 只负责标识"这个浏览器"，用来恢复自己的待审核/被拒绝留言状态。
const MESSAGE_SENDER_ID_KEY = 'guestbook:sender-id'

export function useGuestbook() {
  const messages = ref<GuestbookEntry[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let loadingPromise: Promise<void> | null = null

  const submitLoading = ref(false)

  // senderId 本地持久化一次即可，刷新后继续沿用。
  const senderId = localStorage.getItem(MESSAGE_SENDER_ID_KEY) || uuidv4()
  localStorage.setItem(MESSAGE_SENDER_ID_KEY, senderId)

  // 设备和浏览器信息只在前台采集一次，提交时直接带给后端。
  const ua = new UAParser(navigator.userAgent)

  // 公开留言 + 自己的 pending/rejected 留言合并后按时间倒序展示。
  const mergeMessages = (publicMessages: GuestbookEntry[], ownMessages: GuestbookEntry[]) => {
    const map = new Map<string, GuestbookEntry>()
    ;[...ownMessages, ...publicMessages].forEach((item) => map.set(item.id, item))
    return [...map.values()].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  }

  const loadMessages = async (force = false) => {
    if (!force && messages.value.length) {
      return
    }

    if (loadingPromise) {
      return loadingPromise
    }

    isLoading.value = true
    error.value = null

    loadingPromise = (async () => {
      try {
        const [publicResult, ownResult] = await Promise.all([
          getMessageList(),
          getMyMessageList(senderId),
        ])
        const publicMessages = Array.isArray(publicResult.data) ? publicResult.data : []
        const ownMessages = Array.isArray(ownResult.data) ? ownResult.data : []
        messages.value = mergeMessages(publicMessages, ownMessages)
      } catch {
        messages.value = []
        error.value = '留言加载失败'
      } finally {
        isLoading.value = false
        loadingPromise = null
      }
    })()

    return loadingPromise
  }
  // 提交留言
  const submitMessage = async (form: MessageFormData, parentId = '') => {
    submitLoading.value = true

    try {
      const { location } = await getClientLocation()
      await createMessage({
        senderId,
        author: form.author,
        content: form.content,
        parentId: parentId || undefined,
        email: form.email || undefined,
        qq: form.qq || undefined,
        device: ua.getOS().name || ua.getDevice().type || 'Unknown',
        browser: ua.getBrowser().name || '',
        enableEmailNotice: form.enableEmailNotice,
        location: location || undefined,
      })
      await loadMessages(true)
      return true
    } catch {
      return false
    } finally {
      submitLoading.value = false
    }
  }

  return {
    messages,
    isLoading,
    error,
    loadMessages,
    submitMessage,
    submitLoading,
    senderId,
  }
}
