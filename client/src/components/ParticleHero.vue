<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePreferredReducedMotion, useRafFn, useWindowSize } from '@vueuse/core'
import { primaryNav, siteConfig } from '@/config/site'

const router = useRouter()
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

const quickLinks = computed(() => primaryNav.filter((item) => item.path !== '/').slice(0, 3))

const handleExplore = () => {
  router.push('/blog')
}

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
        <button class="hero-cta hero-cta--primary" @click="handleExplore">
          <span>进入博客</span>
          <span class="cta-line"></span>
        </button>

        <router-link
          v-for="item in quickLinks"
          :key="item.path"
          :to="item.path"
          class="hero-link"
        >
          {{ item.label }}
        </router-link>
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
  gap: 0.9rem;
}

.hero-cta {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  font-family: var(--font-primary);
  font-size: 0.8rem;
  transition: color 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
}

.hero-cta--primary {
  padding: 0.85rem 1.25rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--text-primary);
  box-shadow: var(--shadow-soft);
}

.hero-cta:hover {
  color: var(--accent-cyan);
  transform: translateY(-2px);
}

.cta-line {
  width: 0;
  height: 1px;
  background: var(--accent-cyan);
  transition: width 0.4s ease;
}

.hero-cta:hover .cta-line {
  width: 100%;
}

.hero-link {
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.52);
  backdrop-filter: blur(12px);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: transform 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.hero-link:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 119, 204, 0.18);
  color: var(--text-primary);
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

  .hero-tagline {
    white-space: normal;
    border-right: none;
    width: auto;
    animation: fadeIn 0.8s ease-out;
  }
}
</style>
