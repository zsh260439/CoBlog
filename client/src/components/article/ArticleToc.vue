<script setup lang="ts">
import type { ArticleTocProps } from '@/types'

withDefaults(defineProps<ArticleTocProps>(), {
  activeId: ''
})

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)

  if (!element) {
    return
  }

  const offset = 110
  const top = window.scrollY + element.getBoundingClientRect().top - offset

  window.scrollTo({ top, behavior: 'smooth' })
}
</script>

<template>
  <aside v-if="items.length" class="article-toc">
    <div class="article-toc__card">
      <span class="article-toc__eyebrow">目录</span>
      <a
        v-for="item in items"
        :key="item.id"
        :href="`#${item.id}`"
        class="article-toc__link"
        :class="[`article-toc__link--level-${item.level}`, { active: item.id === activeId }]"
        @click.prevent="scrollToHeading(item.id)"
      >
        {{ item.text }}
      </a>
    </div>
  </aside>
</template>

<style scoped>
.article-toc {
  position: sticky;
  top: calc(var(--header-height) + 1.5rem);
}

.article-toc__card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1.3rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.article-toc__eyebrow {
  margin-bottom: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.article-toc__link {
  position: relative;
  padding: 0.45rem 0.75rem 0.45rem 1rem;
  border-radius: 8px;
  color: #687387;
  text-decoration: none;
  line-height: 1.7;
  transition: color 0.25s ease, background 0.25s ease;
}

.article-toc__link::before {
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

.article-toc__link--level-1 {
  font-weight: 500;
  color: var(--text-primary);
}

.article-toc__link--level-2 {
  padding-left: 1.2rem;
  font-size: 0.9rem;
}

.article-toc__link--level-3 {
  padding-left: 1.65rem;
  font-size: 0.84rem;
}

.article-toc__link:hover,
.article-toc__link.active {
  color: var(--text-primary);
  background: #f4f7fb;
}

.article-toc__link:hover::before,
.article-toc__link.active::before {
  background: var(--accent-cyan);
}
</style>
