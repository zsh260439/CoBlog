<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { streamChatWithArticleAi } from '@/servers/ai'
import type { AiChatMessage } from '@/types/admin/ai'
import AIChatInput from '@/components/ui/AIChatInput.vue'

const AI_PENDING_MESSAGE = '已发送，请耐心等待 AI 回复...'

const props = defineProps<{
  visible: boolean
  title: string
  content: string
  instruction: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'replace-content': [value: string]
  'append-content': [value: string]
}>()

const aiChatLoading = ref(false)
const aiChatInput = ref('')
const aiOverlayPressed = ref(false)
const aiMessagesRef = ref<HTMLElement | null>(null)
const aiStickToBottom = ref(true)
const aiMessages = ref<AiChatMessage[]>([
  {
    role: 'assistant',
    content: '你好，我可以帮你把零散笔记整理成 Markdown 正文，也可以直接回答技术问题。你可以直接说：请根据当前内容生成一篇结构完整的文章。',
  },
])

const latestAssistantMessage = computed(() => {
  const message = [...aiMessages.value].reverse().find((item) => item.role === 'assistant')
  return message ? message.content : ''
})

const updateAiStickToBottom = () => {
  const container = aiMessagesRef.value
  if (!container) {
    aiStickToBottom.value = true
    return
  }

  const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight
  aiStickToBottom.value = distanceToBottom <= 32
}

const scrollAiMessagesToBottom = (force = false) => {
  requestAnimationFrame(() => {
    const container = aiMessagesRef.value
    if (!container) {
      return
    }

    if (!force && !aiStickToBottom.value) {
      return
    }

    container.scrollTop = container.scrollHeight
  })
}

const handleSendAiMessage = async () => {
  if (!aiChatInput.value.trim()) {
    ElMessage.warning('请输入你想让 AI 帮你完成的内容')
    return
  }

  const nextMessages: AiChatMessage[] = [
    ...aiMessages.value,
    {
      role: 'user',
      content: aiChatInput.value.trim(),
    },
  ]

  aiMessages.value = nextMessages
  aiChatLoading.value = true
  const currentQuestion = aiChatInput.value.trim()
  aiChatInput.value = ''

  aiMessages.value = [
    ...nextMessages,
    {
      role: 'assistant',
      content: AI_PENDING_MESSAGE,
    },
  ]

  const assistantIndex = aiMessages.value.length - 1
  let hasReceivedChunk = false
  scrollAiMessagesToBottom()

  try {
    await streamChatWithArticleAi({
      title: props.title.trim(),
      content: props.content,
      instruction: props.instruction.trim(),
      messages: nextMessages.filter((item) => item.role === 'user' || item.role === 'assistant'),
    }, (chunk) => {
      if (!hasReceivedChunk) {
        aiMessages.value[assistantIndex].content = chunk
        hasReceivedChunk = true
      } else {
        aiMessages.value[assistantIndex].content += chunk
      }

      scrollAiMessagesToBottom()
    })
  } catch (error: any) {
    aiMessages.value[assistantIndex].content = `AI 请求失败：${error?.message || '请稍后重试'}`
    aiChatInput.value = currentQuestion
    scrollAiMessagesToBottom()
  } finally {
    aiChatLoading.value = false
  }
}

const applyAiAnswerToContent = (mode: 'replace' | 'append') => {
  const answer = latestAssistantMessage.value.trim()

  if (!answer) {
    ElMessage.warning('当前没有可应用到正文的 AI 回复')
    return
  }

  if (mode === 'replace') {
    emit('replace-content', answer)
  } else {
    emit('append-content', answer)
  }

  ElMessage.success(mode === 'replace' ? '已用 AI 回复替换正文' : '已追加到正文末尾')
}

const handleResendAiMessage = async () => {
  const lastUserMsg = [...aiMessages.value].reverse().find((message) => message.role === 'user')
  if (!lastUserMsg) return

  aiChatInput.value = lastUserMsg.content
  aiMessages.value = aiMessages.value.filter((message) => message !== lastUserMsg)
  await handleSendAiMessage()
}

const copyAiMessage = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const handleSendAiChat = async (text: string) => {
  aiChatInput.value = text
  await handleSendAiMessage()
}

const closeAiDrawer = () => {
  if (!aiChatInput.value.trim()) {
    emit('update:visible', false)
    return
  }

  const confirmed = window.confirm('确认退出 AI 对话助手吗？未处理的对话或输入内容可能会丢失。')
  if (!confirmed) {
    return
  }

  emit('update:visible', false)
}

