<script setup lang="ts">
import { computed } from 'vue'
import 'highlight.js/styles/github.css'
import { renderMarkdown } from '@/utils'

interface Props {
  content: string
}

const props = defineProps<Props>()

const renderedContent = computed(() => {
  return renderMarkdown(props.content)
})
</script>

<template>
  <div class="markdown-viewer" v-html="renderedContent"></div>
</template>

<style scoped>
.markdown-viewer {
  font-family: var(--font-primary);
  color: var(--text-secondary);
  line-height: 1.9;
  max-width: 100%;
  font-size: 0.95rem;
}

.markdown-viewer :deep(h1),
.markdown-viewer :deep(h2),
.markdown-viewer :deep(h3),
.markdown-viewer :deep(h4),
.markdown-viewer :deep(h5),
.markdown-viewer :deep(h6) {
  scroll-margin-top: calc(var(--header-height) + 1.5rem);
  font-family: var(--font-primary);
  font-weight: 500;
  color: var(--text-primary);
  margin-top: 2.5rem;
  margin-bottom: 0.9rem;
  letter-spacing: -0.02em;
}

.markdown-viewer :deep(h1) {
  font-size: 1.8rem;
}

.markdown-viewer :deep(h2) {
  font-size: 1.38rem;
}

.markdown-viewer :deep(h3) {
  font-size: 1.08rem;
}

.markdown-viewer :deep(p) {
  margin: 0 0 1.3rem;
  color: var(--text-secondary);
}

.markdown-viewer :deep(a) {
  color: var(--accent-cyan);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.markdown-viewer :deep(a:hover) {
  border-bottom-color: var(--accent-cyan);
}

.markdown-viewer :deep(pre) {
  background: #f4f7fb !important;
  color: var(--text-primary) !important;
  padding: 1.25rem !important;
  border-radius: 18px !important;
  border: 1px solid var(--border-light);
  margin: 1.5rem 0 !important;
  overflow-x: auto;
}

.markdown-viewer :deep(code) {
  font-family: var(--font-primary);
  font-size: 0.875em;
}

.markdown-viewer :deep(code:not(pre code)) {
  padding: 0.15rem 0.4rem;
  background: var(--bg-elevated);
  color: var(--accent-teal);
  border-radius: 3px;
  font-size: 0.85em;
}

.markdown-viewer :deep(img) {
  max-width: 100%;
  height: auto;
  border: 1px solid var(--border-light);
  border-radius: 18px;
  margin: 2rem 0;
  display: block;
  box-shadow: var(--shadow-soft);
}

.markdown-viewer :deep(blockquote) {
  margin: 1.75rem 0;
  padding: 1rem 1.25rem;
  border-left: 3px solid var(--accent-cyan);
  border-radius: 0 16px 16px 0;
  background: rgba(0, 119, 204, 0.05);
  color: var(--text-secondary);
}

.markdown-viewer :deep(ul),
.markdown-viewer :deep(ol) {
  margin: 1.25rem 0;
  padding-left: 1.5rem;
  color: var(--text-secondary);
}

.markdown-viewer :deep(li) {
  margin-bottom: 0.375rem;
}

.markdown-viewer :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 2rem 0;
}

.markdown-viewer :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.9em;
  overflow: hidden;
  border-radius: 14px;
}

.markdown-viewer :deep(th),
.markdown-viewer :deep(td) {
  border: 1px solid var(--border-light);
  padding: 0.625rem 0.875rem;
  text-align: left;
}

.markdown-viewer :deep(th) {
  background: var(--bg-elevated);
  font-weight: 500;
  color: var(--accent-cyan);
}

.markdown-viewer :deep(strong) {
  font-weight: 500;
  color: var(--text-primary);
}
</style>
