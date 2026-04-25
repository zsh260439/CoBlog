<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BlogListItem from '@/components/blog/BlogListItem.vue'
import ProfileSidebarCard from '@/components/sidebar/ProfileSidebarCard.vue'
import SiteStatsCard from '@/components/sidebar/SiteStatsCard.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { useTag } from '@/composables/useTag'
import { useArticles } from '@/composables/useArticles'
import { siteConfig } from '@/config/site'

const route = useRoute()
const currentTag = computed(() => String(route.params.tag ?? ''))

const { articles, isLoading, error } = useTag(currentTag)
const { articles: allArticles } = useArticles()
</script>

<template>
  <div class="tag-view">
    <PageHero
      :title="currentTag ? `#${currentTag}` : '标签'"
      :description="currentTag ? `标签「${currentTag}」下的文章整理` : '未找到对应标签'"
      image="/images/TAG.webp"
      height="medium"
      :mist-height="100"
    />

    <section class="tag-shell page-content-reveal">
      <div class="tag-main">
        <el-card v-if="!currentTag" class="tag-state" shadow="never">
          标签不存在。
        </el-card>
        <el-card v-else-if="isLoading" class="tag-state" shadow="never">
          正在加载标签文章...
        </el-card>
        <el-card v-else-if="error" class="tag-state" shadow="never">
          {{ error }}
        </el-card>
        <el-card v-else-if="!articles.length" class="tag-state" shadow="never">
          这个标签下暂时还没有文章。
        </el-card>

        <BlogListItem
          v-for="article in articles"
          v-else
          :key="article.slug"
          :article="article"
        />
      </div>

      <aside class="tag-side">
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
.tag-view {
  background: linear-gradient(180deg, #eff3f9 0%, #ffffff 34%, #ffffff 100%);
}

.tag-shell {
  position: relative;
  z-index: 2;
  width: min(100%, 1120px);
  margin: -14px auto 0;
  padding: 0 2rem 5rem;
  display: grid;
  grid-template-columns: minmax(0, 1.58fr) 260px;
  gap: 1.5rem;
}

.tag-main,
.tag-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tag-state {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.tag-state :deep(.el-card__body) {
  padding: 1.15rem;
}

@media (max-width: 1024px) {
  .tag-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .tag-shell {
    padding: 0 1.25rem 4rem;
  }
}
</style>
