<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useMouse, usePreferredReducedMotion, useRafFn, useWindowSize } from '@vueuse/core'
import HomeProjectCard from '@/views/homeView/components/HomeProjectCard.vue'
import HomeSkillCard from '@/views/homeView/components/HomeSkillCard.vue'
import { siteConfig } from '@/config/site'
import type { HomeProjectItem, HomeSkillGroup } from '@/types/ui'

// 首页技能区按三组内容展示，数据固定在页面层统一管理。
const skillGroups: HomeSkillGroup[] = [
  {
    id: 'frontend',
    badge: 'FE',
    title: '前端开发',
    subtitle: 'Vue 3 · TypeScript · 组件工程与内容呈现',
    metrics: [
      { label: '核心技能', value: '6+' },
      { label: '常用方案', value: '4' },
      { label: '掌握度', value: '90%' },
    ],
    details: [
      { name: 'Vue 3 组件化开发', level: '熟练' },
      { name: 'TypeScript 类型约束', level: '熟练' },
      { name: 'Vue Router / 前端路由', level: '熟练' },
      { name: 'UnoCSS / 原子化样式', level: '熟练' },
      { name: 'Element Plus 后台组件', level: '熟练' },
      { name: 'Markdown 内容呈现', level: '熟练' },
    ],
  },
  {
    id: 'engineering',
    badge: 'EG',
    title: '工程实践',
    subtitle: '构建链路、请求架构与可维护性迭代',
    metrics: [
      { label: '项目经验', value: '2' },
      { label: '复用模块', value: '10+' },
      { label: '维护度', value: '95%' },
    ],
    details: [
      { name: 'Vite 工程化构建', level: '熟练' },
      { name: 'Axios 请求封装与拦截', level: '熟练' },
      { name: 'pnpm + Turbo 协作管理', level: '熟练' },
      { name: '组合式 Hooks 抽离', level: '熟练' },
      { name: '响应式 / 双端适配', level: '熟练' },
      { name: '后台管理系统搭建', level: '熟练' },
    ],
  },
  {
    id: 'backend',
    badge: 'BE',
    title: '服务端能力',
    subtitle: 'NestJS · MongoDB · 接口设计与实时通信',
    metrics: [
      { label: '服务模块', value: '6+' },
      { label: '数据模型', value: '4' },
      { label: '联调完成度', value: '85%' },
    ],
    details: [
      { name: 'NestJS 模块化服务', level: '熟练' },
      { name: 'MongoDB / Mongoose 建模', level: '熟练' },
      { name: 'SSE 实时推送', level: '熟练' },
      { name: 'RESTful 接口设计', level: '熟练' },
      { name: '图片上传与静态资源', level: '熟练' },
      { name: '访客统计与 IP 定位', level: '了解' },
    ],
  },
]

// 首页项目区先展示两个代表性项目，详情仍然从对应页面进入。
const projects: HomeProjectItem[] = [
  {
    id: 'coblog',
    title: 'CoBlog 个人博客系统',
    summary: '围绕内容发布、文章详情、目录联动、留言板和后台管理搭建的一套博客系统，重点在界面表达和工程结构的持续迭代。',
    year: '2026',
    tags: ['Vue 3', 'TypeScript', 'Vite', 'Element Plus', 'ECharts', 'NestJS','UnoCSS','SSE'],
    href: '/blog',
    internal: true,
  },
  {
    id: 'consult',
    title: '优医问诊移动端项目',
    summary: '覆盖问诊下单、支付、问诊室、药品订单与物流跟踪的移动端业务项目，强调真实流程联调和状态流转体验。',
    year: '2026',
    tags: ['Vue 3', 'TypeScript', 'Vite', 'Vant 4', 'Pinia', 'Socket.IO'],
    href: 'https://github.com/zsh260439/consult-patient',
    internal: false,
  },
]

const heroRef = ref<HTMLElement | null>(null)
const heroInnerRef = ref<HTMLElement | null>(null)
const isPointerInside = ref(false)
const isHeroHovered = ref(false)

const { x: mouseX, y: mouseY } = useMouse({ type: 'client' })
const { width, height } = useWindowSize()
const preferredReducedMotion = usePreferredReducedMotion()

