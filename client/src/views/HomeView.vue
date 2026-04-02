<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import ParticleHero from '@/components/ParticleHero.vue'
import ScrollNarrative from '@/components/ScrollNarrative.vue'
import { siteConfig } from '@/config/site'
import type { NarrativeSection } from '@/types'

const sections = computed<NarrativeSection[]>(() => [
  {
    id: '1',
    title: 'Scrollytelling',
    subtitle: '将静态数据转化为流动的叙事',
    content: '通过节奏、动作和结构，将平淡的数据转化为引人入胜的故事。滚动不再只是翻页，而是一场精心编排的体验。'
  },
  {
    id: '2',
    title: 'Minimal Design',
    subtitle: '少即是多',
    content: '去除繁杂，保留精华。每一个元素的存在都有其意义。留白不是浪费，而是呼吸的空间。'
  },
  {
    id: '3',
    title: 'Thoughtful Motion',
    subtitle: '用心的动效',
    content: '动效是沟通的语言，而非装饰。每一个过渡都经过思考，让用户的体验流畅而自然。'
  }
])
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <ParticleHero />

    <!-- 叙事章节 -->
    <section class="section-gradient">
      <ScrollNarrative :sections="sections" />
    </section>

    <!-- 关于 -->
    <section class="about-section">
      <div class="about-content">
        <h2 class="about-title">
          代码、设计<br />
          <span class="highlight">与持续表达</span>
        </h2>
        <p class="about-desc">
          {{ siteConfig.description }} 从这里进入内部页面后，导航、文章、关于和归档会共享统一的顶部横幅与内容布局。
        </p>

        <div class="about-links">
          <RouterLink to="/blog" class="text-link">进入博客</RouterLink>
          <RouterLink to="/about" class="text-link">查看关于</RouterLink>
          <RouterLink to="/archive" class="text-link">浏览归档</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--bg-primary);
}

.section-gradient {
  background: linear-gradient(to bottom, var(--bg-secondary), var(--bg-primary));
}

.about-section {
  padding: 10rem 2rem;
  background: linear-gradient(to bottom, var(--bg-primary), var(--bg-secondary));
}

.about-content {
  max-width: 42rem;
  margin: 0 auto;
  text-align: center;
}

.about-title {
  font-family: var(--font-primary);
  font-size: clamp(1.55rem, 4.4vw, 2.15rem);
  font-weight: 300;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 2rem;
}

.highlight {
  color: var(--accent-cyan);
}

.about-desc {
  font-size: 0.94rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 3rem;
}

.about-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.text-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 8rem;
  padding: 0.85rem 1.15rem;
  border-radius: 999px;
  border: 1px solid var(--border-light);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: var(--shadow-soft);
  color: var(--text-secondary);
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  transition: all 0.25s ease;
}

.text-link:hover {
  border-color: rgba(0, 119, 204, 0.18);
  color: var(--text-primary);
  transform: translateY(-2px);
}
</style>
