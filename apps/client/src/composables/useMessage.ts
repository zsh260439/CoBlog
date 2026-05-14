import { ref } from 'vue'
import { UAParser } from 'ua-parser-js'
import axios from 'axios'
import { createMessage, getMessageList, getMyMessageList } from '@/servers/message'
import { useMessageStore, useVisitorLocationStore } from '@/stores'
import type { MessageFormData, MessageItem } from '@/types/message'

export function useMessage() {
  const messages = ref<MessageItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const submitError = ref<string | null>(null)
  let loadingPromise: Promise<void> | null = null

  const submitLoading = ref(false)
  const messageStore = useMessageStore()
  const ua = new UAParser(navigator.userAgent)
  const visitorLocationStore = useVisitorLocationStore()

  const mergeMessages = (publicMessages: MessageItem[], ownMessages: MessageItem[]) => {
    const map = new Map<string, MessageItem>()
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
          getMyMessageList(messageStore.senderId),
        ])
        messages.value = mergeMessages(publicResult.data, ownResult.data)
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

  const submitMessage = async (form: MessageFormData, parentId = '') => {
    submitLoading.value = true
    submitError.value = null

    try {
      const location = await visitorLocationStore.ensureLocation(true)
      await createMessage({
        senderId: messageStore.senderId,
        author: form.author,
        content: form.content,
        parentId,
        email: form.email,
        qq: form.qq,
        device: ua.getOS().name || ua.getDevice().type || 'Unknown',
        browser: ua.getBrowser().name || '',
        enableEmailNotice: form.enableEmailNotice,
        location,
      })
      await loadMessages(true)
      return true
    } catch (err) {
      if (axios.isAxiosError(err)) {
        submitError.value = err.response?.data?.message || err.message || '留言提交失败'
      } else {
        submitError.value = '留言提交失败'
      }
      return false
    } finally {
      submitLoading.value = false
    }
  }

  return {
    messages,
    isLoading,
    error,
    submitError,
    loadMessages,
    submitMessage,
    submitLoading,
    senderId: messageStore.senderId,
  }
}
