<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { siteConfig } from '@/config/site'
import InkHero from '@/components/ui/InkHero.vue'
import SgnlTransition from '@/components/ui/SgnlTransition.vue'
import { consumeHomeIntroPlayback } from './introState'

const shouldPlayIntro = ref(consumeHomeIntroPlayback())
let previousBodyOverflow = ''
let previousHtmlOverflow = ''

interface SkillItem {
  name: string
  level: string
}

interface SkillGroup {
  id: string
  badge: string
  title: string
  subtitle: string
  skills: SkillItem[]
}

interface Project {
  id: string
  title: string
  summary: string
  year: string
  tags: string[]
  href: string
}

const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    badge: '01',
    title: '前端开发',
    subtitle: 'Vue 3 · TypeScript · 组件工程',
    skills: [
      { name: 'Vue 3 组件化开发', level: '精通' },
      { name: 'TypeScript 类型约束', level: '精通' },
      { name: 'Vue Router', level: '熟练' },
      { name: 'UnoCSS / 原子化样式', level: '熟练' },
      { name: 'Element Plus', level: '熟练' },
      { name: 'Markdown 内容呈现', level: '熟练' },
    ],
  },
  {
    id: 'engineering',
    badge: '02',
    title: '工程实践',
    subtitle: '构建链路 · 请求架构 · 可维护性',
    skills: [
      { name: 'Vite 工程化构建', level: '精通' },
      { name: 'Axios 请求封装', level: '精通' },
      { name: 'pnpm + Turbo', level: '熟练' },
      { name: '组合式 Hooks', level: '熟练' },
      { name: '响应式 / 双端适配', level: '熟练' },
      { name: '后台管理系统', level: '熟练' },
    ],
  },
  {
    id: 'backend',
    badge: '03',
    title: '服务端能力',
    subtitle: 'NestJS · MongoDB · 实时通信',
    skills: [
      { name: 'NestJS 模块化服务', level: '熟练' },
      { name: 'MongoDB / Mongoose', level: '熟练' },
      { name: 'SSE 实时推送', level: '熟练' },
      { name: 'RESTful 接口设计', level: '熟练' },
      { name: '图片上传与静态资源', level: '熟练' },
      { name: '访客统计与 IP 定位', level: '了解' },
    ],
  },
]

const projects: Project[] = [
  {
    id: 'coblog',
    title: 'CoBlog',
    summary: '围绕内容发布、文章详情、目录联动、留言板和后台管理搭建的一套博客系统，重点在界面表达和工程结构的持续迭代。',
    year: '2026',
    tags: ['Vue 3', 'TypeScript', 'Vite', 'Element Plus', 'ECharts', 'NestJS'],
    href: '/blog',
  },
  {
    id: 'consult',
    title: '优医问诊',
    summary: '覆盖问诊下单、支付、问诊室、药品订单与物流跟踪的移动端业务项目，强调真实流程联调和状态流转体验。',
    year: '2026',
    tags: ['Vue 3', 'Vant 4', 'Pinia', 'Socket.IO', 'Express', 'MongoDB'],
    href: 'https://github.com/zsh260439/consult-patient',
  },
]

const setupReveal = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible')
        }
      })
    },
    { threshold: 0.15 }
  )
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
  return observer
}

const lockPageScroll = () => {
  previousBodyOverflow = document.body.style.overflow
  previousHtmlOverflow = document.documentElement.style.overflow
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
}

const unlockPageScroll = () => {
  document.body.style.overflow = previousBodyOverflow
  document.documentElement.style.overflow = previousHtmlOverflow
}

const handleHeroReady = () => {
  if (!shouldPlayIntro.value) return

  shouldPlayIntro.value = false
  unlockPageScroll()
}

onMounted(() => {
  setupReveal()

  if (shouldPlayIntro.value) {
    lockPageScroll()
  }
})

onUnmounted(() => {
  unlockPageScroll()
})
</script>

