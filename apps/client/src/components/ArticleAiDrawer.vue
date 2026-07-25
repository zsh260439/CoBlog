<script setup lang="ts">
import type { Component } from 'vue'
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close, CopyDocument, EditPen, MagicStick, Memo, Promotion, Tickets } from '@element-plus/icons-vue'
import { generateArticleExcerptWithAi, streamChatWithArticleAi } from '@/servers/ai'

type AiTaskKey = 'title' | 'excerpt' | 'polish' | 'structure' | 'continue' | 'taxonomy'
type ResultMode = 'none' | 'title' | 'excerpt' | 'markdown' | 'taxonomy'
type MarkdownApplyMode = 'replace' | 'append'

interface AiTask {
  key: AiTaskKey
  title: string
  icon: Component
}

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
  'update-title': [value: string]
  'update-excerpt': [value: string]
  'suggest-taxonomy': [value: { category?: string; tags: string[] }]
  'working-change': [value: boolean]
  'markdown-result-change': [value: { content: string; mode: MarkdownApplyMode } | null]
  'markdown-draft-change': [value: { content: string; mode: MarkdownApplyMode } | null]
}>()

const tasks: AiTask[] = [
  { key: 'title', title: '标题生成', icon: EditPen },
  { key: 'excerpt', title: '摘要生成', icon: Memo },
  { key: 'polish', title: '文章润色', icon: MagicStick },
  { key: 'structure', title: 'Markdown 结构优化', icon: Tickets },
  { key: 'continue', title: '根据大纲续写', icon: Promotion },
  { key: 'taxonomy', title: '标签和分类建议', icon: CopyDocument },
]

const activeTask = ref<AiTaskKey | ''>('')
const loadingTask = ref<AiTaskKey | ''>('')
const resultMode = ref<ResultMode>('none')
const resultContent = ref('')
const selectedTitle = ref('')
const selectedCategory = ref('')
const selectedTags = ref<string[]>([])
const hasPendingResult = ref(false)

const isLoading = computed(() => Boolean(loadingTask.value))
const titleOptions = computed(() => {
  return resultContent.value
    .split('\n')
    .map((item) => item.replace(/^[-*\d.、\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 5)
})

const parsedTags = computed(() => parseSuggestedTags(resultContent.value))
const parsedCategory = computed(() => parseSuggestedCategory(resultContent.value))
const isMarkdownTask = computed(() => ['polish', 'structure', 'continue'].includes(activeTask.value))
const shouldShowFloatingResult = computed(() => {
  if (resultMode.value === 'title' || resultMode.value === 'excerpt' || resultMode.value === 'taxonomy') {
    return true
  }

  return isLoading.value && !isMarkdownTask.value
})

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    return response?.data?.message || 'AI 写作任务失败'
  }

  return 'AI 写作任务失败'
}

const ensureContent = () => {
  if (props.content.trim()) {
    return true
  }

  ElMessage.warning('请先输入正文内容')
  return false
}

const resetResult = () => {
  resultMode.value = 'none'
  resultContent.value = ''
  selectedTitle.value = ''
  selectedCategory.value = ''
  selectedTags.value = []
  hasPendingResult.value = false
  emit('markdown-result-change', null)
  emit('markdown-draft-change', null)
}

const setLoadingTask = (task: AiTaskKey | '') => {
  loadingTask.value = task
  emit('working-change', Boolean(task))
}

