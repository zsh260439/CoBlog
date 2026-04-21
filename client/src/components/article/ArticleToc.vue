<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Document } from '@element-plus/icons-vue'
import type { ArticleTocProps } from '@/types/article'

const props = withDefaults(defineProps<ArticleTocProps>(), {
  activeId: ''
})

const listRef = ref<HTMLElement | null>(null)

// 目录优先把 h2 视为根节点；如果文章没有 h2，就退回到最小标题层级。
const getRootLevel = () => {
  const levels = props.items.map((item) => item.level)

  if (levels.includes(2)) {
    return 2
  }

  return Math.min(...levels)
}

// 给每个目录项补充所属根节点，后面就能做“根标题 + 当前分组子标题”的裁剪展示。
const normalizedItems = computed(() => {
  if (!props.items.length) {
    return []
  }

  const rootLevel = getRootLevel()
  let currentRootId = ''

  return props.items.map((item) => {
    if (item.level === rootLevel) {
      currentRootId = item.id
    }

    return {
      ...item,
      isRoot: item.level === rootLevel,
      rootId: currentRootId || item.id,
    }
  })
})

// 当前激活标题属于哪个根分组，右侧目录就聚焦显示这个分组。
const activeRootId = computed(() => {
  const activeItem = normalizedItems.value.find((item) => item.id === props.activeId)

  if (activeItem) {
    return activeItem.rootId
  }

  return normalizedItems.value.find((item) => item.isRoot)?.id || ''
})

// 目录始终保留所有根标题，同时展示当前根标题下面的子标题。
const visibleItems = computed(() => {
  const rootId = activeRootId.value
  return normalizedItems.value.filter((item) => item.isRoot || item.rootId === rootId)
})

// 点击目录项时滚动到正文标题，并同步更新地址栏 hash。
const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)

  if (!element) {
    return
  }

  const offset = 110
  const top = window.scrollY + element.getBoundingClientRect().top - offset

  window.scrollTo({ top, behavior: 'smooth' })
  window.history.replaceState(null, '', `#${id}`)
}

// 激活项变化后，把右侧目录滚动到可视区域内。
const syncActiveItemIntoView = () => {
  const container = listRef.value
  const activeItem = container?.querySelector<HTMLElement>('.article-toc__item.active')

  if (!container || !activeItem) {
    return
  }

  // 只同步目录容器自身的滚动位置，避免在小屏时把整页强制拉到目录区域。
  const itemTop = activeItem.offsetTop
  const itemBottom = itemTop + activeItem.offsetHeight
  const visibleTop = container.scrollTop
  const visibleBottom = visibleTop + container.clientHeight
  const padding = 8

  if (itemTop < visibleTop + padding) {
    container.scrollTo({ top: Math.max(itemTop - padding, 0), behavior: 'smooth' })
    return
  }

  if (itemBottom > visibleBottom - padding) {
    container.scrollTo({
      top: itemBottom - container.clientHeight + padding,
      behavior: 'smooth'
    })
  }
}

watch(
  () => [props.activeId, visibleItems.value.length],
  async () => {
    // 先等 DOM 根据新的目录项渲染完成，再滚动到高亮项。
    await nextTick()
    syncActiveItemIntoView()
  },
  { immediate: true }
)
</script>

<template>
  <aside v-if="items.length" class="article-toc">
    <el-card class="article-toc__card" shadow="never">
      <div class="article-toc__header">
        <el-icon class="article-toc__icon"><Document /></el-icon>
        <span class="article-toc__eyebrow">目录</span>
      </div>

      <div ref="listRef" class="article-toc__scroll">
        <TransitionGroup name="toc-slide" tag="ul" class="article-toc__list">
          <li
            v-for="item in visibleItems"
            :key="item.id"
            class="article-toc__item"
            :class="{
              active: activeId === item.id,
              root: item.isRoot,
              [`level-${item.level}`]: true,
            }"
            :title="item.text"
            @click="scrollToHeading(item.id)"
          >
            {{ item.text }}
          </li>
        </TransitionGroup>
      </div>
    </el-card>
  </aside>
</template>

<style scoped>
.article-toc {
  position: sticky;
  top: calc(var(--header-height) + 1.5rem);
}

.article-toc__card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.article-toc__card :deep(.el-card__body) {
  padding: 1rem;
}

.article-toc__header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.75rem;
}

.article-toc__icon {
  font-size: 0.92rem;
  color: #111827;
}

.article-toc__eyebrow {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
}

.article-toc__scroll {
  max-height: min(62vh, 520px);
  overflow-y: auto;
  padding-right: 0.25rem;
  scrollbar-gutter: stable;
}

.article-toc__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.article-toc__scroll::-webkit-scrollbar {
  width: 6px;
}

.article-toc__scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(129, 140, 158, 0.32);
}

.article-toc__item {
  font-size: 0.83rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.32rem 0.55rem;
  border-radius: 6px;
  border-left: 2px solid transparent;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease,
    transform 0.2s ease;
  line-height: 1.55;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-toc__item:hover {
  color: #111827;
  background: #f5f7fa;
}

.article-toc__item.active {
  color: #111827;
  font-weight: 500;
  border-left-color: #111827;
  background: #f5f7fa;
}

.article-toc__item.root {
  font-size: 0.96rem;
  font-weight: 600;
  color: #4b5563;
}

.article-toc__item.level-2 {
  padding-left: 0.5rem;
}

.article-toc__item.level-3 {
  padding-left: 1.25rem;
  font-size: 0.8rem;
}

.article-toc__item.level-4 {
  padding-left: 2rem;
  font-size: 0.8rem;
}

.toc-slide-enter-active,
.toc-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease, max-height 0.22s ease,
    margin 0.22s ease, padding 0.22s ease;
}

.toc-slide-enter-from,
.toc-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
  margin-top: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.toc-slide-enter-to,
.toc-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 36px;
}

.toc-slide-move {
  transition: transform 0.2s ease;
}
</style>
