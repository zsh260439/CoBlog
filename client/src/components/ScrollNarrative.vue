<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { NarrativeSection } from '@/types'

interface Props {
  sections: NarrativeSection[]
}

const props = defineProps<Props>()

const activeId = ref(props.sections[0]?.id)
const sectionRefs = ref<HTMLElement[]>([])
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sectionRefs.value.findIndex(el => el === entry.target)
          if (index !== -1) {
            activeId.value = props.sections[index].id
          }
        }
      })
    },
    { threshold: 0.4 }
  )

  sectionRefs.value.forEach(el => {
    if (el) observer?.observe(el)
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="scroll-narrative">
    <!-- 左侧：滚动内容 -->
    <div class="narrative-left">
      <div
        v-for="(section, index) in sections"
        :key="section.id"
        :ref="el => { if (el) sectionRefs[index] = el as HTMLElement }"
        class="narrative-section"
        :class="{ active: activeId === section.id }"
      >
        <!-- 章节编号 -->
        <div class="section-number">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          <div class="number-line"></div>
        </div>

        <h2 class="section-title">{{ section.title }}</h2>
        <h3 class="section-subtitle">{{ section.subtitle }}</h3>
        <p class="section-content">{{ section.content }}</p>

        <div class="section-footer">
          <div class="footer-line"></div>
          <span>Continue</span>
        </div>
      </div>
    </div>

    <!-- 右侧：固定视觉面板 -->
    <div class="narrative-right">
      <div class="right-bg"></div>
      <div class="right-glow"></div>

      <div class="visual-stage">
        <TransitionGroup name="stage">
          <div
            v-for="section in sections"
            v-show="activeId === section.id"
            :key="section.id"
            class="stage-card"
          >
            <!-- 装饰点 -->
            <div class="card-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <!-- 内容 -->
            <div class="card-content">
              <span class="card-label">Chapter {{ section.id }}</span>
              <h4 class="card-title">{{ section.title }}</h4>
              <p class="card-subtitle">{{ section.subtitle }}</p>

              <!-- 几何装饰 -->
              <div class="card-decoration">
                <div class="deco-outer"></div>
                <div class="deco-inner"></div>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- 进度指示器 -->
        <div class="progress-indicator">
          <div
            v-for="section in sections"
            :key="section.id"
            class="progress-dot"
            :class="{ active: activeId === section.id }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroll-narrative {
  display: flex;
  min-height: 100vh;
}

/* 左侧 */
.narrative-left {
  width: 100%;
  padding: 6rem 4rem;
}

.narrative-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem 0;
  opacity: 0.5;
  transition: opacity 0.6s ease;
}

.narrative-section.active {
  opacity: 1;
}

.section-number {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-number span {
  font-family: var(--font-primary);
  font-size: 2.5rem;
  font-weight: 300;
  color: var(--accent-cyan);
  opacity: 0.4;
  line-height: 1;
}

.number-line {
  width: 60px;
  height: 1px;
  background: var(--border-medium);
}

.section-title {
  font-family: var(--font-primary);
  font-size: clamp(1.75rem, 4.4vw, 3rem);
  font-weight: 300;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  margin-bottom: 1.25rem;
  line-height: 1.2;
}

.section-subtitle {
  font-size: 0.94rem;
  font-weight: 400;
  color: var(--accent-cyan);
  margin-bottom: 1.5rem;
  letter-spacing: 0.02em;
}

.section-content {
  font-size: 0.98rem;
  color: var(--text-secondary);
  line-height: 1.8;
  max-width: 28rem;
  font-weight: 400;
}

.section-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
}

.footer-line {
  width: 2rem;
  height: 1px;
  background: var(--border-medium);
}

.section-footer span {
  font-size: 0.625rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* 右侧 */
.narrative-right {
  display: none;
  width: 50%;
  height: 100vh;
  position: sticky;
  top: 0;
}

@media (min-width: 768px) {
  .narrative-right {
    display: block;
  }
}

.right-bg {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.5;
}

.right-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(0, 119, 204, 0.04) 0%, transparent 70%);
  pointer-events: none;
}

.visual-stage {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stage-card {
  position: absolute;
  width: 100%;
  max-width: 20rem;
  background: #ffffff;
  border-radius: 1rem;
  padding: 2.5rem;
  border: 1px solid var(--border-medium);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.card-dots {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.card-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.card-dots span:nth-child(1) {
  background: var(--accent-cyan);
  opacity: 0.7;
}

.card-dots span:nth-child(2) {
  background: var(--accent-teal);
  opacity: 0.5;
}

.card-dots span:nth-child(3) {
  background: var(--text-muted);
  opacity: 0.4;
}

.card-content {
  text-align: left;
}

.card-label {
  font-size: 0.625rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.card-title {
  font-family: var(--font-primary);
  font-size: 1.32rem;
  font-weight: 300;
  color: var(--text-primary);
  margin: 0.75rem 0;
}

.card-subtitle {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.card-decoration {
  position: relative;
  width: 5rem;
  height: 5rem;
  margin: 2rem auto 0;
}

.deco-outer {
  position: absolute;
  inset: 0;
  border: 1px solid var(--accent-cyan);
  border-radius: 0.5rem;
  opacity: 0.3;
  transform: rotate(45deg);
}

.deco-inner {
  position: absolute;
  inset: 0.75rem;
  border: 1px solid var(--accent-teal);
  border-radius: 0.25rem;
  opacity: 0.2;
  transform: rotate(45deg);
}

/* 进度指示器 */
.progress-indicator {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-dot {
  width: 4px;
  height: 1rem;
  background: var(--border-medium);
  border-radius: 2px;
  transition: all 0.4s ease;
}

.progress-dot.active {
  height: 2rem;
  background: var(--accent-cyan);
}

/* 过渡动画 */
.stage-enter-active {
  transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.stage-leave-active {
  transition: all 0.4s ease-out;
}

.stage-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.stage-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .narrative-left {
    width: 100%;
    padding: 3rem 1.5rem;
  }

  .narrative-section {
    min-height: auto;
    padding: 3rem 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stage-enter-active,
  .stage-leave-active {
    transition: opacity 0.2s ease;
  }

  .narrative-section {
    transition: none;
  }
}
</style>
