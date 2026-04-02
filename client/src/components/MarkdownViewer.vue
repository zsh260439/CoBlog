<script setup lang="ts">
import { computed } from 'vue'
import markdownIt from 'markdown-it'
import highlightjs from 'markdown-it-highlightjs'
import 'highlight.js/styles/github-dark.css'

interface Props {
  content: string
}

const props = defineProps<Props>()

const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true,
}).use(highlightjs)

const renderedContent = computed(() => {
  return md.render(props.content)
})
</script>

<template>
  <div class="markdown-viewer" v-html="renderedContent"></div>
</template>

<style scoped>
.markdown-viewer {
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-secondary);
  line-height: 1.8;
  max-width: 100%;
  font-size: 0.9rem;
}

.markdown-viewer :deep(h1),
.markdown-viewer :deep(h2),
.markdown-viewer :deep(h3),
.markdown-viewer :deep(h4),
.markdown-viewer :deep(h5),
.markdown-viewer :deep(h6) {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  border-left: 3px solid var(--accent-cyan);
  padding-left: 0.75rem;
}

.markdown-viewer :deep(h1) {
  font-size: 1.75rem;
  border-left-width: 4px;
}

.markdown-viewer :deep(h2) {
  font-size: 1.375rem;
}

.markdown-viewer :deep(h3) {
  font-size: 1.125rem;
}

.markdown-viewer :deep(p) {
  margin-bottom: 1.25rem;
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
  background: var(--bg-elevated) !important;
  color: var(--text-primary) !important;
  padding: 1.25rem !important;
  border-radius: 6px !important;
  border: 1px solid var(--border-light);
  margin: 1.5rem 0 !important;
  overflow-x: auto;
}

.markdown-viewer :deep(code) {
  font-family: 'JetBrains Mono', monospace;
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
  border-radius: 4px;
  margin: 1.5rem 0;
  display: block;
}

.markdown-viewer :deep(blockquote) {
  border-left: 3px solid var(--accent-purple);
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: var(--text-muted);
  font-style: italic;
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
}

.markdown-viewer :deep(th),
.markdown-viewer :deep(td) {
  border: 1px solid var(--border-light);
  padding: 0.625rem 0.875rem;
  text-align: left;
}

.markdown-viewer :deep(th) {
  background: var(--bg-elevated);
  font-weight: 600;
  color: var(--accent-cyan);
}

.markdown-viewer :deep(strong) {
  font-weight: 600;
  color: var(--text-primary);
}
</style>
