<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Document } from '@element-plus/icons-vue'
import type { ArticleTocProps } from '@/types/article'
import type { MarkdownHeading } from '@/types/content'

interface TocNode extends MarkdownHeading {
  children: TocNode[]
}

const props = withDefaults(defineProps<ArticleTocProps>(), {
  activeId: '',
})

const listRef = ref<HTMLElement | null>(null)
const isSelectingHeading = ref(false)
const expandedIds = ref(new Set<string>())
const isMobileViewport = ref(false)
const prefersReducedMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const buildHeadingTree = (items: MarkdownHeading[]) => {
  const roots: TocNode[] = []
  const stack: TocNode[] = []

  items.forEach((item) => {
    const node: TocNode = {
      ...item,
      children: [],
    }

    while (stack.length && stack[stack.length - 1].level >= item.level) {
      stack.pop()
    }

    const parent = stack[stack.length - 1]
    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }

    stack.push(node)
  })

  return roots
}

const tree = computed(() => buildHeadingTree(props.items))

const updateViewportMode = () => {
  isMobileViewport.value = window.matchMedia('(max-width: 767px)').matches
}

onMounted(() => {
  updateViewportMode()
  window.addEventListener('resize', updateViewportMode)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportMode)
})

const activePath = computed(() => {
  const path: string[] = []

  const walk = (nodes: TocNode[], trail: string[]) => {
    for (const node of nodes) {
      const nextTrail = [...trail, node.id]
      if (node.id === props.activeId) {
        path.push(...nextTrail)
        return true
      }

      if (walk(node.children, nextTrail)) {
        return true
      }
    }

    return false
  }

  if (props.activeId) {
    walk(tree.value, [])
  }

  return path
})

const activeRootId = computed(() => {
  if (activePath.value.length) {
    return activePath.value[0]
  }

  return ''
})

const isInActivePath = (id: string) => activePath.value.includes(id)
// 移动端不依赖 activePath 自动展开，避免滚动和目录布局互相触发。
const isExpanded = (id: string) => expandedIds.value.has(id) || (!isMobileViewport.value && isInActivePath(id))

watch(activePath, (path) => {
  if (isMobileViewport.value) {
    return
  }

  // 只保留当前标题路径，切换章节时收起之前打开的分支。
  expandedIds.value = new Set(path)
})

const expandPathTo = (id: string) => {
  const next = new Set(isMobileViewport.value ? [] : expandedIds.value)
  const addAncestors = (nodes: TocNode[], parents: string[]): boolean => {
    for (const node of nodes) {
      if (node.id === id) {
        parents.forEach((parentId) => next.add(parentId))
        next.add(node.id)
        return true
      }

      if (addAncestors(node.children, [...parents, node.id])) {
        return true
      }
    }
    return false
  }

  addAncestors(tree.value, [])
  expandedIds.value = next
}

const scrollToHeading = async (id: string) => {
  const element = document.getElementById(id)

  if (!element) {
    return
  }

  expandPathTo(id)
  const offset = 110

  isSelectingHeading.value = true
  window.history.replaceState(null, '', `#${id}`)

  // 先让目录展开完成，再读取标题位置，避免展开动画改变正文定位结果。
  await nextTick()
  const top = window.scrollY + element.getBoundingClientRect().top - offset
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })

  window.setTimeout(() => {
    isSelectingHeading.value = false
  }, 700)
}

const syncActiveItemIntoView = () => {
  if (isSelectingHeading.value || isMobileViewport.value) {
    return
  }

  const container = listRef.value
  const activeItem = Array.from(
    container?.querySelectorAll<HTMLElement>('.article-toc__item.active') || [],
  ).find((item) => item.dataset.tocId === props.activeId)

  if (!container || !activeItem) {
    return
  }

  const containerRect = container.getBoundingClientRect()
  const itemRect = activeItem.getBoundingClientRect()
  const padding = 8

  if (itemRect.top < containerRect.top + padding) {
    container.scrollBy({ top: itemRect.top - containerRect.top - padding, behavior: 'auto' })
    return
  }

  if (itemRect.bottom > containerRect.bottom - padding) {
    container.scrollBy({ top: itemRect.bottom - containerRect.bottom + padding, behavior: 'auto' })
  }
}

const clearBranchAnimation = (element: Element) => {
  const el = element as HTMLElement
  el.style.height = ''
  el.style.opacity = ''
  el.style.transform = ''
  el.style.overflow = ''
  el.style.transition = ''
  el.style.willChange = ''
}

const applyBranchTransition = (element: HTMLElement) => {
  element.style.transition = [
    'height 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
    'opacity 0.22s ease',
    'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
  ].join(', ')
  element.style.overflow = 'hidden'
  element.style.willChange = 'height, opacity, transform'
}

const handleBranchBeforeEnter = (element: Element) => {
  const el = element as HTMLElement
  if (prefersReducedMotion) {
    clearBranchAnimation(el)
    return
  }

  el.style.height = '0'
  el.style.opacity = '0'
  el.style.transform = 'translateY(-6px)'
  el.style.overflow = 'hidden'
}

const handleBranchEnter = (element: Element) => {
  const el = element as HTMLElement
  if (prefersReducedMotion) {
    clearBranchAnimation(el)
    syncActiveItemIntoView()
    return
  }

  applyBranchTransition(el)
  void el.offsetHeight
  el.style.height = `${el.scrollHeight}px`
  el.style.opacity = '1'
  el.style.transform = 'translateY(0)'
}

const handleBranchAfterEnter = (element: Element) => {
  clearBranchAnimation(element)
  syncActiveItemIntoView()
}

