<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownViewer from '@/components/MarkdownViewer.vue'
import { api } from '@/utils'
import { formatDate } from '@/utils/formatDate'
import type { Article } from '@/types'

const route = useRoute()
const router = useRouter()

const post = ref<Article | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const formattedDate = computed(() => {
  if (!post.value) return ''
  return formatDate(post.value.createdAt, 'long')
})

const estimatedReadTime = computed(() => {
  if (!post.value?.content) return '1 分钟阅读'
  const words = post.value.content.split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} 分钟阅读`
})

onMounted(async () => {
  const postId = route.params.id as string

  try {
    const response = await api.getPost(postId)
    if (response.success && response.data) {
      post.value = response.data
    } else {
      error.value = response.message || '文章未找到'
    }
  } catch {
    error.value = '加载文章失败'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="post-view min-h-screen bg-[var(--bg-primary)]">
    <!-- Loading State -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="font-mono text-xs tracking-widest text-[var(--accent-cyan)] animate-pulse">加载文章中...</div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="min-h-screen flex items-center justify-center">
      <div class="text-center max-w-md mx-auto px-6">
        <div class="text-6xl font-black text-[var(--text-muted)] mb-4 font-mono">404</div>
        <h1 class="text-2xl font-bold mb-2 font-mono text-[var(--text-primary)]">文章未找到</h1>
        <p class="text-[var(--text-secondary)] font-mono text-sm mb-8">{{ error }}</p>
        <button
          class="px-6 py-3 border border-[var(--accent-cyan)] text-[var(--accent-cyan)] font-mono text-xs tracking-widest hover:bg-[var(--accent-cyan)] hover:text-[var(--bg-primary)] transition-all"
          @click="router.push('/')"
        >
          返回首页
        </button>
      </div>
    </div>

    <!-- Post Content -->
    <template v-else-if="post">
      <!-- Header -->
      <header class="py-20 border-b border-[var(--border-light)] bg-[var(--bg-secondary)]">
        <div class="max-w-4xl mx-auto px-6">
          <div class="mb-4 font-mono text-xs tracking-widest text-[var(--text-muted)]">
            <span class="text-[var(--accent-cyan)]">//</span> 文章 #{{ post._id.slice(-4).toUpperCase() }}
          </div>
          <h1 class="text-4xl md:text-5xl font-black mb-4 tracking-tight font-mono text-[var(--text-primary)] leading-tight">
            {{ post.title }}
          </h1>
          <div class="flex items-center gap-4 text-[var(--text-muted)] font-mono text-sm">
            <span>{{ formattedDate }}</span>
            <span class="w-1 h-1 bg-[var(--accent-cyan)] rounded-full"></span>
            <span>{{ estimatedReadTime }}</span>
          </div>

          <!-- Tags -->
          <div v-if="post.tags?.length" class="mt-6 flex gap-2 flex-wrap">
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="px-3 py-1 text-[10px] font-mono tracking-widest border border-[var(--border-medium)] text-[var(--text-secondary)]"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </header>

      <!-- Cover Image -->
      <div v-if="post.coverImage" class="max-w-4xl mx-auto px-6 -mt-6">
        <img
          :src="post.coverImage"
          :alt="post.title"
          class="w-full h-64 md:h-80 object-cover border border-[var(--border-light)]"
        />
      </div>

      <!-- Content -->
      <main class="max-w-4xl mx-auto px-6 py-20">
        <MarkdownViewer :content="post.content" />
      </main>

      <!-- Post Navigation -->
      <section class="py-16 border-t border-[var(--border-light)] bg-[var(--bg-secondary)]">
        <div class="max-w-4xl mx-auto px-6">
          <h3 class="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-6">继续阅读</h3>
          <div
            class="flex items-center gap-4 cursor-pointer group"
            @click="router.push('/')"
          >
            <span class="text-xl md:text-2xl font-bold font-mono text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
              ← 返回文章列表
            </span>
            <div class="flex-grow border-b border-dashed border-[var(--border-medium)] group-hover:border-[var(--accent-cyan)] transition-colors"></div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
