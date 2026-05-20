<script setup lang="ts" generic="T">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

type Key = string | number

const props = defineProps<{
  items: T[]
  getItemKey: (item: T, index: number) => Key
  estimatedHeight?: number
  overscan?: number
  height?: string
}>()

const resolvedEstimatedHeight = computed(() => props.estimatedHeight ?? 360)
const resolvedOverscan = computed(() => props.overscan ?? 4)
const resolvedHeight = computed(() => props.height ?? '70vh')

const containerRef = ref<HTMLDivElement | null>(null)
const scrollTop = ref(0)
const viewportHeight = ref(0)
const sizeVersion = ref(0)

const sizeMap = shallowRef(new Map<Key, number>())
const observers = new Map<Key, ResizeObserver>()
const elementMap = new Map<Key, HTMLElement>()
const refCallbackMap = new Map<Key, (value: unknown) => void>()
//初始化的key列表
const keys = computed(() => props.items.map((item, index) => props.getItemKey(item, index)))
//通过key获取item的索引
const keyIndexMap = computed(() => {
  const map = new Map<Key, number>()
  keys.value.forEach((key, index) => map.set(key, index))
  return map
})
//通过key获取item的高度
function getItemHeightByKey(key: Key) {
  return sizeMap.value.get(key) ?? resolvedEstimatedHeight.value
}
//计算所有item的布局信息,包括item的高度和top位置
const metrics = computed(() => {
  sizeVersion.value
  let top = 0
  const rows = keys.value.map((key) => {
    const height = getItemHeightByKey(key)
    //提前返回row,避免height变化导致的循环依赖
    const row = { key, top, height }
    top += height
    return row
  })

  return {
    rows,
    totalHeight: top,
  }
})

const totalHeight = computed(() => metrics.value.totalHeight)

function findIndexByOffset(offset: number) {
  const rows = metrics.value.rows
  if (!rows.length) return 0

  let low = 0
  let high = rows.length - 1
  let answer = rows.length - 1

  while (low <= high) {
    const middle = Math.floor((low + high) / 2)
    const row = rows[middle]

    if (row.top + row.height > offset) {
      answer = middle
      high = middle - 1
    } else {
      low = middle + 1
    }
  }

  return answer
}

const startIndex = computed(() => {
  if (!props.items.length) return 0
  return Math.max(0, findIndexByOffset(scrollTop.value) - resolvedOverscan.value)
})

const endIndex = computed(() => {
  if (!props.items.length) return 0
  const visibleBottom = scrollTop.value + viewportHeight.value
  return Math.min(
    props.items.length,
    findIndexByOffset(visibleBottom) + 1 + resolvedOverscan.value,
  )
})

const visibleItems = computed(() => {
  const rows = metrics.value.rows
  //slice相当于for循环，返回可见的项[3,8)因为上面+1 所以返回[3,7] 注意上面+1为了迎合这里
  return props.items.slice(startIndex.value, endIndex.value).map((item, offsetIndex) => {
    const index = startIndex.value + offsetIndex
    const row = rows[index]

    return {
      item,
      index,
      key: row.key,
      top: row.top,
    }
  })
})

function updateViewportHeight() {
  viewportHeight.value = containerRef.value?.clientHeight ?? 0
}

function handleScroll() {
  scrollTop.value = containerRef.value?.scrollTop ?? 0
}

function applyHeight(key: Key, nextHeight: number) {
  const normalizedHeight = Math.ceil(nextHeight)
  if (!normalizedHeight) return

  const previousHeight = sizeMap.value.get(key) ?? resolvedEstimatedHeight.value
  if (previousHeight === normalizedHeight) return

  const rowIndex = keyIndexMap.value.get(key)
  const rowTop = rowIndex == null ? 0 : (metrics.value.rows[rowIndex]?.top ?? 0)
  const delta = normalizedHeight - previousHeight

  const nextSizeMap = new Map(sizeMap.value)
  nextSizeMap.set(key, normalizedHeight)
  sizeMap.value = nextSizeMap
  sizeVersion.value += 1

  if (delta !== 0 && containerRef.value && rowTop < scrollTop.value) {
    containerRef.value.scrollTop += delta
    scrollTop.value = containerRef.value.scrollTop
  }
}

function detachRow(key: Key) {
  const observer = observers.get(key)
  if (observer) {
    observer.disconnect()
    observers.delete(key)
  }

  elementMap.delete(key)
}
//key是item的唯一标识，value是item的dom元素
function attachRowElement(key: Key, value: unknown) {
  const currentElement = elementMap.get(key)
  if (value === currentElement) return

  detachRow(key)

  if (!(value instanceof HTMLElement)) return

  elementMap.set(key, value)

  const observer = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return
    applyHeight(key, entry.contentRect.height)
  })

  observer.observe(value)
  observers.set(key, observer)
}

function getRowRef(key: Key) {
  let callback = refCallbackMap.get(key)

  if (!callback) {
    callback = (value: unknown) => {
      attachRowElement(key, value)
    }
    refCallbackMap.set(key, callback)
  }

  return callback
}

watch(
  keys,
  async (newKeys) => {
    const aliveKeys = new Set(newKeys)

    const newSizeMap = new Map<Key, number>()
    for (const key of newKeys) {
      const cachedHeight = sizeMap.value.get(key)
      if (cachedHeight != null) {
        newSizeMap.set(key, cachedHeight)
      }
    }

    if (newSizeMap.size !== sizeMap.value.size) {
      sizeMap.value = newSizeMap
      sizeVersion.value += 1
    }

    for (const key of Array.from(observers.keys())) {
      if (!aliveKeys.has(key)) {
        detachRow(key)
      }
    }

    for (const key of Array.from(refCallbackMap.keys())) {
      if (!aliveKeys.has(key)) {
        refCallbackMap.delete(key)
      }
    }
  },
  { immediate: true },
)

onMounted(() => {
  updateViewportHeight()
  handleScroll()
  window.addEventListener('resize', updateViewportHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportHeight)

  for (const key of Array.from(observers.keys())) {
    detachRow(key)
  }

  refCallbackMap.clear()
})
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-list"
    :style="{ height: resolvedHeight }"
    @scroll="handleScroll"
  >
    <div class="virtual-list__spacer" :style="{ height: `${totalHeight}px` }">
      <div
        v-for="row in visibleItems"
        :key="row.key"
        class="virtual-list__item"
        :style="{ transform: `translateY(${row.top}px)` }"
        :ref="getRowRef(row.key)"
      >
        <slot :item="row.item" :index="row.index" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-list {
  width: 100%;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.virtual-list__spacer {
  position: relative;
  width: 100%;
}

.virtual-list__item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  will-change: transform;
}
</style>