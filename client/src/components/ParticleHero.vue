<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null

// 粒子配置
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

const handleExplore = () => {
  router.push('/blog')
}

const createParticle = (width: number, height: number): Particle => ({
  x: Math.random() * width,
  y: Math.random() * height,
  vx: (Math.random() - 0.5) * 0.2,
  vy: (Math.random() - 0.5) * 0.2,
  size: Math.random() * 1.5 + 0.5,
  opacity: Math.random() * 0.2 + 0.08
})

const updateParticle = (p: Particle, width: number, height: number) => {
  p.x += p.vx
  p.y += p.vy
  if (p.x < 0 || p.x > width) p.vx *= -1
  if (p.y < 0 || p.y > height) p.vy *= -1
}

const drawParticle = (ctx: CanvasRenderingContext2D, p: Particle) => {
  ctx.fillStyle = `rgba(100, 160, 193, ${p.opacity})`
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
  ctx.fill()
}

const drawConnections = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  width: number,
  height: number
) => {
  ctx.strokeStyle = 'rgba(100, 160, 193, 0.025)'
  ctx.lineWidth = 0.5

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < CONNECTION_DISTANCE) {
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.stroke()
      }
    }
  }
}

const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let width = window.innerWidth
  let height = window.innerHeight
  canvas.width = width
  canvas.height = height

  const particles: Particle[] = []
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle(width, height))
  }

  const animate = () => {
    ctx.clearRect(0, 0, width, height)
    drawConnections(ctx, particles, width, height)
    particles.forEach(p => {
      updateParticle(p, width, height)
      drawParticle(ctx, p)
    })
    animationId = requestAnimationFrame(animate)
  }

  animate()

  const handleResize = () => {
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = width
    canvas.height = height
  }

  window.addEventListener('resize', handleResize)
}

onMounted(() => {
  initCanvas()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<template>
  <div class="particle-hero">
    <!-- 背景装饰 -->
    <div class="hero-bg"></div>
    <canvas ref="canvasRef" class="hero-canvas"></canvas>
    <div class="hero-glow"></div>

    <!-- 内容 -->
    <div class="hero-content">
      <p class="hero-tagline typewriter-text">欢迎来到 Zsint 的博客作品集...</p>

      <h1 class="hero-title">
        <span class="text-cyan">C</span>o<span class="text-teal">B</span>log
      </h1>

      <p class="hero-subtitle">
        代码与故事的交汇处<br />
        <span class="text-muted">Where code meets story</span>
      </p>

      <button class="hero-cta" @click="handleExplore">
        <span>进入博客</span>
        <span class="cta-line"></span>
      </button>
    </div>

    <!-- 滚动提示 -->
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
  text-align: center;
  padding: 0 2rem;
  animation: fadeInUp 0.8s ease-out;
}

.hero-tagline {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
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
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(4rem, 12vw, 9rem);
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
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 4rem;
  font-weight: 400;
}

.hero-cta {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.hero-cta:hover {
  color: var(--accent-cyan);
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
  font-family: 'JetBrains Mono', monospace;
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
</style>