const buildTaskPrompt = (task: AiTaskKey) => {
  const extra = props.instruction.trim()
  const prompts: Record<AiTaskKey, string> = {
    title: [
      '请基于当前文章生成 5 个中文标题。',
      '每个标题单独一行，不要编号，不要解释。',
      extra ? `额外要求：${extra}` : '',
    ].filter(Boolean).join('\n'),
    excerpt: [
      '请为当前文章生成一段 120 字以内的中文摘要。',
      '只返回摘要正文，不要标题、编号或解释。',
      extra ? `额外要求：${extra}` : '',
    ].filter(Boolean).join('\n'),
    polish: [
      '请润色当前 Markdown 正文。',
      '保持事实、代码、技术结论不变，只优化表达、衔接和可读性。',
      '只返回完整 Markdown 正文，不要解释。',
      extra ? `额外要求：${extra}` : '',
    ].filter(Boolean).join('\n'),
    structure: [
      '请优化当前 Markdown 结构。',
      '重点处理标题层级、列表层次、代码块前后说明、段落顺序和总结。',
      '不要编造新事实，只返回完整 Markdown 正文。',
      extra ? `额外要求：${extra}` : '',
    ].filter(Boolean).join('\n'),
    continue: [
      '请根据当前文章已有内容，从末尾继续续写 2 到 4 段 Markdown 内容。',
      '续写要延续当前语气，不能重复已有段落。',
      '只返回可追加到正文末尾的 Markdown 片段。',
      extra ? `额外要求：${extra}` : '',
    ].filter(Boolean).join('\n'),
    taxonomy: [
      '请根据当前文章给出 1 个分类建议和 5 个标签建议。',
      '输出格式固定为：',
      '分类：xxx',
      '标签：tag1, tag2, tag3, tag4, tag5',
      '不要解释。',
      extra ? `额外要求：${extra}` : '',
    ].filter(Boolean).join('\n'),
  }

  return prompts[task]
}

