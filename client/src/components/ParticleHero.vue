<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { usePreferredReducedMotion, useRafFn, useWindowSize } from '@vueuse/core'
import { siteConfig } from '@/config/site'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const context = ref<CanvasRenderingContext2D | null>(null)
const particles = ref<Particle[]>([])
const { width, height } = useWindowSize()
const preferredReducedMotion = usePreferredReducedMotion()

const PARTICLE_COUNT = 40
const CONNECTION_DISTANCE = 100

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

const heroActions = [
  {
    label: '进入博客',
    to: '/blog',
    external: false,
    icon: 'blog'
  },
  {
    label: 'GitHub',
    to: 'https://github.com/zsh260439',
    external: true,
    icon: 'github'
  },
  {
    label: 'LeetCode',
    to: 'https://leetcode.cn/u/qacter/',
    external: true,
    icon: 'code'
  }
] as const

const createParticle = (canvasWidth: number, canvasHeight: number): Particle => ({
  x: Math.random() * canvasWidth,
  y: Math.random() * canvasHeight,
  vx: (Math.random() - 0.5) * 0.2,
  vy: (Math.random() - 0.5) * 0.2,
  size: Math.random() * 1.5 + 0.5,
  opacity: Math.random() * 0.2 + 0.08
})

const updateParticle = (particle: Particle, canvasWidth: number, canvasHeight: number) => {
  particle.x += particle.vx
  particle.y += particle.vy

  if (particle.x < 0 || particle.x > canvasWidth) {
    particle.vx *= -1
  }

  if (particle.y < 0 || particle.y > canvasHeight) {
    particle.vy *= -1
  }
}

const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
  ctx.fillStyle = `rgba(100, 160, 193, ${particle.opacity})`
  ctx.beginPath()
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
  ctx.fill()
}

const drawConnections = (ctx: CanvasRenderingContext2D, items: Particle[]) => {
  ctx.strokeStyle = 'rgba(100, 160, 193, 0.025)'
  ctx.lineWidth = 0.5

  for (let index = 0; index < items.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < items.length; nextIndex += 1) {
      const dx = items[index].x - items[nextIndex].x
      const dy = items[index].y - items[nextIndex].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < CONNECTION_DISTANCE) {
        ctx.beginPath()
        ctx.moveTo(items[index].x, items[index].y)
        ctx.lineTo(items[nextIndex].x, items[nextIndex].y)
        ctx.stroke()
      }
    }
  }
}

const syncCanvas = () => {
  const canvas = canvasRef.value

  if (!canvas) {
    return
  }

  context.value = canvas.getContext('2d')
  canvas.width = width.value
  canvas.height = height.value
}

const resetParticles = () => {
  particles.value = Array.from({ length: PARTICLE_COUNT }, () => createParticle(width.value, height.value))
}

const drawScene = () => {
  const ctx = context.value

  if (!ctx) {
    return
  }

  ctx.clearRect(0, 0, width.value, height.value)
  drawConnections(ctx, particles.value)

  particles.value.forEach((particle) => {
    updateParticle(particle, width.value, height.value)
    drawParticle(ctx, particle)
  })
}

const { pause, resume } = useRafFn(() => {
  if (preferredReducedMotion.value === 'reduce') {
    return
  }

  drawScene()
}, { immediate: false })

watch([width, height], () => {
  syncCanvas()
  resetParticles()
}, { immediate: true })

watch(preferredReducedMotion, (value) => {
  if (value === 'reduce') {
    pause()
    return
  }

  resume()
}, { immediate: true })

watch(canvasRef, (canvas) => {
  if (!canvas) {
    pause()
    return
  }

  syncCanvas()
  resetParticles()
  resume()
}, { immediate: true })
</script>

