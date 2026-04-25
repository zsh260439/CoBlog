<script setup lang="ts">
import { computed, onMounted } from 'vue'
import BlogListItem from '@/components/blog/BlogListItem.vue'
import ProfileSidebarCard from '@/components/sidebar/ProfileSidebarCard.vue'
import SiteStatsCard from '@/components/sidebar/SiteStatsCard.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { siteConfig } from '@/config/site'
import { useArticles } from '@/composables/useArticles'
import { summarizeCategories } from '@/utils'
const { articles, isLoading, error } = useArticles()
const categoryCount = computed(() => summarizeCategories(articles.value).length)

</script>

<template>
  <div class="blog-view">
    <PageHero
      title="Zsint"
      description="随便坐坐，看看我写的字 —— 一些技术、心得、生活日常和胡思乱想。"
      image="/images/BLOG.webp"
      height="large"
      :mist-height="100"
    >
      <template #meta>
        <span>{{ articles.length }} 篇文章</span>
        <span>{{ categoryCount }} 个分类</span>
      </template>
    </PageHero>

    <section class="blog-shell page-content-reveal">
      <div class="blog-main">
        <el-card v-if="isLoading" class="blog-state" shadow="never">正在整理文章列表...</el-card>
        <el-card v-else-if="error" class="blog-state blog-state--error" shadow="never">{{ error }}</el-card>
        <el-card v-else-if="!articles.length" class="blog-state" shadow="never">还没有文章，后续内容会先落在这里。</el-card>

        <BlogListItem v-for="article in articles" v-else :key="article.slug" :article="article" />
      </div>

      <aside class="blog-side">
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
.blog-view {
  background: linear-gradient(180deg, #f6f6f6 0%, #ffffff 30%, #ffffff 100%);
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
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(17, 17, 17, 0.05);
}

.blog-state :deep(.el-card__body) {
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
  .blog-shell {
    padding: 0 1.25rem 4rem;
  }
}
</style>