const parseSuggestedTags = (content: string) => {
  const tagLine = content
    .split('\n')
    .find((line) => line.trim().startsWith('标签'))

  if (!tagLine) {
    return []
  }

  return tagLine
    .replace(/^标签[:：]/, '')
    .split(/[,，、\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

const parseSuggestedCategory = (content: string) => {
  const categoryLine = content
    .split('\n')
    .find((line) => line.trim().startsWith('分类'))

  return categoryLine ? categoryLine.replace(/^分类[:：]/, '').trim() : ''
}

const streamTaskResult = async (task: AiTaskKey) => {
  resultContent.value = ''
  const markdownMode: MarkdownApplyMode = task === 'continue' ? 'append' : 'replace'

  await streamChatWithArticleAi(
    {
      title: props.title.trim(),
      content: props.content,
      instruction: props.instruction.trim(),
      messages: [
        {
          role: 'user',
          content: buildTaskPrompt(task),
        },
      ],
    },
    (chunk) => {
      resultContent.value += chunk
      if (['polish', 'structure', 'continue'].includes(task)) {
        emit('markdown-draft-change', {
          content: resultContent.value,
          mode: markdownMode,
        })
      }
    },
  )

  resultContent.value = resultContent.value.trim()
}

const prepareResultByTask = (task: AiTaskKey) => {
  if (task === 'title') {
    resultMode.value = 'title'
    selectedTitle.value = titleOptions.value[0] || ''
    return
  }

  if (task === 'excerpt') {
    resultMode.value = 'excerpt'
    return
  }

  if (task === 'taxonomy') {
    resultMode.value = 'taxonomy'
    selectedCategory.value = parsedCategory.value
    selectedTags.value = parsedTags.value
    return
  }

  resultMode.value = 'markdown'
  emit('markdown-result-change', {
    content: resultContent.value,
    mode: task === 'continue' ? 'append' : 'replace',
  })
}

const runTask = async (task: AiTaskKey) => {
  activeTask.value = task
  if (!ensureContent()) {
    return
  }

  resetResult()
  setLoadingTask(task)

  try {
    if (task === 'excerpt') {
      const response = await generateArticleExcerptWithAi({
        title: props.title.trim(),
        content: props.content,
        instruction: props.instruction.trim(),
        excerptLength: 120,
      })
      resultContent.value = response.data.excerpt.trim()
    } else {
      await streamTaskResult(task)
    }

    prepareResultByTask(task)
    hasPendingResult.value = true
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    setLoadingTask('')
  }
}

const toggleTag = (tag: string) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter((item) => item !== tag)
    return
  }

  selectedTags.value = [...selectedTags.value, tag]
}

const acceptResult = () => {
  const content = resultContent.value.trim()
  if (!content && resultMode.value !== 'taxonomy') {
    ElMessage.warning('当前没有可采纳内容')
    return
  }

  if (resultMode.value === 'title') {
    if (!selectedTitle.value) {
      ElMessage.warning('请选择一个标题')
      return
    }
    emit('update-title', selectedTitle.value)
    ElMessage.success('标题已填入')
  }

  if (resultMode.value === 'excerpt') {
    emit('update-excerpt', content)
    ElMessage.success('摘要已填入')
  }

  if (resultMode.value === 'taxonomy') {
    emit('suggest-taxonomy', {
      category: selectedCategory.value,
      tags: selectedTags.value,
    })
    ElMessage.success('分类和标签已覆盖到右侧表单')
  }

  resetResult()
}

const rejectResult = () => {
  resetResult()
  ElMessage.info('已拒绝本次 AI 结果')
}

const closeToolbar = async () => {
  if (hasPendingResult.value || isLoading.value) {
    try {
      await ElMessageBox.confirm(
        '关闭后，本次未采纳的 AI 结果会被丢弃。确认关闭吗？',
        '关闭 AI 写作工具条',
        {
          confirmButtonText: '确认关闭',
          cancelButtonText: '继续使用',
          type: 'warning',
        },
      )
    } catch {
      return
    }
  }

  resetResult()
  setLoadingTask('')
  emit('update:visible', false)
}

watch(() => props.visible, (visible) => {
  if (visible) {
    resetResult()
    activeTask.value = ''
  }
})

defineExpose({
  clearPendingResult: resetResult,
})
</script>

<template>
  <Teleport to="body">
    <Transition name="ai-toolbar">
      <div v-if="visible" class="ai-toolbar" role="region" aria-label="AI 写作工具条">
        <div class="ai-toolbar__inner">
          <button
            v-for="task in tasks"
            :key="task.key"
            type="button"
            class="ai-toolbar__task"
            :class="{ 'ai-toolbar__task--active': activeTask === task.key }"
            :disabled="isLoading"
            @click="runTask(task.key)"
          >
            <el-icon><component :is="task.icon" /></el-icon>
            <span>{{ loadingTask === task.key ? '生成中...' : task.title }}</span>
          </button>

          <button class="ai-toolbar__close" type="button" aria-label="关闭 AI 写作工具条" @click="closeToolbar">
            ×
          </button>
        </div>

        <Transition name="ai-result">
          <div v-if="shouldShowFloatingResult" class="ai-result-card">
            <div class="ai-result-card__header">
              <strong>{{ isLoading ? 'AI 正在生成' : '选择是否采纳' }}</strong>
              <span>{{ isMarkdownTask ? '生成期间正文编辑区已锁定' : '结果不会自动覆盖表单' }}</span>
            </div>

            <div v-if="resultMode === 'title'" class="ai-choice-list">
              <button
                v-for="title in titleOptions"
                :key="title"
                type="button"
                :class="{ 'ai-choice--active': selectedTitle === title }"
                @click="selectedTitle = title"
              >
                {{ title }}
              </button>
            </div>

            <div v-else-if="resultMode === 'taxonomy'" class="ai-taxonomy-box">
              <label>
                <span>分类</span>
                <input v-model="selectedCategory" type="text" />
              </label>
              <div class="ai-tag-options">
                <button
                  v-for="tag in parsedTags"
                  :key="tag"
                  type="button"
                  :class="{ 'ai-choice--active': selectedTags.includes(tag) }"
                  @click="toggleTag(tag)"
                >
                  {{ tag }}
                </button>
              </div>
            </div>

            <pre v-else class="ai-stream-result">{{ resultContent || '生成中...' }}</pre>

            <div v-if="!isLoading && resultMode !== 'none' && resultMode !== 'markdown'" class="ai-result-card__actions">
              <el-button size="small" :icon="Close" @click="rejectResult">拒绝</el-button>
              <el-button size="small" type="primary" :icon="Check" @click="acceptResult">采纳</el-button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ai-toolbar {
  position: fixed;
  top: 74px;
  left: 50%;
  z-index: 10000;
  width: min(820px, calc(100vw - 40px));
  transform: translateX(-50%);
  pointer-events: none;
}

.ai-toolbar__inner,
.ai-result-card {
  border: 1px solid rgba(229, 231, 235, 0.82);
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(18px);
  pointer-events: auto;
}

.ai-toolbar__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
  padding: 8px;
  overflow-x: auto;
  border-radius: 16px;
}

