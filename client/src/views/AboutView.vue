<script setup lang="ts">
import { computed } from 'vue'
import ProfileSidebarCard from '@/components/sidebar/ProfileSidebarCard.vue'
import SiteStatsCard from '@/components/sidebar/SiteStatsCard.vue'
import { aboutSections, siteConfig } from '@/config/site'
import { usePosts } from '@/composables/usePosts'

const { posts } = usePosts()

const heroStyle = computed(() => ({
  backgroundImage: `linear-gradient(180deg, rgba(16, 20, 31, 0.16), rgba(16, 20, 31, 0.58)), url(${siteConfig.aboutHeroImage})`
}))

const introSection = computed(() => aboutSections[0] ?? null)
const detailSections = computed(() => aboutSections.slice(1))

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
  <div class="about-view">
    <section class="about-hero">
      <div class="about-hero__media" :style="heroStyle"></div>
      <div class="about-hero__veil"></div>
      <div class="about-hero__mist"></div>

      <div class="about-hero__inner">
        <h1 class="about-hero__title">关于</h1>
        <p class="about-hero__description">关于我和这个博客</p>
      </div>
    </section>

    <section class="about-shell page-content-reveal">
      <div class="about-main">
        <article v-if="introSection" class="about-card about-card--lead">
          <div class="about-card__marker"></div>

          <div class="about-card__content">
            <h2>{{ introSection.title }}</h2>
            <p v-for="paragraph in introSection.paragraphs" :key="paragraph">{{ paragraph }}</p>
          </div>
        </article>

        <article v-for="section in detailSections" :key="section.title" class="about-card">
          <h2>{{ section.title }}</h2>
          <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
        </article>
      </div>

      <aside class="about-side">
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
.about-view {
  background: linear-gradient(180deg, #eff3f9 0%, #ffffff 34%, #ffffff 100%);
}

.about-hero {
  position: relative;
  min-height: 360px;
  overflow: hidden;
  color: #ffffff;
}

.about-hero__media,
.about-hero__veil,
.about-hero__mist {
  position: absolute;
  inset: 0;
}

.about-hero__media {
  background:
    linear-gradient(135deg, rgba(57, 64, 100, 0.88), rgba(27, 43, 89, 0.48)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 32%);
  background-size: cover;
  background-position: center;
  transform: scale(1.02);
}

.about-hero__veil {
  background: linear-gradient(180deg, rgba(11, 18, 28, 0.16), rgba(11, 18, 28, 0.38));
}

.about-hero__mist {
  top: auto;
  height: 148px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.74) 60%, #ffffff 100%);
}

.about-hero__inner {
  position: relative;
  z-index: 1;
  width: min(100%, var(--content-width));
  margin: 0 auto;
  padding: calc(var(--header-height) + 3rem) 2rem 6.8rem;
  text-align: center;
}

.about-hero__title {
  margin: 0;
  font-size: clamp(2rem, 4.6vw, 2.8rem);
  font-weight: 500;
  letter-spacing: -0.04em;
}

.about-hero__description {
  margin: 0.8rem 0 0;
  font-size: 0.94rem;
  color: rgba(255, 255, 255, 0.9);
}

.about-shell {
  position: relative;
  z-index: 2;
  width: min(100%, 1120px);
  margin: -62px auto 0;
  padding: 0 2rem 5rem;
  display: grid;
  grid-template-columns: minmax(0, 1.58fr) 260px;
  gap: 1.5rem;
}

.about-main,
.about-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.about-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  padding: 1.15rem;
}

.about-card--lead {
  display: grid;
  grid-template-columns: 3px minmax(0, 1fr);
  gap: 1rem;
}

.about-card__marker {
  border-radius: 999px;
  background: linear-gradient(180deg, var(--accent-cyan), rgba(0, 119, 204, 0.2));
}

.about-card__content {
  min-width: 0;
}

.about-card h2 {
  margin: 0 0 0.9rem;
  font-size: 1.28rem;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: -0.03em;
}

.about-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.92rem;
  line-height: 1.8;
}

.about-card p + p {
  margin-top: 0.9rem;
}

@media (max-width: 1024px) {
  .about-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .about-hero {
    min-height: 320px;
  }

  .about-hero__inner {
    padding: calc(var(--header-height) + 2.4rem) 1.25rem 5.8rem;
  }

  .about-shell {
    padding: 0 1.25rem 4rem;
  }

  .about-card--lead {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .about-card__marker {
    height: 3px;
  }
}
</style>
