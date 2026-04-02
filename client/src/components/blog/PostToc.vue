<script setup lang="ts">
import type { MarkdownHeading } from '@/types'

interface Props {
  items: MarkdownHeading[]
  activeId?: string
}

withDefaults(defineProps<Props>(), {
  activeId: ''
})

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)

  if (!element) {
    return
  }

  const offset = 110
  const top = window.scrollY + element.getBoundingClientRect().top - offset

  window.scrollTo({
    top,
    behavior: 'smooth'
  })
}
</script>

<template>
  <aside v-if="items.length" class="post-toc">
    <div class="post-toc__card">
      <span class="post-toc__eyebrow">目录</span>

      <a
        v-for="item in items"
        :key="item.id"
        :href="`#${item.id}`"
        class="post-toc__link"
        :class="[`post-toc__link--level-${item.level}`, { active: item.id === activeId }]"
        @click.prevent="scrollToHeading(item.id)"
      >
        {{ item.text }}
      </a>
    </div>
  </aside>
</template>

<style scoped>
.post-toc {
  position: sticky;
  top: calc(var(--header-height) + 1.5rem);
}

.post-toc__card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1.3rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.post-toc__eyebrow {
  margin-bottom: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.post-toc__link {
  position: relative;
  padding: 0.45rem 0.75rem 0.45rem 1rem;
  border-radius: 8px;
  color: #687387;
  text-decoration: none;
  line-height: 1.7;
  transition: color 0.25s ease, background 0.25s ease;
}

.post-toc__link::before {
  content: '';
  position: absolute;
  top: 0.48rem;
  bottom: 0.48rem;
  left: 0;
  width: 3px;
  border-radius: 999px;
  background: transparent;
  transition: background 0.25s ease;
}

.post-toc__link--level-1 {
  font-weight: 500;
  color: var(--text-primary);
}

.post-toc__link--level-2 {
  padding-left: 1.2rem;
  font-size: 0.9rem;
}

.post-toc__link--level-3 {
  padding-left: 1.65rem;
  font-size: 0.84rem;
}

.post-toc__link:hover,
.post-toc__link.active {
  color: var(--text-primary);
  background: #f4f7fb;
}

.post-toc__link:hover::before,
.post-toc__link.active::before {
  background: var(--accent-cyan);
}
</style>
