import { computed, ref } from 'vue'
import { siteConfig } from '@/config/site'
import { createMessage, getMessageList } from '@/servers/message'
import type { GuestbookEntry } from '@/types'

export interface MessageFormData {
  author: string
  content: string
  email: string
  qq: string
  isPrivate: boolean
  enableEmailNotice: boolean
  useMarkdown: boolean
}

export function useGuestbook(immediate = true) {
  const messages = ref<GuestbookEntry[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const submitLoading = ref(false)
  const submitError = ref<string | null>(null)
  const submitSuccess = ref('')

  const loadMessages = async () => {
    isLoading.value = true
    error.value = null

    try {
      const result = await getMessageList()
      messages.value = Array.isArray(result.data) ? result.data : []
    } catch (err) {
      console.error(err)
      messages.value = []
      error.value = '留言加载失败'
    } finally {
      isLoading.value = false
    }
  }

  const submitMessage = async (form: MessageFormData) => {
    submitLoading.value = true
    submitError.value = null
    submitSuccess.value = ''

    try {
     const res =  await createMessage({
        author: form.author,
        content: form.content,
        email: form.email || undefined,
        qq: form.qq || undefined,
        location: '河南-南阳',
        device: navigator.platform || '未知设备',
        browser: navigator.userAgent,
        isPrivate: form.isPrivate,
        enableEmailNotice: form.enableEmailNotice,
        useMarkdown: form.useMarkdown,
      })
      console.log(res)
      submitSuccess.value = '留言提交成功'
      await loadMessages()
      return true
    } catch (err) {
      console.error(err)
      submitError.value = '留言提交失败'
      return false
    } finally {
      submitLoading.value = false
    }
  }

  if (immediate) {
    void loadMessages()
  }

  const totalMessages = computed(() => messages.value.length)

  const avatarStyle = (index: number) => ({
    backgroundImage: `url(${siteConfig.aboutHeroImage})`,
    backgroundPosition: `${20 + index * 18}% ${22 + index * 10}%`,
  })

  return {
    messages,
    isLoading,
    error,
    totalMessages,
    avatarStyle,
    loadMessages,
    submitMessage,
    submitLoading,
    submitError,
    submitSuccess,
  }
}
