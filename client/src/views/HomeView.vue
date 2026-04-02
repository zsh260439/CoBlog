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
        <h2 class="about-title">
          代码、设计<br />
          <span class="highlight">与持续表达</span>
        </h2>
        <p class="about-desc">
          这里是我的个人空间，记录开发实践、设计思考与日常灵感。愿每一段代码都足够清晰，每一次交互都自然顺手。
        </p>

        <div class="about-links">
          <a href="#" class="icon-link" aria-label="GitHub">
            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
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
  gap: 2rem;
}

.icon-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-muted);
  transition: all 0.25s ease;
}

.icon-link:hover {
  background: var(--accent-cyan);
  color: white;
  transform: translateY(-2px);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
