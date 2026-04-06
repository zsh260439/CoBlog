<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BlogListItem from '@/components/blog/BlogListItem.vue'
import ProfileSidebarCard from '@/components/sidebar/ProfileSidebarCard.vue'
import SiteStatsCard from '@/components/sidebar/SiteStatsCard.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { useCategory } from '@/composables/useCategory'
import { useArticles } from '@/composables/useArticles'
import { siteConfig } from '@/config/site'

const route = useRoute()
const currentSlug = computed(() => String(route.params.slug ?? ''))

const { currentCategory, articles, isLoading, error } = useCategory(currentSlug)
// 全站文章数量
const { articles: allArticles } = useArticles()
</script>

<template>
  <div class="category-view">
    <PageHero
      :title="currentCategory?.label ?? '分类'"
      :description="currentCategory ? `${currentCategory.label} 下的文章整理` : '未找到对应分类'"
      :image="siteConfig.aboutHeroImage"
      height="medium"
      :mist-height="120"
    />

    <section class="category-shell page-content-reveal">
      <div class="category-main">
        <div v-if="!currentCategory" class="category-state">分类不存在。</div>
        <div v-else-if="isLoading" class="category-state">正在加载分类文章...</div>
        <div v-else-if="error" class="category-state">{{ error }}</div>
        <div v-else-if="!articles.length" class="category-state">这个分类下暂时还没有文章。</div>

        <BlogListItem
          v-for="article in articles"
          v-else
          :key="article.slug"
          :article="article"
        />
      </div>

      <aside class="category-side">
        <ProfileSidebarCard
          :articles="allArticles"
          :image-url="siteConfig.aboutHeroImage"
          :owner-name="siteConfig.ownerName"
          :owner-role="siteConfig.ownerRole"
          :owner-location="siteConfig.ownerLocation"
        />

        <SiteStatsCard />
      </aside>
    </section>
  </div>
</template>
