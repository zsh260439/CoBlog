import { onBeforeUnmount, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UAParser } from 'ua-parser-js'
import {
  approveMessage,
  createAdminReply,
  createMessageEventSource,
  deleteMessage,
  getAdminMessageList,
  rejectMessage,
} from '@/servers/message'
import { useVisitorLocationStore } from '@/stores'
import type { AdminMessageItem } from '@/types/admin'

type MessageStreamAction = 'created' | 'updated' | 'deleted' | 'admin-replied'

type MessageStreamPayload = {
  action: MessageStreamAction
  message?: AdminMessageItem | null
  messageId?: string
  pendingCount?: number
  status?: AdminMessageItem['status']
}

export function useAdminMessages() {
  const messages = ref<AdminMessageItem[]>([])
  const isLoading = ref(false)
  let source: EventSource | null = null

  const ua = new UAParser(navigator.userAgent)
  const visitorLocationStore = useVisitorLocationStore()

  const loadMessages = async () => {
    isLoading.value = true
    try {
      const listResult = await getAdminMessageList()
      messages.value = listResult.data
    } finally {
      isLoading.value = false
    }
  }

  const upsertMessage = (message: AdminMessageItem) => {
    const nextMessages = [...messages.value]
    const index = nextMessages.findIndex((item) => item.id === message.id)

    if (index >= 0) {
      nextMessages[index] = message
    } else {
      nextMessages.unshift(message)
    }

    messages.value = nextMessages.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  }

  const removeMessage = (messageId: string) => {
    messages.value = messages.value.filter((item) => item.id !== messageId)
  }

  const applyStreamPayload = (rawData: string) => {
    try {
      const payload = JSON.parse(rawData) as MessageStreamPayload

      if (!payload || typeof payload !== 'object' || !payload.action) {
        throw new Error('Invalid payload')
      }

      if (payload.action === 'deleted') {
        if (payload.messageId) {
          removeMessage(payload.messageId)
        }
        return
      }

      if (payload.message) {
        upsertMessage(payload.message)
        return
      }

      if (payload.action === 'updated' || payload.action === 'created' || payload.action === 'admin-replied') {
        loadMessages()
      }
    } catch {
      loadMessages()
    }
  }

  const withAction = async (action: () => Promise<unknown>, successMessage: string) => {
    await action()
    if (!source) {
      await loadMessages()
    }
    ElMessage.success(successMessage)
  }

  const approve = (id: string) => withAction(() => approveMessage(id), '留言已通过')
  const reject = (id: string) => withAction(() => rejectMessage(id), '留言已拒绝')
  const remove = (id: string) => withAction(() => deleteMessage(id), '留言已删除')

  const batchApprove = async (ids: string[]) => {
    if (!ids.length) {
      return
    }

    await Promise.all(ids.map((id) => approveMessage(id)))
    if (!source) {
      await loadMessages()
    }
    ElMessage.success('批量通过成功')
  }

  const batchReject = async (ids: string[]) => {
    if (!ids.length) {
      return
    }

    await Promise.all(ids.map((id) => rejectMessage(id)))
    if (!source) {
      await loadMessages()
    }
    ElMessage.success('批量拒绝成功')
  }

  const reply = (id: string, payload: { author: string; content: string }) =>
    withAction(async () => {
      const location = await visitorLocationStore.ensureLocation()
      return createAdminReply(id, {
        ...payload,
        device: ua.getOS().name || ua.getDevice().type || 'Unknown',
        browser: ua.getBrowser().name || '',
        location,
      })
    }, '回复成功')

  const connect = () => {
    if (source) {
      return
    }

    const token = localStorage.getItem('local-token')
    if (!token) {
      return
    }

    source = createMessageEventSource()
    source.onerror = () => {
      console.error('SSE connection failed')
      disconnect()
    }
    source.onmessage = (event) => {
      applyStreamPayload(event.data)
    }
  }

  const disconnect = () => {
    if (source) {
      source.close()
    }
    source = null
  }

  onBeforeUnmount(disconnect)

  return {
    messages,
    isLoading,
    loadMessages,
    approve,
    reject,
    remove,
    reply,
    batchApprove,
    batchReject,
    connect,
    disconnect,
  }
}
