<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  language: 'javascript',
  filename: '',
  showLineNumbers: true
})

const copied = ref(false)

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <div class="code-block">
    <div class="code-header">
      <div class="code-meta">
        <span v-if="filename" class="code-filename">{{ filename }}</span>
        <span class="code-language">{{ language }}</span>
      </div>
      <button
        class="copy-btn"
        :class="{ copied }"
        @click="copyCode"
        :aria-label="copied ? 'Copied!' : 'Copy code'"
      >
        <span v-if="copied" class="copy-icon">✓</span>
        <span v-else class="copy-icon">⎘</span>
        <span class="copy-text">{{ copied ? 'COPIED' : 'COPY' }}</span>
      </button>
    </div>

    <div class="code-content">
      <pre class="code-pre"><code class="code-code">{{ code }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.code-block {
  background: var(--bg-elevated);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  overflow: hidden;
  font-family: 'JetBrains Mono', monospace;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
}

.code-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.code-filename {
  font-size: 0.75rem;
  color: var(--accent-teal);
  letter-spacing: 0.05em;
}

.code-language {
  font-size: 0.625rem;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  padding: 0.25rem 0.5rem;
  background: var(--bg-elevated);
  border-radius: 3px;
  text-transform: uppercase;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid var(--border-medium);
  color: var(--text-secondary);
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.625rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'JetBrains Mono', monospace;
}

.copy-btn:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

.copy-btn.copied {
  border-color: var(--accent-teal);
  color: var(--accent-teal);
}

.copy-icon {
  font-size: 0.875rem;
}

.copy-text {
  font-weight: 600;
}

.code-content {
  padding: 1rem;
  overflow-x: auto;
}

.code-pre {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-primary);
}

.code-code {
  display: block;
  white-space: pre;
}
</style>
