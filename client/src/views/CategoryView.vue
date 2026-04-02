<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BlogListItem from '@/components/blog/BlogListItem.vue'
import ProfileSidebarCard from '@/components/sidebar/ProfileSidebarCard.vue'
import SiteStatsCard from '@/components/sidebar/SiteStatsCard.vue'
import { categoryOptions, siteConfig } from '@/config/site'
import { usePosts } from '@/composables/usePosts'

const route = useRoute()
const { posts } = usePosts()

const heroStyle = computed(() => ({
  backgroundImage: `linear-gradient(180deg, rgba(16, 20, 31, 0.16), rgba(16, 20, 31, 0.58)), url(${siteConfig.aboutHeroImage})`
}))

const currentCategory = computed(() => {
  const slug = String(route.params.slug ?? '')
  return categoryOptions.find((item) => item.slug === slug) ?? null
})

const filteredPosts = computed(() => {
  if (!currentCategory.value) {
    return []
  }

  return posts.value.filter((post) => post.categorySlug === currentCategory.value?.slug)
})

const siteStats = computed(() => {
  const { onlineUsers, todayViews, totalViews, totalVisitors } = siteConfig.siteStatsSnapshot

  return [
    { label: '在线访客', value: String(onlineUsers) },
    { label: '今日浏览', value: String(todayViews) },
    { label: '总浏览量', value: String(totalViews) },
    { label: '总访客量', value: String(totalVisitors) }
  ]
})
</script>

<template>
  <div class="category-view">
    <section class="category-hero">
      <div class="category-hero__media" :style="heroStyle"></div>
      <div class="category-hero__veil"></div>
      <div class="category-hero__mist"></div>

      <div class="category-hero__inner">
        <h1 class="category-hero__title">{{ currentCategory?.label ?? '分类' }}</h1>
        <p class="category-hero__description">{{ currentCategory ? `${currentCategory.label} 下的文章整理` : '未找到对应分类' }}</p>
      </div>
    </section>

    <section class="category-shell page-content-reveal">
      <div class="category-main">
        <div v-if="!currentCategory" class="category-state">分类不存在。</div>
        <div v-else-if="!filteredPosts.length" class="category-state">这个分类下暂时还没有文章。</div>

        <BlogListItem v-for="post in filteredPosts" v-else :key="post.slug" :post="post" />
      </div>

      <aside class="category-side">
        <ProfileSidebarCard
          :posts="posts"
          :image-style="heroStyle"
          :owner-name="siteConfig.ownerName"
          :owner-role="siteConfig.ownerRole"
          :owner-location="siteConfig.ownerLocation"
        />

        <SiteStatsCard :items="siteStats" />
      </aside>
    </section>
  </div>
</template>

<style scoped>
.category-view {
  background: linear-gradient(180deg, #eff3f9 0%, #ffffff 34%, #ffffff 100%);
}

.category-hero {
  position: relative;
  min-height: 360px;
  overflow: hidden;
  color: #ffffff;
}

.category-hero__media,
.category-hero__veil,
.category-hero__mist {
  position: absolute;
  inset: 0;
}

.category-hero__media {
  background:
    linear-gradient(135deg, rgba(57, 64, 100, 0.88), rgba(27, 43, 89, 0.48)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 32%);
  background-size: cover;
  background-position: center;
  transform: scale(1.02);
}

.category-hero__veil {
  background: linear-gradient(180deg, rgba(11, 18, 28, 0.16), rgba(11, 18, 28, 0.38));
}

.category-hero__mist {
  top: auto;
  height: 120px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.74) 60%, #ffffff 100%);
}

.category-hero__inner {
  position: relative;
  z-index: 1;
  width: min(100%, var(--content-width));
  margin: 0 auto;
  padding: calc(var(--header-height) + 2.8rem) 2rem 6.6rem;
  text-align: center;
}

.category-hero__title {
  margin: 0;
  font-size: clamp(2.1rem, 5vw, 2.9rem);
  font-weight: 500;
  letter-spacing: -0.04em;
}

.category-hero__description {
  margin: 0.9rem 0 0;
  font-size: 0.94rem;
  color: rgba(255, 255, 255, 0.9);
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
  .category-hero {
    min-height: 320px;
  }

  .category-hero__inner {
    padding: calc(var(--header-height) + 2.2rem) 1.25rem 5.8rem;
  }

  .category-shell {
    padding: 0 1.25rem 4rem;
  }
}
</style>
