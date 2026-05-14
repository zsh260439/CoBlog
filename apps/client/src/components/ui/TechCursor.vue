<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getTechIconUrl } from '@/utils/tech-icons'

interface TechImage {
  name: string
  src: string
  image: HTMLImageElement
}

interface Particle {
  x: number
  y: number
  alpha: number
  image: HTMLImageElement
  size: number
  update: () => void
  draw: (ctx: CanvasRenderingContext2D) => void
}

const props = withDefaults(defineProps<{
  className?: string
}>(), {
  className: '',
})

const iconSources: { name: string; src: string }[] = [
  { name: 'JavaScript', src: getTechIconUrl('javascript') },
  { name: 'TypeScript', src: getTechIconUrl('typescript') },
  { name: 'Vue', src: getTechIconUrl('vuedotjs') },
  { name: 'Nuxt', src: getTechIconUrl('nuxt') },
  { name: 'NestJS', src: getTechIconUrl('nestjs') },
  { name: 'Node.js', src: getTechIconUrl('nodedotjs') },
]

const canvasRef = ref<HTMLCanvasElement | null>(null)
const particlesRef = ref<Particle[]>([])
const techImagesRef = ref<TechImage[]>([])
let animationFrame = 0
let lastSpawnAt = 0

const shouldDisable = () => window.innerWidth < 768 || window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches

const resizeCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

const animate = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const particles = particlesRef.value
  for (let index = particles.length - 1; index >= 0; index -= 1) {
    const particle = particles[index]
    particle.update()
    particle.draw(ctx)
    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    }
  }

  animationFrame = window.requestAnimationFrame(animate)
}

const handleMove = (event: MouseEvent) => {
  if (shouldDisable()) return

  const now = performance.now()
  if (now - lastSpawnAt < 95) {
    return
  }
  lastSpawnAt = now

  const randomIcon = techImagesRef.value[Math.floor(Math.random() * techImagesRef.value.length)]
  if (!randomIcon) return

  const size = 18 + Math.random() * 10
  const particle: Particle = {
    x: event.clientX,
    y: event.clientY,
    alpha: 1,
    image: randomIcon.image,
    size,
    update() {
      this.y -= 0.35
      this.alpha -= 0.018
    },
    draw(ctx: CanvasRenderingContext2D) {
      ctx.globalAlpha = this.alpha
      ctx.drawImage(this.image, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size)
      ctx.globalAlpha = 1
    },
  }

  particlesRef.value.push(particle)
}

const loadImages = async () => {
  techImagesRef.value = await Promise.all(
    iconSources.map(({ name, src }) => new Promise<TechImage>((resolve) => {
      const image = new Image()
      image.src = src
      image.onload = () => resolve({ name, src, image })
    })),
  )
}

onMounted(async () => {
  if (shouldDisable()) return
  await loadImages()
  resizeCanvas()
  animate()
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('mousemove', handleMove)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('mousemove', handleMove)
})
</script>

<template>
  <canvas ref="canvasRef" :class="['tech-cursor-canvas', className]"></canvas>
</template>

<style scoped>
.tech-cursor-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 30;
}
</style>
