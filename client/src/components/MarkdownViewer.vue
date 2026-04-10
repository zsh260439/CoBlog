<script setup lang="ts">
import { computed } from 'vue'
import { MdPreview } from 'md-editor-v3'
import type { HeadList, MdHeadingId } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { API_BASE_URL } from '@/config/http'
import type { MarkdownHeading } from '@/types/content'
import type { MarkdownViewerProps } from '@/types/ui'

const props = withDefaults(defineProps<MarkdownViewerProps>(), {
  editorId: 'article-preview'
})

const emit = defineEmits<{
  catalogChange: [items: MarkdownHeading[]]
}>()

const createHeadingId = (text: string, index: number) => {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-') || 'section'

  return `${base}-${index}`
}

const resolveHeadingId: MdHeadingId = ({ text, index }) => createHeadingId(text, index)

const resolvedContent = computed(() => {
  return props.content
    .replace(/\]\((\/uploads\/[^)]+)\)/g, (_, path: string) => `](${API_BASE_URL}${path})`)
    .replace(/src=(['"])\/uploads\//g, (_, quote: string) => `src=${quote}${API_BASE_URL}/uploads/`)
})

const handleCatalogChange = (items: HeadList[]) => {
  emit('catalogChange', items.map((item, index) => ({
    id: createHeadingId(item.text, index + 1),
    level: item.level,
    text: item.text,
  })))
}
</script>

<template>
  <div class="markdown-viewer">
    <MdPreview
      :id="editorId"
      class="markdown-viewer__preview"
      :model-value="resolvedContent"
      theme="light"
      preview-theme="github"
      code-theme="github"
      :show-code-row-number="true"
      :code-foldable="true"
      :no-img-zoom-in="true"
      :md-heading-id="resolveHeadingId"
      @on-get-catalog="handleCatalogChange"
    />
  </div>
</template>

<style scoped>
.markdown-viewer {
  max-width: 100%;
}

.markdown-viewer :deep(.md-editor) {
  background: transparent;
}

.markdown-viewer :deep(.md-editor-preview-wrapper) {
  padding: 0;
}

.markdown-viewer :deep(.md-editor-preview) {
  font-family: var(--font-primary);
  color: var(--text-secondary);
  line-height: 1.9;
  font-size: 0.95rem;
}

.markdown-viewer :deep(.md-editor-preview h1),
.markdown-viewer :deep(.md-editor-preview h2),
.markdown-viewer :deep(.md-editor-preview h3),
.markdown-viewer :deep(.md-editor-preview h4),
.markdown-viewer :deep(.md-editor-preview h5),
.markdown-viewer :deep(.md-editor-preview h6) {
  scroll-margin-top: calc(var(--header-height) + 1.5rem);
}

.markdown-viewer :deep(.md-editor-preview img) {
  border-radius: 18px;
  box-shadow: var(--shadow-soft);
}

.markdown-viewer :deep(.md-editor-preview blockquote) {
  border-left-width: 3px;
  border-radius: 0 16px 16px 0;
}

.markdown-viewer :deep(.md-editor-code) {
  margin: 1.75rem 0;
  border-radius: 20px;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}
</style>