<template>
  <div class="home">
    <div class="hero-fusion">
      <InkHero :skip-intro="!shouldPlayIntro" @ready="handleHeroReady">
        <p class="hero__subtitle">{{ siteConfig.ownerRole }} · {{ siteConfig.ownerLocation }}</p>
        <div class="hero__actions">
          <router-link to="/blog" class="hero__btn hero__btn--outline " >进入博客</router-link>
          <router-link to="/about" class="hero__btn hero__btn--outline">了解我</router-link>
          <a href="https://github.com/zsh260439" target="_blank" class="hero__btn hero__btn--outline">GitHub</a>
        </div>
      </InkHero>

      <div class="hero-fusion__overlay">
        <SgnlTransition :show-ui="false" transparent overlay-mask :seed="2026" />
      </div>
    </div>

    <section class="section section--skills">
      <div class="section__inner">
        <div class="section__header">
          <span class="section__label">01</span>
          <h2 class="section__title">技能栈</h2>
        </div>

        <div class="skills-grid">
          <div
            v-for="group in skillGroups"
            :key="group.id"
            class="skill-card reveal"
          >
            <div class="skill-card__head">
              <span class="skill-card__badge">{{ group.badge }}</span>
              <div>
                <h3 class="skill-card__title">{{ group.title }}</h3>
                <p class="skill-card__subtitle">{{ group.subtitle }}</p>
              </div>
            </div>
            <div class="skill-card__tags">
              <span v-for="skill in group.skills" :key="skill.name" class="skill-card__tag">
                {{ skill.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--projects">
      <div class="section__inner">
        <div class="section__header">
          <span class="section__label">02</span>
          <h2 class="section__title">项目经历</h2>
        </div>

        <div class="projects-grid">
          <a
            v-for="project in projects"
            :key="project.id"
            :href="project.href"
            target="_blank"
            class="project-card reveal"
          >
            <div class="project-card__top">
              <span class="project-card__year">{{ project.year }}</span>
              <h3 class="project-card__title">{{ project.title }}</h3>
            </div>
            <p class="project-card__desc">{{ project.summary }}</p>
            <div class="project-card__tags">
              <span v-for="tag in project.tags" :key="tag" class="project-card__tag">{{ tag }}</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal--visible {
  opacity: 1;
  transform: translateY(0);
}

/* ── Hero ── */
.hero__subtitle {
  font-family: 'Space Mono', monospace;
  font-size: 0.82rem;
  color: rgba(240, 240, 238, 0.6);
  margin: 1.5rem 0 2rem;
  letter-spacing: 0.06em;
}

.hero__actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.hero__btn {
  font-family: 'Space Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  padding: 0.7rem 1.4rem;
  border-radius: 999px;
  text-decoration: none;
  color: #e8e8e5;
  transition: all 0.25s ease;
}

.hero__btn--outline {
  background: transparent;
  color: rgba(240, 240, 238, 0.7);
  border: 1px solid rgba(240, 240, 238, 0.2);
}

.hero__btn--outline:hover {
  background: rgba(240, 240, 238, 0.06);
}

.hero-fusion {
  position: relative;
}

.hero-fusion__overlay {
  position: absolute;
  inset: 0;
  z-index: 6;
  pointer-events: none;
}

.hero-fusion :deep(.ink-title) {
  z-index: 20;
}

.hero-fusion :deep(.ink-meta) {
  z-index: 20;
}

.hero-fusion :deep(.blog-content) {
  z-index: 20;
}

.hero-fusion :deep(.crosshair) {
  z-index: 20;
}

.hero-fusion__overlay :deep(.sgnl-stage) {
  min-height: 100%;
  height: 100%;
}


/* ── Section ── */
.section {
  position: relative;
  padding: 3rem 1.5rem;
}

.section--skills {
  padding-top: 8rem;
  background: linear-gradient(
    to bottom,
    #000000 0%,
    #050505 10%,
    #161616 20%,
    #3b3b39 36%,
    #7a7a76 54%,
    #b9b9b4 70%,
    #dcdcd9 84%,
    #e5e5e2 100%
  );
}

.section--skills::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 220px;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.02) 18%,
    rgba(220, 220, 217, 0.14) 48%,
    rgba(220, 220, 217, 0.45) 72%,
    rgba(220, 220, 217, 0.92) 100%
  );
  filter: blur(18px);
}

.section--projects {
  padding-top: 5rem;
  background: linear-gradient(
    to bottom,
     #e5e5e2 100%
  );
}


.section__inner {
  max-width: 60rem;
  margin: 0 auto;
}

.section__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(5, 5, 5, 0.12);
  padding-bottom: 1rem;
  position: relative;
  z-index: 2;
}

.section__label {
  font-family: 'Space Mono', monospace;
  font-size: 0.65rem;
  color: rgba(5, 5, 5, 0.35);
  letter-spacing: 0.1em;
}

.section__title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.6rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  margin: 0;
  color: #050505;
}

/* ── Skills ── */
.skills-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
}

.skill-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.62));
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 16px;
  padding: 1.25rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease, transform 0.3s ease;
}

.skill-card:hover {
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.12);
  border-color: rgba(255, 255, 255, 0.24);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.38), rgba(255, 255, 255, 0.72));
  transform: translateY(-2px);
}

.skill-card__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.skill-card__badge {
  font-family: 'Space Mono', monospace;
  font-size: 0.55rem;
  color: rgba(5, 5, 5, 0.35);
  width: 1.6rem;
  text-align: center;
  flex-shrink: 0;
}

.skill-card__title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.15rem;
  font-weight: 900;
  margin: 0;
  color: #050505;
}

.skill-card__subtitle {
  font-family: 'Space Mono', monospace;
  font-size: 0.62rem;
  color: rgba(5, 5, 5, 0.45);
  margin: 0.15rem 0 0;
}

.skill-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.75rem;
}

.skill-card__tag {
  font-family: 'Space Mono', monospace;
  font-size: 0.58rem;
  color: rgba(5, 5, 5, 0.55);
  padding: 0.2rem 0.5rem;
  border: 1px solid rgba(5, 5, 5, 0.08);
  border-radius: 4px;
}

/* ── Projects ── */
.projects-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
}

.project-card {
  display: block;
  text-decoration: none;
  color: inherit;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.68));
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease, background 0.3s ease;
}

.project-card:hover {
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
  border-color: rgba(255, 255, 255, 0.24);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0.76));
  transform: translateY(-3px);
}

.project-card__top {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.project-card__year {
  font-family: 'Space Mono', monospace;
  font-size: 0.6rem;
  color: rgba(5, 5, 5, 0.4);
  flex-shrink: 0;
}

.project-card__title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  margin: 0;
  color: #050505;
}

.project-card__desc {
  font-size: 0.78rem;
  color: rgba(5, 5, 5, 0.55);
  line-height: 1.65;
  margin: 0 0 0.75rem;
}

.project-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.project-card__tag {
  font-family: 'Space Mono', monospace;
  font-size: 0.55rem;
  color: rgba(5, 5, 5, 0.5);
  padding: 0.15rem 0.45rem;
  border: 1px solid rgba(5, 5, 5, 0.08);
  border-radius: 3px;
}




@media (max-width: 767px) {
  .hero__title {
    font-size: clamp(3rem, 18vw, 6rem);
  }
}
</style>