const handleBranchBeforeLeave = (element: Element) => {
  const el = element as HTMLElement
  if (prefersReducedMotion) {
    clearBranchAnimation(el)
    return
  }

  el.style.height = `${el.scrollHeight}px`
  el.style.opacity = '1'
  el.style.transform = 'translateY(0)'
  el.style.overflow = 'hidden'
}

const handleBranchLeave = (element: Element) => {
  const el = element as HTMLElement
  if (prefersReducedMotion) {
    clearBranchAnimation(el)
    return
  }

  applyBranchTransition(el)
  void el.offsetHeight
  el.style.height = '0'
  el.style.opacity = '0'
  el.style.transform = 'translateY(-6px)'
}

const handleBranchAfterLeave = (element: Element) => {
  clearBranchAnimation(element)
}

const handleBeforeEnter = (element: Element) => {
  if (!isMobileViewport.value) {
    handleBranchBeforeEnter(element)
  }
}

const handleEnter = (element: Element) => {
  if (!isMobileViewport.value) {
    handleBranchEnter(element)
  }
}

const handleAfterEnter = (element: Element) => {
  if (!isMobileViewport.value) {
    handleBranchAfterEnter(element)
  }
}

const handleBeforeLeave = (element: Element) => {
  if (!isMobileViewport.value) {
    handleBranchBeforeLeave(element)
  }
}

const handleLeave = (element: Element) => {
  if (!isMobileViewport.value) {
    handleBranchLeave(element)
  }
}

const handleAfterLeave = (element: Element) => {
  if (!isMobileViewport.value) {
    handleBranchAfterLeave(element)
  }
}

watch(
  () => [props.activeId, tree.value.length, activeRootId.value],
  async () => {
    await nextTick()
    syncActiveItemIntoView()
  },
  { immediate: true },
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
        <ul class="article-toc__list">
          <li
            v-for="root in tree"
            :key="root.id"
            class="article-toc__group"
            :class="{ 'is-open': root.id === activeRootId }"
          >
            <button
              type="button"
              class="article-toc__item article-toc__item--root"
              :data-toc-id="root.id"
              :class="{
                active: isInActivePath(root.id),
                [`level-${root.level}`]: true,
              }"
              :title="root.text"
                @click.prevent="scrollToHeading(root.id)"
            >
              <span class="article-toc__text">{{ root.text }}</span>
            </button>

            <Transition
              @before-enter="handleBeforeEnter"
              @enter="handleEnter"
              @after-enter="handleAfterEnter"
              @before-leave="handleBeforeLeave"
              @leave="handleLeave"
              @after-leave="handleAfterLeave"
            >
              <ul
                v-if="root.children.length && isExpanded(root.id)"
                class="article-toc__children"
              >
                <li v-for="child in root.children" :key="child.id" class="article-toc__child">
                  <button
                    type="button"
                    class="article-toc__item"
                    :data-toc-id="child.id"
                    :class="{
                      active: isInActivePath(child.id),
                      [`level-${child.level}`]: true,
                    }"
                    :title="child.text"
                    @click.prevent="scrollToHeading(child.id)"
                  >
                    <span class="article-toc__text">{{ child.text }}</span>
                  </button>

                  <Transition
                    @before-enter="handleBeforeEnter"
                    @enter="handleEnter"
                    @after-enter="handleAfterEnter"
                    @before-leave="handleBeforeLeave"
                    @leave="handleLeave"
                    @after-leave="handleAfterLeave"
                  >
                    <ul
                      v-if="child.children.length && isExpanded(child.id)"
                      class="article-toc__children article-toc__children--nested"
                    >
                      <li v-for="grandchild in child.children" :key="grandchild.id" class="article-toc__child">
                        <button
                          type="button"
                          class="article-toc__item"
                          :data-toc-id="grandchild.id"
                          :class="{
                            active: isInActivePath(grandchild.id),
                            [`level-${grandchild.level}`]: true,
                          }"
                          :title="grandchild.text"
                          @click.prevent="scrollToHeading(grandchild.id)"
                        >
                          <span class="article-toc__text">{{ grandchild.text }}</span>
                        </button>
                      </li>
                    </ul>
                  </Transition>
                </li>
              </ul>
            </Transition>
          </li>
        </ul>
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

.article-toc__scroll::-webkit-scrollbar {
  width: 6px;
}

.article-toc__scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(129, 140, 158, 0.32);
}

.article-toc__list,
.article-toc__children {
  list-style: none;
  margin: 0;
  padding: 0;
}

.article-toc__group + .article-toc__group {
  margin-top: 0.3rem;
}

.article-toc__children {
  margin-top: 0.3rem;
  transform-origin: top;
}

.article-toc__children--nested {
  margin-top: 0.18rem;
}

.article-toc__child + .article-toc__child {
  margin-top: 0.14rem;
}

.article-toc__item {
  width: 100%;
  display: flex;
  align-items: flex-start;
  border: 0;
  background: transparent;
  font: inherit;
  text-align: left;
  font-size: 0.83rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.34rem 0.55rem;
  border-radius: 6px;
  border-left: 2px solid transparent;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
  line-height: 1.55;
}

.article-toc__item:hover {
  color: #111827;
  background: #f5f7fa;
}

.article-toc__item.active {
  color: #111827;
  border-left-color: #111827;
  background: #f5f7fa;
}

.article-toc__item--root {
  font-size: 0.96rem;
  font-weight: 600;
  color: #4b5563;
}

.article-toc__text {
  display: block;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-toc__item--root .article-toc__text {
  max-width: 100%;
}

.article-toc__children .article-toc__item {
  font-size: 0.8rem;
}

.article-toc__item.level-3 {
  padding-left: 1.2rem;
}

.article-toc__item.level-4 {
  padding-left: 1.9rem;
}

.article-toc__item.level-5,
.article-toc__item.level-6 {
  padding-left: 2.5rem;
}
</style>
