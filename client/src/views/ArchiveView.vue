<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import ProfileSidebarCard from '@/components/sidebar/ProfileSidebarCard.vue'
import SiteStatsCard from '@/components/sidebar/SiteStatsCard.vue'
import { archiveHeroImage } from '@/mocks/articles'
import { siteConfig } from '@/config/site'
import { usePosts } from '@/composables/usePosts'

const { posts, isLoading, error } = usePosts()

const heroStyle = computed(() => ({
  backgroundImage: `linear-gradient(180deg, rgba(16, 20, 31, 0.18), rgba(16, 20, 31, 0.58)), url(${archiveHeroImage || siteConfig.aboutHeroImage})`
}))

const archiveGroups = computed(() => {
  const groups = new Map<string, typeof posts.value>()

  posts.value.forEach((post) => {
    const year = new Date(post.createdAt).getFullYear().toString()
    const currentGroup = groups.get(year) ?? []
    currentGroup.push(post)
    groups.set(year, currentGroup)
  })

  return [...groups.entries()].map(([year, items]) => ({
    year,
    posts: items.sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
  }))
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

const formatArchiveDate = (date: string) => {
  const parsed = new Date(date)
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0')
  const day = `${parsed.getDate()}`.padStart(2, '0')

  return `${month}-${day}`
}
</script>

<template>
  <div class="archive-view">
    <section class="archive-hero">
      <div class="archive-hero__media" :style="heroStyle"></div>
      <div class="archive-hero__overlay"></div>
      <div class="archive-hero__mist"></div>

      <div class="archive-hero__inner">
        <h1 class="archive-hero__title">归档</h1>
        <p class="archive-hero__description">时光轴上的足迹</p>
      </div>
    </section>

    <section class="archive-shell page-content-reveal">
      <div class="archive-main">
        <div v-if="isLoading" class="archive-card archive-card--state">正在整理归档...</div>
        <div v-else-if="error" class="archive-card archive-card--state archive-card--error">{{ error }}</div>
        <div v-else-if="!archiveGroups.length" class="archive-card archive-card--state">还没有归档内容。</div>

        <article v-for="group in archiveGroups" :key="group.year" class="archive-card archive-card--timeline">
          <div class="archive-card__topline">
            <span>共 {{ posts.length }} 篇文章</span>
          </div>

          <div class="archive-year">
            <span class="archive-year__dot"></span>
            <h2>{{ group.year }}</h2>
          </div>

          <div class="archive-timeline">
            <RouterLink
              v-for="post in group.posts"
              :key="post._id"
              :to="{ name: 'article', params: { slug: post.slug } }"
              class="archive-item"
            >
              <span class="archive-item__line"></span>
              <span class="archive-item__date">{{ formatArchiveDate(post.createdAt) }}</span>
              <span class="archive-item__title">{{ post.title }}</span>
            </RouterLink>
          </div>
        </article>
      </div>

      <aside class="archive-side">
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
.archive-view {
  background: linear-gradient(180deg, #f1f4f8 0%, #ffffff 34%, #ffffff 100%);
}

.archive-hero {
  position: relative;
  min-height: 370px;
  overflow: hidden;
  color: #ffffff;
}

.archive-hero__media,
.archive-hero__overlay,
.archive-hero__mist {
  position: absolute;
  inset: 0;
}

.archive-hero__media {
  background:
    linear-gradient(135deg, rgba(57, 64, 100, 0.88), rgba(27, 43, 89, 0.48)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 32%);
  background-size: cover;
  background-position: center;
  transform: scale(1.02);
}

.archive-hero__overlay {
  background: linear-gradient(180deg, rgba(11, 18, 28, 0.16), rgba(11, 18, 28, 0.38));
}

.archive-hero__mist {
  top: auto;
  height: 148px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.74) 60%, #ffffff 100%);
}

.archive-hero__inner {
  position: relative;
  z-index: 1;
  width: min(100%, var(--content-width));
  margin: 0 auto;
  padding: calc(var(--header-height) + 3rem) 2rem 6.8rem;
  text-align: center;
}

.archive-hero__title {
  margin: 0;
  font-size: clamp(2rem, 4.6vw, 2.8rem);
  font-weight: 500;
  letter-spacing: -0.04em;
}

.archive-hero__description {
  margin: 0.8rem 0 0;
  font-size: 0.94rem;
  color: rgba(255, 255, 255, 0.9);
}

.archive-shell {
  position: relative;
  z-index: 2;
  width: min(100%, 1120px);
  margin: -62px auto 0;
  padding: 0 2rem 5.5rem;
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) 260px;
  gap: 1.5rem;
}

.archive-main,
.archive-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.archive-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.archive-card--state,
.archive-card--timeline {
  padding: 1.15rem;
}

.archive-card__topline {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-light);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
}

.archive-year {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin: 1.25rem 0 1rem;
}

.archive-year__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1f2430;
}

.archive-year h2 {
  margin: 0;
  font-size: 1.72rem;
  letter-spacing: -0.03em;
}

.archive-timeline {
  position: relative;
  padding-left: 1.65rem;
}

.archive-timeline::before {
  content: '';
  position: absolute;
  top: 0.2rem;
  bottom: 0.2rem;
  left: 0.45rem;
  width: 1px;
  background: linear-gradient(180deg, rgba(30, 38, 59, 0.28), rgba(30, 38, 59, 0.08));
}

.archive-item {
  position: relative;
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 1rem;
  align-items: center;
  padding: 0.66rem 0;
  color: inherit;
  text-decoration: none;
}

.archive-item:hover .archive-item__title {
  color: var(--accent-cyan);
}

.archive-item__line {
  position: absolute;
  top: 1.08rem;
  left: -1.26rem;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #d7deea;
  border: 1px solid #ffffff;
  box-shadow: 0 0 0 2px rgba(221, 228, 240, 0.3);
}

.archive-item__date {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  color: #a0a9b7;
}

.archive-item__title {
  color: var(--text-secondary);
  line-height: 1.6;
  transition: color 0.25s ease;
}

.archive-card--error {
  color: #a54444;
}

@media (max-width: 1024px) {
  .archive-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .archive-hero {
    min-height: 320px;
  }

  .archive-hero__inner {
    padding: calc(var(--header-height) + 2.4rem) 1.25rem 5.8rem;
  }

  .archive-shell {
    padding: 0 1.25rem 4rem;
  }

  .archive-item {
    grid-template-columns: 1fr;
    gap: 0.2rem;
  }
}
</style>
