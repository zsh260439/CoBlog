<script setup lang="ts">
import { computed, onMounted } from 'vue'
import PostCard from '@/components/blog/PostCard.vue'
import ProfileSidebarCard from '@/components/sidebar/ProfileSidebarCard.vue'
import SiteStatsCard from '@/components/sidebar/SiteStatsCard.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { siteConfig } from '@/config/site'
import { useArticles } from '@/composables/useArticles'
import { useTaxonomies } from '@/composables/useTaxonomies'
import { useSeo } from '@/utils/seo'
import { ref } from 'vue'

const { articles, isLoading, error, loadArticles } = useArticles()
const { categories } = useTaxonomies()
const categoryCount = computed(() => categories.value.length)
const currentPage = ref(1)
const pageSize = 6
const pagedArticles = computed(()=>{
   const start = (currentPage.value-1) * pageSize
   return articles.value.slice(start, start+pageSize)
})
useSeo({
  title: '博客',
  description: '浏览 CoBlog 的全部文章内容，包含技术记录、学习心得、工程实践与日常思考。',
  path: '/blog',
  image: '/images/BLOG.webp',
})

onMounted(() => {
  loadArticles()
})

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
       <template v-else>
  <PostCard
    v-for="article in pagedArticles"
    :key="article.slug"
    :article="article"
  />
  <el-pagination
   v-if="articles.length > pageSize"
   v-model:current-page="currentPage"
   class="blog-pagination"
   layout="prev,pager,next"
   :page-size="pageSize"
   :total="articles.length"
  >
  </el-pagination>
  
</template>
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
.blog-pagination {
  justify-content: center;
  margin-top: 0.5rem;
}
/* 改分页默认文字颜色 */
:deep(.el-pagination .el-pager li) {
  color: #333 !important; /* 你想要的颜色 */
}



/* 改上一页、下一页文字颜色 */
:deep(.el-pagination .btn-prev, .el-pagination .btn-next) {
  color: #333 !important;
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
  min-height: 140px;
  display: grid;
  place-items: center;
  text-align: center;
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