// 小白圆环和黑球分开维护，避免首屏遮罩和普通指针状态互相干扰。
const cursorRing = reactive({ x: 0, y: 0, opacity: 0, scale: 1 })
const cursorRingTarget = reactive({ scale: 1 })

// 首屏黑球与文字偏移需要在同一帧里同步更新，所以统一收口在响应式对象里。
const heroOrb = reactive({ x: 0, y: 0, size: 320, opacity: 1 })
const heroOrbTarget = reactive({ x: 0, y: 0, size: 320, opacity: 1 })
const heroMask = reactive({ x: 0, y: 0 })
const heroMotion = reactive({
  badgeX: 0,
  badgeY: 0,
  titleX: 0,
  titleY: 0,
  titleRotate: -4,
  subtitleX: 0,
  subtitleY: 0,
  descX: 0,
  descY: 0,
})

const projectTransforms = reactive<Record<string, { rotateX: number; rotateY: number; x: number; y: number }>>(
  Object.fromEntries(projects.map((project) => [project.id, { rotateX: 0, rotateY: 0, x: 0, y: 0 }]))
)

// 桌面端且用户没有开启减少动态时，才启用首页鼠标联动效果。
const isCursorEnabled = computed(() => width.value >= 1024 && preferredReducedMotion.value !== 'reduce')

const heroHintText = computed(() =>
  isCursorEnabled.value
    ? '移动鼠标开启探索吧。向下滚动查看技能栈与项目经历。'
    : '向下滚动查看技能栈与项目经历。'
)

const cursorRingStyle = computed(() => ({
  opacity: String(cursorRing.opacity),
  transform: `translate3d(${cursorRing.x - 14}px, ${cursorRing.y - 14}px, 0) scale(${cursorRing.scale})`,
}))

const heroOrbStyle = computed(() => ({
  width: `${heroOrb.size}px`,
  height: `${heroOrb.size}px`,
  opacity: String(heroOrb.opacity),
  transform: `translate3d(${heroOrb.x - heroOrb.size / 2}px, ${heroOrb.y - heroOrb.size / 2}px, 0)`,
}))

const heroHeadingMaskStyle = computed(() => ({
  opacity: String(heroOrb.opacity),
  clipPath: `circle(${heroOrb.size / 2}px at ${heroMask.x}px ${heroMask.y}px)`,
}))

const heroBadgeStyle = computed(() => ({
  transform: `translate3d(${heroMotion.badgeX}px, ${heroMotion.badgeY}px, 0)`,
}))

const heroTitleStyle = computed(() => ({
  transform: `translate3d(${heroMotion.titleX}px, ${heroMotion.titleY}px, 0) rotate(${heroMotion.titleRotate}deg)`,
}))

const heroSubtitleStyle = computed(() => ({
  transform: `translate3d(${heroMotion.subtitleX}px, ${heroMotion.subtitleY}px, 0)`,
}))

const heroDescStyle = computed(() => ({
  transform: `translate3d(${heroMotion.descX}px, ${heroMotion.descY}px, 0)`,
}))

const enterHomeStage = () => {
  isPointerInside.value = true
}

const leaveHomeStage = () => {
  isPointerInside.value = false
  isHeroHovered.value = false
}

const enterHeroStage = () => {
  isHeroHovered.value = true

  if (!isCursorEnabled.value) {
    return
  }

  const heroElement = heroRef.value

  if (heroElement) {
    const rect = heroElement.getBoundingClientRect()
    const localX = mouseX.value - rect.left
    const localY = mouseY.value - rect.top

    heroOrb.x = localX
    heroOrb.y = localY
    heroOrbTarget.x = localX
    heroOrbTarget.y = localY
  }

  cursorRingTarget.scale = 0.88
}

const leaveHeroStage = () => {
  isHeroHovered.value = false
  cursorRingTarget.scale = 1
}

const focusCardCursor = () => {
  if (!isCursorEnabled.value) {
    return
  }

  cursorRingTarget.scale = 1.28
}

const resetCursor = () => {
  if (!isCursorEnabled.value) {
    return
  }

  cursorRingTarget.scale = isHeroHovered.value ? 0.88 : 1
}

