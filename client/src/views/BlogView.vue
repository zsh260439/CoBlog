<script setup lang="ts">
import { computed } from 'vue'
import BlogListItem from '@/components/blog/BlogListItem.vue'
import ProfileSidebarCard from '@/components/sidebar/ProfileSidebarCard.vue'
import SiteStatsCard from '@/components/sidebar/SiteStatsCard.vue'
import { siteConfig } from '@/config/site'
import { usePosts } from '@/composables/usePosts'
import { summarizeCategories } from '@/utils'

const { posts, isLoading, error } = usePosts()

const heroStyle = computed(() => ({
  backgroundImage: `linear-gradient(180deg, rgba(16, 20, 31, 0.16), rgba(16, 20, 31, 0.58)), url(${siteConfig.aboutHeroImage})`
}))

const blogStats = computed(() => {
  const { onlineUsers, todayViews, totalViews, totalVisitors } = siteConfig.siteStatsSnapshot

  return [
    { label: '在线访客', value: String(onlineUsers) },
    { label: '今日浏览', value: String(todayViews) },
    { label: '总浏览量', value: String(totalViews) },
    { label: '总访客量', value: String(totalVisitors) }
  ]
})

const categoryCount = computed(() => summarizeCategories(posts.value).length)
</script>

<template>
  <div class="blog-view">
    <section class="blog-hero">
      <div class="blog-hero__media" :style="heroStyle"></div>
      <div class="blog-hero__veil"></div>
      <div class="blog-hero__mist"></div>

      <div class="blog-hero__inner">
        <h1 class="blog-hero__title">{{ siteConfig.ownerName }}</h1>
        <p class="blog-hero__description">随便坐坐，看看我写的字 —— 一些技术、心得、生活日常和胡思乱想。</p>
        <div class="blog-hero__meta">
          <span>{{ posts.length }} 篇文章</span>
          <span>{{ categoryCount }} 个分类</span>
        </div>
      </div>
    </section>

    <section class="blog-shell page-content-reveal">
      <div class="blog-main">
        <div v-if="isLoading" class="blog-state">正在整理文章列表...</div>
        <div v-else-if="error" class="blog-state blog-state--error">{{ error }}</div>
        <div v-else-if="!posts.length" class="blog-state">还没有文章，后续内容会先落在这里。</div>

        <BlogListItem v-for="post in posts" v-else :key="post.slug" :post="post" />
      </div>

      <aside class="blog-side">
        <ProfileSidebarCard
          :posts="posts"
          :image-style="heroStyle"
          :owner-name="siteConfig.ownerName"
          :owner-role="siteConfig.ownerRole"
          :owner-location="siteConfig.ownerLocation"
        />

        <SiteStatsCard :items="blogStats" />
      </aside>
    </section>
  </div>
</template>

<style scoped>
.blog-view {
  background: linear-gradient(180deg, #eff3f9 0%, #ffffff 34%, #ffffff 100%);
}

.blog-hero {
  position: relative;
  min-height: 360px;
  overflow: hidden;
  color: #ffffff;
}

.blog-hero__media,
.blog-hero__veil,
.blog-hero__mist {
  position: absolute;
  inset: 0;
}

.blog-hero__media {
  background:
    linear-gradient(135deg, rgba(57, 64, 100, 0.88), rgba(27, 43, 89, 0.48)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 32%);
  background-size: cover;
  background-position: center;
  transform: scale(1.02);
}

.blog-hero__veil {
  background: linear-gradient(180deg, rgba(11, 18, 28, 0.16), rgba(11, 18, 28, 0.38));
}

.blog-hero__mist {
  top: auto;
  height: 120px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.74) 60%, #ffffff 100%);
}

.blog-hero__inner {
  position: relative;
  z-index: 1;
  width: min(100%, var(--content-width));
  margin: 0 auto;
  padding: calc(var(--header-height) + 2.8rem) 2rem 6.6rem;
  text-align: center;
}

.blog-hero__title {
  margin: 0;
  font-size: clamp(2.2rem, 5.2vw, 3.1rem);
  font-weight: 500;
  letter-spacing: -0.04em;
}

.blog-hero__description {
  margin: 0.95rem auto 0;
  max-width: 42rem;
  font-size: 0.94rem;
  color: rgba(255, 255, 255, 0.9);
}

.blog-hero__meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-top: 1rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.86);
}

.blog-shell {
  position: relative;
  z-index: 2;
  width: min(100%, 1120px);
  margin: -14px auto 0;
  padding: 0 2rem 5rem;
  display: grid;
  grid-template-columns: minmax(0, 1.58fr) 260px;
  gap: 1.5rem;
}

.blog-main,
.blog-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.blog-state {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  padding: 1.15rem;
}

.blog-state--error {
  color: #a54444;
}

@media (max-width: 1024px) {
  .blog-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .blog-hero {
    min-height: 320px;
  }

  .blog-hero__inner {
    padding: calc(var(--header-height) + 2.2rem) 1.25rem 5.8rem;
  }

  .blog-shell {
    padding: 0 1.25rem 4rem;
  }
}
</style>
