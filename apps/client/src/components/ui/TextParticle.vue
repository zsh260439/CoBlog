<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface Particle {
  x: number
  y: number
  size: number
  baseX: number
  baseY: number
  density: number
  color: string
}

const props = withDefaults(defineProps<{
  text: string
  fontSize?: number
  fontFamily?: string
  particleSize?: number
  particleColor?: string
  particleDensity?: number
  backgroundColor?: string
  className?: string
}>(), {
  fontSize: 110,
  fontFamily: 'Inter, system-ui, sans-serif',
  particleSize: 1.7,
  particleColor: '#f3f4f6',
  particleDensity: 6,
  backgroundColor: 'transparent',
  className: '',
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const mouse = ref<{ x: number | null; y: number | null }>({ x: null, y: null })

let particles: Particle[] = []
let animationFrame = 0
let reducedMotion = false
let driftPhase = 0
let resizeTimer: ReturnType<typeof setTimeout> | null = null

const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches

const buildDensity = () => {
  const canvas = canvasRef.value
  if (!canvas) return props.particleDensity
  return canvas.offsetWidth < 640 ? props.particleDensity + 2 : props.particleDensity
}

const getCanvasContext = (canvas: HTMLCanvasElement) => {
  return canvas.getContext('2d', { willReadFrequently: true })
}

const initParticles = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = getCanvasContext(canvas)
  if (!ctx) return

  const containerWidth = canvas.offsetWidth
  const containerHeight = canvas.offsetHeight
  if (containerWidth <= 0 || containerHeight <= 0) {
    particles = []
    return
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = containerWidth * dpr
  canvas.height = containerHeight * dpr

  ctx.resetTransform()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const availableWidth = Math.max(containerWidth - 64, 120)
  let adaptiveFontSize = props.fontSize
  ctx.font = `600 ${adaptiveFontSize}px ${props.fontFamily}`

  while (adaptiveFontSize > 32 && ctx.measureText(props.text).width > availableWidth) {
    adaptiveFontSize -= 2
    ctx.font = `600 ${adaptiveFontSize}px ${props.fontFamily}`
  }

  ctx.fillStyle = '#000'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const drawCenterX = containerWidth / 2
  const drawCenterY = containerHeight / 2
  ctx.fillText(props.text, drawCenterX, drawCenterY)

  const textData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const nextParticles: Particle[] = []
  const baseDensity = buildDensity()
  const step = Math.max(1, Math.round(baseDensity * dpr))

  for (let y = 0; y < textData.height; y += step) {
    for (let x = 0; x < textData.width; x += step) {
      const index = (y * textData.width + x) * 4
      const alpha = textData.data[index + 3]
      if (alpha > 128) {
        nextParticles.push({
          x: x / dpr,
          y: y / dpr,
          size: props.particleSize,
          baseX: x / dpr,
          baseY: y / dpr,
          density: Math.random() * 24 + 1,
          color: props.particleColor,
        })
      }
    }
  }

  particles = nextParticles
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

const animate = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = getCanvasContext(canvas)
  if (!ctx) return

  const containerWidth = canvas.offsetWidth
  const containerHeight = canvas.offsetHeight
  if (containerWidth <= 0 || containerHeight <= 0) {
    animationFrame = window.requestAnimationFrame(animate)
    return
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  ctx.resetTransform()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, containerWidth, containerHeight)

  if (props.backgroundColor !== 'transparent') {
    ctx.fillStyle = props.backgroundColor
    ctx.fillRect(0, 0, containerWidth, containerHeight)
  }

  driftPhase += 0.008

  particles.forEach((particle) => {
    let moveX = (particle.baseX - particle.x) * 0.05
    let moveY = (particle.baseY - particle.y) * 0.05

    if (!reducedMotion) {
      moveX += Math.cos((particle.baseY + driftPhase * 24) * 0.02) * 0.05
      moveY += Math.sin((particle.baseX + driftPhase * 32) * 0.02) * 0.08
    }

    if (!reducedMotion && !isTouchDevice() && mouse.value.x !== null && mouse.value.y !== null) {
      const dx = mouse.value.x - particle.x
      const dy = mouse.value.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 110 && distance > 0) {
        const force = (110 - distance) / 110
        moveX += (dx / distance) * force * 2.6
        moveY += (dy / distance) * force * 2.6
      }
    }

    particle.x += moveX
    particle.y += moveY

    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    ctx.fillStyle = particle.color
    ctx.fill()
  })

  animationFrame = window.requestAnimationFrame(animate)
}

const handlePointerMove = (event: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas || reducedMotion || isTouchDevice()) return
  const rect = canvas.getBoundingClientRect()
  mouse.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

const handlePointerLeave = () => {
  mouse.value = { x: null, y: null }
}

const handleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    initParticles()
  }, 200)
}

const handleVisibilityChange = () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame)
    return
  }
  animate()
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  initParticles()
  animate()
  window.addEventListener('resize', handleResize)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  const canvas = canvasRef.value
  if (canvas) {
    canvas.addEventListener('mousemove', handlePointerMove)
    canvas.addEventListener('mouseleave', handlePointerLeave)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  if (resizeTimer) clearTimeout(resizeTimer)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('visibilitychange', handleVisibilityChange)

  const canvas = canvasRef.value
  if (canvas) {
    canvas.removeEventListener('mousemove', handlePointerMove)
    canvas.removeEventListener('mouseleave', handlePointerLeave)
  }
})
</script>

<template>
  <canvas ref="canvasRef" :class="['text-particle-canvas', className]"></canvas>
</template>

<style scoped>
.text-particle-canvas {
  width: 100%;
  height: 100%;
  display: block;
  margin: 0;
  padding: 0;
}
</style>
