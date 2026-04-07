<script setup lang="ts">
import PostCard from '@/components/blog/PostCard.vue'
import type { BlogListItemProps } from '@/types/article'

defineProps<BlogListItemProps>()
</script>

<template>
  <PostCard :article="article" />
</template>