const handleAiOverlayMouseDown = () => {
  aiOverlayPressed.value = true
}

const handleAiOverlayMouseUp = () => {
  if (!aiOverlayPressed.value) {
    return
  }

  aiOverlayPressed.value = false
  closeAiDrawer()
}

const resetAiOverlayPressed = () => {
  aiOverlayPressed.value = false
}

watch(() => props.visible, (visible) => {
  if (visible) {
    aiStickToBottom.value = true
    scrollAiMessagesToBottom(true)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="ai-modal">
      <div
        v-if="visible"
        class="ai-modal-overlay"
        @mousedown.self="handleAiOverlayMouseDown"
        @mouseup.self="handleAiOverlayMouseUp"
        @mouseleave="resetAiOverlayPressed"
      >
        <div class="ai-modal">
          <div class="ai-modal__header">
            <span>AI 写作助手</span>
            <button class="ai-modal__close" @click="closeAiDrawer">✕</button>
          </div>

          <div class="ai-modal__messages" ref="aiMessagesRef" @scroll="updateAiStickToBottom">
            <div
              v-for="(msg, index) in aiMessages"
              :key="`${msg.role}-${index}`"
              class="ai-chat__row"
              :class="msg.role === 'user' ? 'ai-chat__row--user' : 'ai-chat__row--ai'"
            >
              <div class="ai-chat__bubble">
                <pre class="ai-chat__text">{{ msg.content }}</pre>
              </div>

              <div v-if="msg.role === 'assistant' && index === aiMessages.length - 1" class="ai-chat__bubble-actions">
                <button class="ai-action-btn" title="刷新回复" @click="handleResendAiMessage">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                </button>
                <button class="ai-action-btn" title="复制内容" @click="copyAiMessage(msg.content)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
                <button class="ai-action-btn" title="替换正文" @click="applyAiAnswerToContent('replace')">替换</button>
                <button class="ai-action-btn" title="追加到正文" @click="applyAiAnswerToContent('append')">追加</button>
              </div>
            </div>
          </div>

          <div class="ai-modal__input">
            <AIChatInput :loading="aiChatLoading" v-model="aiChatInput" @submit="handleSendAiChat" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ai-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.ai-modal {
  width: min(600px, 100%);
  max-height: 80vh;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 0.9rem;
  font-weight: 600;
  color: #111;
}

.ai-modal__close {
  border: none;
  background: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.ai-modal__close:hover {
  background: #f3f4f6;
  color: #111;
}

.ai-modal__messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 200px;
  max-height: 50vh;
}

.ai-modal__input {
  padding: 12px 16px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.ai-modal-enter-active { transition: opacity 0.2s ease; }
.ai-modal-leave-active { transition: opacity 0.15s ease; }
.ai-modal-enter-from,
.ai-modal-leave-to { opacity: 0; }

.ai-modal-enter-active .ai-modal { animation: modalSlideIn 0.25s cubic-bezier(0.22, 1, 0.36, 1); }
.ai-modal-leave-active .ai-modal { animation: modalSlideOut 0.15s ease; }

@keyframes modalSlideIn {
  from { transform: translateY(16px) scale(0.97); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

@keyframes modalSlideOut {
  from { transform: translateY(0) scale(1); opacity: 1; }
  to { transform: translateY(8px) scale(0.98); opacity: 0; }
}

.ai-chat__row {
  display: flex;
  flex-direction: column;
  max-width: 85%;
}

.ai-chat__row--user {
  align-self: flex-end;
  align-items: flex-end;
}

.ai-chat__row--ai {
  align-self: flex-start;
  align-items: flex-start;
}

.ai-chat__bubble {
  border-radius: 16px;
  padding: 12px 16px;
}

.ai-chat__row--user .ai-chat__bubble {
  background: #111;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.ai-chat__row--ai .ai-chat__bubble {
  background: #f3f4f6;
  color: #111827;
  border-bottom-left-radius: 4px;
}

.ai-chat__text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  font-size: 0.85rem;
  line-height: 1.7;
}

.ai-chat__bubble-actions {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.ai-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: #fff;
  color: #6b7280;
  font-size: 0.72rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ai-action-btn:hover {
  background: #f3f4f6;
  border-color: rgba(0, 0, 0, 0.15);
  color: #111;
}
</style>
