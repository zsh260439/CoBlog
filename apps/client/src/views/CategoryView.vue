<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PostCard from '@/components/blog/PostCard.vue'
import ProfileSidebarCard from '@/components/sidebar/ProfileSidebarCard.vue'
import SiteStatsCard from '@/components/sidebar/SiteStatsCard.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { useCategory } from '@/composables/useCategory'
import { useArticles } from '@/composables/useArticles'
import { siteConfig } from '@/config/site'
import { useSeo } from '@/utils/seo'

const route = useRoute()
const currentSlug = computed(() => String(route.params.slug || ''))
const currentCategoryLabel = computed(() => currentCategory.value ? currentCategory.value.label : '分类')
const searchKeyword = computed(() => String(route.query.q || '').trim().toLowerCase())

const { currentCategory, articles, isLoading, error } = useCategory(currentSlug)
// 全站文章数量
const { articles: allArticles, loadArticles } = useArticles()
const filteredArticles = computed(() => {
  if (!searchKeyword.value) {
    return articles.value
  }

  return articles.value.filter((article) => {
    const searchableText = [
      article.title,
      article.excerpt,
      article.category,
      article.content,
      ...article.tags,
    ].join(' ').toLowerCase()

    return searchableText.includes(searchKeyword.value)
  })
})

useSeo({
  title: computed(() => currentCategory.value ? `${currentCategory.value.label} 分类` : '分类'),
  description: computed(() => currentCategory.value ? `${currentCategory.value.label} 分类下的文章整理与内容汇总。` : '查看 CoBlog 中按分类归档的文章内容。'),
  path: computed(() => currentSlug.value ? `/category/${currentSlug.value}` : '/blog'),
  image: '/images/CATEGORY.webp',
  robots: computed(() => currentCategory.value ? 'index,follow' : 'noindex,nofollow'),
})

onMounted(() => {
  loadArticles()
})
</script>

<template>
  <div class="category-view">
    <PageHero
      :title="currentCategoryLabel"
      :description="currentCategory ? `${currentCategory.label} 下的文章整理` : '未找到对应分类'"
      image="/images/CATEGORY.webp"
      height="medium"
      :mist-height="100"
    />

    <section class="category-shell page-content-reveal">
      <div class="category-main">
        <el-card v-if="!currentCategory" class="category-state" shadow="never">分类不存在。</el-card>
        <el-card v-else-if="isLoading" class="category-state" shadow="never">正在加载分类文章...</el-card>
        <el-card v-else-if="error" class="category-state" shadow="never">{{ error }}</el-card>
        <el-card v-else-if="!filteredArticles.length" class="category-state" shadow="never">
          {{ searchKeyword ? '当前分类下没有匹配的文章。' : '这个分类下暂时还没有文章。' }}
        </el-card>

        <PostCard
          v-for="article in filteredArticles"
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
}

.category-state :deep(.el-card__body) {
  min-height: 140px;
  padding: 1.15rem;
  display: grid;
  place-items: center;
  text-align: center;
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