const updateHeroTargets = () => {
  const heroElement = heroRef.value

  if (!heroElement) {
    return
  }

  const rect = heroElement.getBoundingClientRect()

  if (!isCursorEnabled.value) {
    heroOrbTarget.opacity = 0
    return
  }

  heroOrbTarget.opacity = isPointerInside.value && isHeroHovered.value ? 1 : 0

  if (!isPointerInside.value || !isHeroHovered.value) {
    heroMotion.badgeX += (0 - heroMotion.badgeX) * 0.12
    heroMotion.badgeY += (0 - heroMotion.badgeY) * 0.12
    heroMotion.titleX += (0 - heroMotion.titleX) * 0.12
    heroMotion.titleY += (0 - heroMotion.titleY) * 0.12
    heroMotion.titleRotate += (-4 - heroMotion.titleRotate) * 0.12
    heroMotion.subtitleX += (0 - heroMotion.subtitleX) * 0.12
    heroMotion.subtitleY += (0 - heroMotion.subtitleY) * 0.12
    heroMotion.descX += (0 - heroMotion.descX) * 0.12
    heroMotion.descY += (0 - heroMotion.descY) * 0.12
    return
  }

  const localX = mouseX.value - rect.left
  const localY = mouseY.value - rect.top
  const ratioX = (localX - rect.width / 2) / rect.width
  const ratioY = (localY - rect.height / 2) / rect.height

  // 黑球和文案偏移都基于首屏局部坐标计算，避免页面滚动时出现跳动。
  heroOrbTarget.x = localX
  heroOrbTarget.y = localY

  heroMotion.badgeX += (ratioX * 16 - heroMotion.badgeX) * 0.12
  heroMotion.badgeY += (ratioY * 10 - heroMotion.badgeY) * 0.12
  heroMotion.titleX += (ratioX * 46 - heroMotion.titleX) * 0.12
  heroMotion.titleY += (ratioY * 28 - heroMotion.titleY) * 0.12
  heroMotion.titleRotate += (-4 + ratioX * 8 - heroMotion.titleRotate) * 0.12
  heroMotion.subtitleX += (ratioX * 18 - heroMotion.subtitleX) * 0.12
  heroMotion.subtitleY += (ratioY * 12 - heroMotion.subtitleY) * 0.12
  heroMotion.descX += (ratioX * 10 - heroMotion.descX) * 0.12
  heroMotion.descY += (ratioY * 8 - heroMotion.descY) * 0.12
}

const getProjectStyle = (id: string) => {
  const motion = projectTransforms[id]

  return {
    transform: `perspective(1400px) translate3d(${motion.x}px, ${motion.y}px, 0) rotateX(${motion.rotateX}deg) rotateY(${motion.rotateY}deg)`,
  }
}

const handleProjectMove = (id: string, event: MouseEvent) => {
  if (!isCursorEnabled.value) {
    return
  }

  const element = event.currentTarget as HTMLElement
  const rect = element.getBoundingClientRect()
  const ratioX = (event.clientX - rect.left) / rect.width
  const ratioY = (event.clientY - rect.top) / rect.height

  // 项目卡只做轻量 3D 倾斜，幅度控制在一个较稳的范围内。
  projectTransforms[id] = {
    rotateX: (0.5 - ratioY) * 4.5,
    rotateY: (ratioX - 0.5) * 7,
    x: (ratioX - 0.5) * 18,
    y: (ratioY - 0.5) * 16,
  }

  focusCardCursor()
}

const resetProjectTransform = (id: string) => {
  projectTransforms[id] = { rotateX: 0, rotateY: 0, x: 0, y: 0 }
  resetCursor()
}

