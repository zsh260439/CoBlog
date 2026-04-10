<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import ProfileSidebarCard from '@/components/sidebar/ProfileSidebarCard.vue'
import SiteStatsCard from '@/components/sidebar/SiteStatsCard.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { siteConfig } from '@/config/site'
import { useArchive } from '@/composables/useArchive'
import { useArticles } from '@/composables/useArticles'

const { articles } = useArticles()
const { archiveGroups, isLoading, error, loadArchiveGroups, formatArchiveDate } = useArchive()

onMounted(() => {
  void loadArchiveGroups()
})
</script>

<template>
  <div class="archive-view">
    <PageHero
      title="归档"
      description="时光轴上的足迹"
      :image="siteConfig.aboutHeroImage"
    />

    <section class="archive-shell page-content-reveal">
      <div class="archive-main">
        <el-card v-if="isLoading" class="archive-card archive-card--state" shadow="never">正在整理归档...</el-card>
        <el-card v-else-if="error" class="archive-card archive-card--state archive-card--error" shadow="never">{{ error }}</el-card>
        <el-card v-else-if="!archiveGroups.length" class="archive-card archive-card--state" shadow="never">还没有归档内容。</el-card>

        <article v-for="group in archiveGroups" :key="group.year" class="archive-card archive-card--timeline">
          <div class="archive-card__topline">
            <span>共 {{ articles.length }} 篇文章</span>
          </div>

          <div class="archive-year">
            <span class="archive-year__dot"></span>
            <h2>{{ group.year }}</h2>
          </div>

          <div class="archive-timeline">
            <RouterLink
              v-for="article in group.articles"
              :key="article._id"
              :to="{ name: 'article', params: { slug: article.slug } }"
              class="archive-item"
            >
              <span class="archive-item__line"></span>
              <span class="archive-item__date">{{ formatArchiveDate(article.createdAt) }}</span>
              <span class="archive-item__title">{{ article.title }}</span>
            </RouterLink>
          </div>
        </article>
      </div>

      <aside class="archive-side">
        <ProfileSidebarCard
          :articles="articles"
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
.archive-view {
  background: linear-gradient(180deg, #f1f4f8 0%, #ffffff 34%, #ffffff 100%);
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

.archive-card--timeline {
  padding: 1.15rem;
}

.archive-card--state :deep(.el-card__body) {
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
  .archive-shell {
    padding: 0 1.25rem 4rem;
  }

  .archive-item {
    grid-template-columns: 1fr;
    gap: 0.2rem;
  }
}
</style>
