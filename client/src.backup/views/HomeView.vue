<script setup lang="ts">
import { computed } from 'vue'
import ParticleHero from '@/components/ParticleHero.vue'
import ScrollNarrative from '@/components/ScrollNarrative.vue'
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
        <span class="about-label">关于</span>
        <h2 class="about-title">
          精心构建<br />
          <span class="highlight">用心设计</span>
        </h2>
        <p class="about-desc">
          一个探索代码之美与设计之心的博客空间。
          每一行代码、每一个像素、每一次交互都经过深思熟虑。
        </p>

        <div class="about-links">
          <a href="#">GitHub</a>
          <a href="#">Twitter</a>
          <a href="#">邮箱</a>
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

.about-label {
  font-size: 0.6875rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text-muted);
  display: block;
  margin-bottom: 2rem;
}

.about-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 300;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 2rem;
}

.highlight {
  color: var(--accent-cyan);
}

.about-desc {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 3rem;
}

.about-links {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
}

.about-links a {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8125rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.3s ease;
}

.about-links a:hover {
  color: var(--accent-cyan);
}
</style>