const { pause, resume } = useRafFn(
  () => {
    const ringOpacityTarget = isPointerInside.value && isCursorEnabled.value ? 1 : 0

    // 首屏和项目卡的联动都在 raf 中渐进逼近，避免鼠标快速移动时出现生硬跳变。
    updateHeroTargets()

    cursorRing.x += (mouseX.value - cursorRing.x) * 0.22
    cursorRing.y += (mouseY.value - cursorRing.y) * 0.22
    cursorRing.opacity += (ringOpacityTarget - cursorRing.opacity) * 0.2
    cursorRing.scale += (cursorRingTarget.scale - cursorRing.scale) * 0.18

    heroOrb.x += (heroOrbTarget.x - heroOrb.x) * 0.11
    heroOrb.y += (heroOrbTarget.y - heroOrb.y) * 0.11
    heroOrb.size += (heroOrbTarget.size - heroOrb.size) * 0.1
    heroOrb.opacity += (heroOrbTarget.opacity - heroOrb.opacity) * 0.16

    const heroElement = heroRef.value
    const innerElement = heroInnerRef.value

    if (heroElement && innerElement) {
      const heroRect = heroElement.getBoundingClientRect()
      const innerRect = innerElement.getBoundingClientRect()

      heroMask.x = heroOrb.x - (innerRect.left - heroRect.left)
      heroMask.y = heroOrb.y - (innerRect.top - heroRect.top)
    }
  },
  { immediate: false }
)

watch(
  isCursorEnabled,
  (enabled) => {
    if (!enabled) {
      cursorRing.opacity = 0
      heroOrb.opacity = 0
      pause()
      return
    }

    resume()
  },
  { immediate: true }
)

watch([width, height], () => {
  if (!isHeroHovered.value) {
    heroOrbTarget.x = heroOrb.x
    heroOrbTarget.y = heroOrb.y
  }
})

onMounted(() => {
  heroOrb.x = width.value / 2
  heroOrb.y = height.value / 2
  heroOrbTarget.x = heroOrb.x
  heroOrbTarget.y = heroOrb.y

  cursorRing.x = width.value / 2
  cursorRing.y = height.value / 2
})
</script>

<template>
  <div class="home" @mouseenter="enterHomeStage" @mouseleave="leaveHomeStage">
    <div class="home__dot-grid"></div>
    <div class="home__noise"></div>

    <div v-if="isCursorEnabled" class="home__cursor-ring" :style="cursorRingStyle"></div>

    <section ref="heroRef" class="home__hero" @mouseenter="enterHeroStage" @mouseleave="leaveHeroStage">
      <div class="home__hero-orbit home__hero-orbit--large"></div>
      <div class="home__hero-orbit home__hero-orbit--small"></div>
      <div class="home__hero-line home__hero-line--left"></div>
      <div class="home__hero-line home__hero-line--right"></div>
      <div v-if="isCursorEnabled" class="home__hero-orb" :style="heroOrbStyle"></div>

      <div ref="heroInnerRef" class="home__hero-inner">
        <div class="home__hero-heading">
          <div class="home__hero-heading-copy">
            <div class="home__hero-badge" :style="heroBadgeStyle">Front-end / Interaction / Content</div>

            <h1 class="home__hero-title" :style="heroTitleStyle">
              <span>HELLO, I'M</span>
              <em>{{ siteConfig.ownerName }}</em>
            </h1>

            <p class="home__hero-subtitle" :style="heroSubtitleStyle">{{ siteConfig.ownerRole }} / {{ siteConfig.ownerLocation }}</p>
          </div>

          <div class="home__hero-heading-copy home__hero-heading-copy--mask" :style="heroHeadingMaskStyle" aria-hidden="true">
            <div class="home__hero-badge" :style="heroBadgeStyle">Front-end / Interaction / Content</div>

            <h1 class="home__hero-title" :style="heroTitleStyle">
              <span>HELLO, I'M</span>
              <em>{{ siteConfig.ownerName }}</em>
            </h1>

            <p class="home__hero-subtitle" :style="heroSubtitleStyle">{{ siteConfig.ownerRole }} / {{ siteConfig.ownerLocation }}</p>
          </div>
        </div>

        <p class="home__hero-desc" :style="heroDescStyle">{{ siteConfig.description }}，这里会先展示我当前的技能栈与项目经历，再引导进入博客内容页。</p>

        <div class="home__hero-actions">
          <router-link to="/blog" class="home__hero-action home__hero-action--solid">进入博客</router-link>
          <router-link to="/about" class="home__hero-action">了解我</router-link>
          <a href="https://github.com/zsh260439" target="_blank" rel="noreferrer" class="home__hero-action">GitHub</a>
        </div>
      </div>

      <p class="home__hero-hint">{{ heroHintText }}</p>
    </section>

    <section class="home__skills-section">
      <div class="home__section-header">
        <span class="home__section-kicker">Skill Stack</span>
        <h2>技能栈</h2>
      </div>

      <div class="home__skills-list">
        <HomeSkillCard
          v-for="group in skillGroups"
          :key="group.id"
          :group="group"
          @card-enter="focusCardCursor"
          @card-leave="resetCursor"
        />
      </div>
    </section>

    <section class="home__projects-section">
      <div class="home__projects-shell">
        <div class="home__projects-side">
          <span class="home__section-kicker">Selected Work</span>
          <h2>项目经历</h2>
        </div>

        <div class="home__projects-list">
          <HomeProjectCard
            v-for="(project, index) in projects"
            :key="project.id"
            :project="project"
            :index="index"
            :card-style="getProjectStyle(project.id)"
            @card-move="handleProjectMove(project.id, $event)"
            @card-enter="focusCardCursor"
            @card-leave="resetProjectTransform(project.id)"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  position: relative;
  overflow: hidden;
  background: #ffffff;
  color: #171512;
}

