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

export function useAdminMessages() {
  const messages = ref<AdminMessageItem[]>([])
  const isLoading = ref(false)
  // 事件源
  let source: EventSource | null = null
  const ua = new UAParser(navigator.userAgent)
  const visitorLocationStore = useVisitorLocationStore()
  //默认走sse，没有sse时走loadMessages
  const loadMessages = async () => {
    isLoading.value = true
    try {
      const listResult = await getAdminMessageList()
      messages.value = listResult.data
    } finally {
      isLoading.value = false
    }
  }

  const withAction = async (id: string, action: () => Promise<unknown>, success: string) => {
    try {
      await action()
      if (!source) {
        await loadMessages()
      }
      ElMessage.success(success)
    } finally {}
  }

  const approve = (id: string) => withAction(id, () => approveMessage(id), '留言已通过')
  const reject = (id: string) => withAction(id, () => rejectMessage(id), '留言已拒绝')
  const remove = (id: string) => withAction(id, () => deleteMessage(id), '留言已删除')

  const batchApprove = async (ids: string[]) => {
    if (!ids.length) return
    await Promise.all(ids.map((id) => approveMessage(id)))
    if (!source) {
      await loadMessages()
    }
    ElMessage.success('批量通过成功')
  }

  const batchReject = async (ids: string[]) => {
    if (!ids.length) return
    await Promise.all(ids.map((id) => rejectMessage(id)))
    if (!source) {
      await loadMessages()
    }
    ElMessage.success('批量拒绝成功')
  }

   //回复留言
  const reply = (id: string, payload: { author: string; content: string }) =>
    withAction(id, async () => {
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
    if (!token) return
    //创建事件源
    source = createMessageEventSource(token)
    //监听错误事件
    source.onerror = () => {
      console.error('SSE connection failed')
      disconnect()
    }
    //监听消息事件
    source.onmessage = async () => {
      await loadMessages()
    }
  }
  
  const disconnect = () => {
    if (source) {
      source.close()
    }
    source = null
  }
 //在组件卸载时断开连接
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
