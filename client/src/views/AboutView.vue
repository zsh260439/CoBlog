<script setup lang="ts">
import { computed } from 'vue'
import ProfileSidebarCard from '@/components/sidebar/ProfileSidebarCard.vue'
import SiteStatsCard from '@/components/sidebar/SiteStatsCard.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { aboutSections, siteConfig } from '@/config/site'
import { usePosts } from '@/composables/usePosts'

const { posts } = usePosts()

const introSection = computed(() => aboutSections[0] ?? null)
const detailSections = computed(() => aboutSections.slice(1))
</script>

<template>
  <div class="about-view">
    <PageHero title="关于" description="关于我和这个博客" :image="siteConfig.aboutHeroImage" />

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
.about-view {
  background: linear-gradient(180deg, #eff3f9 0%, #ffffff 34%, #ffffff 100%);
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
