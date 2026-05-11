<script setup lang="ts">
import { computed } from 'vue'
import { MdPreview } from 'md-editor-v3'
import type { HeadList } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { ensureMarkdownConfigured } from '@/config/markdown'
import type { MarkdownHeading } from '@/types/content'
import type { MarkdownViewerProps } from '@/types/ui'
import { createMarkdownHeadingId, resolveMarkdownHeadingId } from '@/utils/markdown'

ensureMarkdownConfigured()

const props = withDefaults(defineProps<MarkdownViewerProps>(), {
  editorId: 'article-preview'
})

const emit = defineEmits<{
  catalogChange: [items: MarkdownHeading[]]
}>()

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const resolvedContent = computed(() => {
  const normalizedTitle = props.articleTitle?.trim()
  let content = props.content

  if (normalizedTitle) {
    const titlePattern = escapeRegExp(normalizedTitle)
    content = content
      .replace(new RegExp(`^#\\s+${titlePattern}\\s*\\n+`, 'i'), '')
      .replace(new RegExp(`^<h1[^>]*>${titlePattern}<\\/h1>\\s*`, 'i'), '')
  }

  return content
})

const handleCatalogChange = (items: HeadList[]) => {
  emit('catalogChange', items.map((item, index) => ({
    id: createMarkdownHeadingId(item.text, index + 1),
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
      :md-heading-id="resolveMarkdownHeadingId"
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