.home__dot-grid,
.home__noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.home__dot-grid {
  background-image: radial-gradient(
    circle,
    rgba(145, 145, 145, 0.7) 0 1.25px,
    rgba(145, 145, 145, 0.18) 1.25px 2.4px,
    transparent 2.5px
  );
  background-size: 54px 54px;
  background-position: 0 0;
  opacity: 1;
}

.home__noise {
  display: none;
}

.home__cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 40;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid rgba(17, 17, 17, 0.34);
  background: rgba(255, 255, 255, 0.42);
  box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  will-change: transform, opacity, width, height;
}

.home__hero,
.home__skills-section,
.home__projects-section {
  position: relative;
  z-index: 1;
}

.home__hero {
  min-height: 100vh;
  padding: calc(var(--header-height) + 4rem) 2rem 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
}

.home__hero-inner {
  position: relative;
  width: min(100%, 1120px);
  text-align: center;
  z-index: 2;
}

.home__hero-badge,
.home__section-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #777777;
}

.home__hero-badge::before,
.home__section-kicker::before {
  content: '';
  width: 28px;
  height: 1px;
  background: rgba(17, 17, 17, 0.16);
}

.home__hero-heading {
  position: relative;
}

.home__hero-heading-copy {
  position: relative;
}

.home__hero-heading-copy--mask {
  position: absolute;
  inset: 0;
  color: #ffffff;
  pointer-events: none;
}

.home__hero-heading-copy--mask .home__hero-badge,
.home__hero-heading-copy--mask .home__hero-subtitle {
  color: rgba(255, 255, 255, 0.92);
}

.home__hero-heading-copy--mask .home__hero-badge::before {
  background: rgba(255, 255, 255, 0.42);
}

.home__hero-title {
  margin: 1.1rem 0 0.9rem;
  font-size: clamp(3.8rem, 10vw, 8.4rem);
  line-height: 0.9;
  letter-spacing: -0.08em;
  transform-origin: center center;
}

.home__hero-title span {
  display: block;
  font-size: 0.6em;
  letter-spacing: 0.15em;
  font-weight: 400;
  opacity: 0.55;
}

.home__hero-title em {
  display: block;
  font-style: normal;
  font-weight: 300;
}

.home__hero-subtitle {
  margin: 0;
  font-size: clamp(1.05rem, 2vw, 1.45rem);
  color: #6f6f6f;
}

.home__hero-desc {
  width: min(100%, 44rem);
  margin: 1.2rem auto 0;
  color: #767676;
  font-size: 0.98rem;
  line-height: 1.9;
}

.home__hero-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-top: 2rem;
}