.ai-toolbar__task,
.ai-toolbar__close {
  height: 36px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.ai-toolbar__task {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  animation: toolbarTaskIn 0.22s ease-out both;
}

.ai-toolbar__task:nth-child(1) { animation-delay: 0.02s; }
.ai-toolbar__task:nth-child(2) { animation-delay: 0.05s; }
.ai-toolbar__task:nth-child(3) { animation-delay: 0.08s; }
.ai-toolbar__task:nth-child(4) { animation-delay: 0.11s; }
.ai-toolbar__task:nth-child(5) { animation-delay: 0.14s; }
.ai-toolbar__task:nth-child(6) { animation-delay: 0.17s; }

.ai-toolbar__task:hover,
.ai-toolbar__task--active {
  border-color: rgba(17, 24, 39, 0.14);
  background: rgba(248, 250, 252, 0.86);
}

.ai-toolbar__task--active {
  color: #111111;
  transform: translateY(-1px);
}

.ai-toolbar__task:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.ai-toolbar__close {
  width: 36px;
  flex: 0 0 36px;
  margin-left: 2px;
  border-color: rgba(209, 213, 219, 0.9);
  color: #6b7280;
  font-size: 20px;
  line-height: 1;
}

.ai-toolbar__close:hover {
  background: rgba(248, 250, 252, 0.9);
  color: #111111;
}

.ai-result-card {
  width: min(680px, 100%);
  margin: 12px auto 0;
  padding: 12px;
  border-radius: 16px;
}

.ai-result-card__header,
.ai-result-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ai-result-card__header strong {
  color: #111827;
  font-size: 13px;
}

.ai-result-card__header span {
  color: #6b7280;
  font-size: 12px;
}

.ai-choice-list,
.ai-tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.ai-choice-list button,
.ai-tag-options button {
  border: 1px solid rgba(209, 213, 219, 0.88);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.72);
  color: #374151;
  cursor: pointer;
}

.ai-choice-list button {
  width: 100%;
  padding: 9px 10px;
  text-align: left;
}

.ai-tag-options button {
  padding: 7px 10px;
}

.ai-choice-list button:hover,
.ai-tag-options button:hover,
.ai-choice--active {
  border-color: #111827 !important;
  color: #111827 !important;
  background: rgba(255, 255, 255, 0.94) !important;
}

.ai-taxonomy-box {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.ai-taxonomy-box label {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 12px;
}

.ai-taxonomy-box input {
  height: 34px;
  border: 1px solid rgba(209, 213, 219, 0.88);
  border-radius: 10px;
  padding: 0 10px;
  background: rgba(255, 255, 255, 0.74);
  color: #111827;
  outline: none;
}

.ai-stream-result {
  max-height: 280px;
  margin: 12px 0 0;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  color: #111827;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.75;
}

.ai-result-card__actions {
  justify-content: flex-end;
  margin-top: 12px;
}

.ai-result-card__actions :deep(.el-button--primary) {
  --el-button-bg-color: #111111;
  --el-button-border-color: #111111;
  --el-button-hover-bg-color: #2c2c2c;
  --el-button-hover-border-color: #2c2c2c;
}

.ai-toolbar-enter-active,
.ai-toolbar-leave-active,
.ai-result-enter-active,
.ai-result-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.ai-toolbar-enter-from,
.ai-toolbar-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}

.ai-result-enter-from,
.ai-result-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@keyframes toolbarTaskIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 760px) {
  .ai-toolbar {
    top: 62px;
    width: calc(100vw - 20px);
  }

  .ai-toolbar__inner {
    justify-content: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai-toolbar-enter-active,
  .ai-toolbar-leave-active,
  .ai-result-enter-active,
  .ai-result-leave-active,
  .ai-toolbar__task,
  .ai-toolbar__close {
    animation: none;
    transition: none;
  }
}
</style>
