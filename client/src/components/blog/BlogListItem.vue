<script setup lang="ts">
import PostCard from '@/components/blog/PostCard.vue'
import type { BlogListItemProps } from '@/types/article'

// 列表项本身不做额外逻辑，只把文章数据转交给统一卡片组件。
defineProps<BlogListItemProps>()
</script>

<template>
  <PostCard :article="article" />
</template>