<template>
  <div class="particle-hero">
    <div class="hero-bg"></div>
    <canvas ref="canvasRef" class="hero-canvas"></canvas>
    <div class="hero-glow"></div>

    <div class="hero-content">
      <p class="hero-tagline typewriter-text">欢迎来到 Zsint的主页...</p>

      <h1 class="hero-title">
        <span class="text-cyan">C</span>o<span class="text-teal">B</span>log
      </h1>

      <p class="hero-subtitle">
        {{ siteConfig.tagline }}<br />
        <span class="text-muted">Where code meets story</span>
      </p>

      <div class="hero-actions">
        <RouterLink
          v-for="item in heroActions.filter((action) => !action.external)"
          :key="item.label"
          :to="item.to"
          class="hero-action-card"
        >
          <span class="hero-action-card__icon" aria-hidden="true">
            <svg v-if="item.icon === 'blog'" viewBox="0 0 24 24" class="hero-action-card__svg">
              <path d="M7 6.5H17M7 12H17M7 17.5H13M5.5 4.5H18.5V19.5H5.5V4.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span>{{ item.label }}</span>
        </RouterLink>

        <a
          v-for="item in heroActions.filter((action) => action.external)"
          :key="item.label"
          :href="item.to"
          class="hero-action-card"
          target="_blank"
          rel="noreferrer"
        >
          <span class="hero-action-card__icon" aria-hidden="true">
            <svg v-if="item.icon === 'github'" viewBox="0 0 24 24" class="hero-action-card__svg">
              <path d="M12 3C7.03 3 3 7.03 3 12C3 15.98 5.58 19.35 9.16 20.54C9.61 20.62 9.77 20.35 9.77 20.12V18.56C7.27 19.1 6.74 17.49 6.74 17.49C6.33 16.45 5.74 16.17 5.74 16.17C4.93 15.62 5.8 15.63 5.8 15.63C6.69 15.69 7.16 16.55 7.16 16.55C7.96 17.91 9.25 17.52 9.76 17.29C9.84 16.71 10.08 16.31 10.35 16.08C8.35 15.85 6.25 15.08 6.25 11.63C6.25 10.64 6.6 9.84 7.18 9.22C7.09 8.99 6.78 8.05 7.27 6.78C7.27 6.78 8.02 6.54 9.75 7.72C10.47 7.52 11.23 7.42 12 7.42C12.77 7.42 13.53 7.52 14.25 7.72C15.98 6.54 16.73 6.78 16.73 6.78C17.22 8.05 16.91 8.99 16.82 9.22C17.4 9.84 17.75 10.64 17.75 11.63C17.75 15.09 15.64 15.84 13.64 16.07C13.99 16.37 14.3 16.95 14.3 17.85V20.12C14.3 20.35 14.46 20.63 14.91 20.54C18.49 19.35 21.07 15.98 21.07 12C21.07 7.03 17.04 3 12 3Z" fill="currentColor" />
            </svg>
            <svg v-else-if="item.icon === 'code'" viewBox="0 0 24 24" class="hero-action-card__svg">
              <path d="M8.5 8L4.5 12L8.5 16M15.5 8L19.5 12L15.5 16M13.5 5L10.5 19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span>{{ item.label }}</span>
        </a>
      </div>
    </div>

    <div class="scroll-hint">
      <span>Scroll</span>
      <div class="scroll-line"></div>
    </div>
  </div>
</template>

<style scoped>
.particle-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #ffffff, #f8f9fa);
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.8;
}

.hero-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(0, 119, 204, 0.04) 0%, transparent 70%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  width: min(100%, 52rem);
  text-align: center;
  padding: 0 2rem;
  animation: fadeInUp 0.8s ease-out;
}

.hero-tagline {
  font-family: var(--font-primary);
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  color: var(--text-muted);
  margin-bottom: 3rem;
  font-weight: 400;
  overflow: hidden;
  white-space: nowrap;
  border-right: 1px solid var(--text-muted);
  animation:
    typing 2s steps(20, end) 0.5s forwards,
    blink-caret 0.75s step-end infinite;
  width: 0;
}

@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes blink-caret {
  from, to { border-color: transparent; }
  50% { border-color: var(--text-muted); }
}

.hero-title {
  font-family: var(--font-primary);
  font-size: clamp(3.4rem, 10vw, 7.5rem);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.text-cyan { color: var(--accent-cyan); }
.text-teal { color: var(--accent-teal); }
.text-muted { color: var(--text-muted); }

.hero-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 3rem;
  font-weight: 400;
}

.hero-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.hero-action-card {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 11rem;
  justify-content: center;
  padding: 1rem 1.35rem;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
  color: var(--text-primary);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: transform 0.24s ease, border-color 0.24s ease, background 0.24s ease;
}

.hero-action-card:hover {
  transform: translateY(-2px);
  border-color: rgba(15, 23, 42, 0.16);
  background: #ffffff;
}

.hero-action-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.hero-action-card__svg {
  width: 1.2rem;
  height: 1.2rem;
}

.scroll-hint {
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  animation: fadeIn 1s ease-out 0.5s both;
}

.scroll-hint span {
  font-family: var(--font-primary);
  font-size: 0.625rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.scroll-line {
  width: 1px;
  height: 2.5rem;
  background: linear-gradient(to bottom, var(--text-muted), transparent);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .hero-canvas { display: none; }
  .hero-content, .scroll-hint { animation: none; }
}

@media (max-width: 767px) {
  .hero-content {
    padding: 0 1.25rem;
  }

  .hero-actions {
    gap: 0.8rem;
  }

  .hero-action-card {
    width: min(100%, 16rem);
    min-width: 0;
    padding: 0.95rem 1.1rem;
  }

  .hero-tagline {
    white-space: normal;
    border-right: none;
    width: auto;
    animation: fadeIn 0.8s ease-out;
  }
}
</style>