.home__hero-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(17, 17, 17, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: #1f2937;
  padding: 0.88rem 1.25rem;
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

.home__hero-action--solid,
.home__hero-action:hover {
  background: #111111;
  border-color: #111111;
  color: #ffffff;
  transform: translateY(-2px);
}

.home__hero-hint {
  position: absolute;
  left: 50%;
  bottom: 1.6rem;
  margin: 0;
  transform: translateX(-50%);
  color: rgba(120, 120, 120, 0.86);
  font-size: 0.82rem;
  animation: heroHintBounce 2.3s ease-in-out infinite;
}

@keyframes heroHintBounce {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
    opacity: 0.7;
  }

  50% {
    transform: translateX(-50%) translateY(-10px);
    opacity: 1;
  }
}

.home__hero-orbit,
.home__hero-line {
  position: absolute;
  pointer-events: none;
}

.home__hero-orb {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  background: #090909;
  box-shadow: 0 28px 66px rgba(0, 0, 0, 0.14);
  pointer-events: none;
  z-index: 1;
  will-change: transform;
}

.home__hero-orbit {
  border-radius: 50%;
  border: 1px solid rgba(17, 17, 17, 0.08);
}

.home__hero-orbit--large {
  top: 20%;
  left: 18%;
  width: 96px;
  height: 96px;
}

.home__hero-orbit--small {
  top: 18%;
  right: 22%;
  width: 46px;
  height: 46px;
}

.home__hero-line {
  height: 1px;
  background: rgba(17, 17, 17, 0.07);
}

.home__hero-line--left {
  left: 10%;
  bottom: 26%;
  width: 78px;
  transform: rotate(-12deg);
}

.home__hero-line--right {
  right: 14%;
  top: 30%;
  width: 92px;
  transform: rotate(24deg);
}

.home__skills-section,
.home__projects-section {
  padding: 4rem 2rem 6rem;
}

.home__section-header,
.home__projects-shell {
  width: min(100%, 1180px);
  margin: 0 auto;
}

.home__section-header h2,
.home__projects-side h2 {
  margin: 1rem 0 0;
  font-size: clamp(2.4rem, 6vw, 4.4rem);
  line-height: 0.98;
  letter-spacing: -0.06em;
}

.home__skills-list {
  width: min(100%, 1180px);
  margin: 2rem auto 0;
  display: grid;
  gap: 1.6rem;
}

.home__projects-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 2rem;
}

.home__projects-list {
  display: grid;
  gap: 1.6rem;
}

@media (max-width: 1023px) {
  .home__cursor-ring {
    display: none;
  }

  .home__projects-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .home__hero,
  .home__skills-section,
  .home__projects-section {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }

  .home__hero {
    min-height: auto;
    padding-top: calc(var(--header-height) + 2rem);
    padding-bottom: 3rem;
    overflow-x: hidden;
    flex-direction: column;
    align-items: center;
  }

  .home__hero-orbit,
  .home__hero-line,
  .home__hero-orb,
  .home__hero-heading-copy--mask {
    display: none;
  }

  .home__hero-inner {
    text-align: center;
  }

  .home__hero-title {
    font-size: clamp(2.4rem, 18vw, 5.4rem);
    letter-spacing: -0.04em;
  }

  .home__hero-title em {
    display: block;
    margin-top: 0.25rem;
  }

  .home__hero-desc,
  .home__hero-subtitle {
    text-align: center;
  }

  .home__hero-actions {
    justify-content: center;
  }

  .home__hero-action {
    padding: 0.55rem 0.85rem;
    font-size: 0.72rem;
    white-space: nowrap;
  }

  .home__hero-hint {
    position: static;
    margin-top: 1.8rem;
    text-align: center;
    transform: none;
    animation: heroHintMobileBounce 2.3s ease-in-out infinite;
  }

  .home__section-header,
  .home__projects-side {
    text-align: left;
  }

  .home__skills-list {
    gap: 1rem;
    margin-top: 1.4rem;
  }

  .home__skills-section,
  .home__projects-section {
    padding-top: 2.5rem;
    padding-bottom: 4rem;
  }

  @keyframes heroHintMobileBounce {
    0%,
    100% {
      transform: translateY(0);
      opacity: 0.7;
    }

    50% {
      transform: translateY(-8px);
      opacity: 1;
    }
  }
}
</style>
