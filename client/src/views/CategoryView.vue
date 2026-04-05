<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BlogListItem from '@/components/blog/BlogListItem.vue'
import ProfileSidebarCard from '@/components/sidebar/ProfileSidebarCard.vue'
import SiteStatsCard from '@/components/sidebar/SiteStatsCard.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { useCategory } from '@/composables/useCategory'
import { siteConfig } from '@/config/site'
import { usePosts } from '@/composables/usePosts'

const route = useRoute()
const { posts } = usePosts()
const currentSlug = computed(() => String(route.params.slug ?? ''))
const { currentCategory, filteredPosts } = useCategory(posts, currentSlug)
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
        <div v-else-if="!filteredPosts.length" class="category-state">这个分类下暂时还没有文章。</div>

        <BlogListItem v-for="post in filteredPosts" v-else :key="post.slug" :post="post" />
      </div>

      <aside class="category-side">
        <ProfileSidebarCard
          :posts="posts"
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

<style scoped>
.category-view {
  background: linear-gradient(180deg, #eff3f9 0%, #ffffff 34%, #ffffff 100%);
}

.category-shell {
  position: relative;
  z-index: 2;
  width: min(100%, 1120px);
  margin: -14px auto 0;
  padding: 0 2rem 5rem;
  display: grid;
  grid-template-columns: minmax(0, 1.58fr) 260px;
  gap: 1.5rem;
}

.category-main,
.category-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-state {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  padding: 1.15rem;
}

@media (max-width: 1024px) {
  .category-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .category-shell {
    padding: 0 1.25rem 4rem;
  }
}
</style>
