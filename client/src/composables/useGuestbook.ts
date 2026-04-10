import { ref } from 'vue'
import { createMessage, getMessageList } from '@/servers/message'
import type { GuestbookEntry, MessageFormData } from '@/types/message'

export function useGuestbook(immediate = true) {
  const messages = ref<GuestbookEntry[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const submitLoading = ref(false)

  const loadMessages = async () => {
    isLoading.value = true
    error.value = null

    try {
      const result = await getMessageList()
      messages.value = Array.isArray(result.data) ? result.data : []
    } catch {
      messages.value = []
      error.value = '留言加载失败'
    } finally {
      isLoading.value = false
    }
  }

  const submitMessage = async (form: MessageFormData) => {
    submitLoading.value = true

    try {
      await createMessage({
        author: form.author,
        content: form.content,
        email: form.email || undefined,
        qq: form.qq || undefined,
        device: navigator.platform || '未知设备',
        browser: navigator.userAgent,
        isPrivate: form.isPrivate,
        enableEmailNotice: form.enableEmailNotice,
        useMarkdown: form.useMarkdown,
      })
      await loadMessages()
      return true
    } catch {
      return false
    } finally {
      submitLoading.value = false
    }
  }

  if (immediate) {
    void loadMessages()
  }

  return {
    messages,
    isLoading,
    error,
    loadMessages,
    submitMessage,
    submitLoading,
  }
}
