<template>
  <section
    ref="stageRef"
    class="sgnl-stage"
    :class="{
      'sgnl-stage--transparent': transparent,
      'sgnl-stage--overlay-mask': overlayMask,
    }"
  >
    <canvas ref="canvasRef" class="sgnl-canvas"></canvas>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'

const props = withDefaults(defineProps<{
  transparent?: boolean
  overlayMask?: boolean
  seed?: number
}>(), {
  transparent: false,
  overlayMask: false,
  seed: 2026,
})

interface RenderProfile {
  numLines: number
  segmentsPerLine: number
  pixelRatio: number
  targetFps: number
}

type NavigatorWithDeviceMemory = Navigator & {
  deviceMemory?: number
}

const stageRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let linesMesh: THREE.LineSegments | null = null
let material: THREE.LineBasicMaterial | null = null
let clock: THREE.Clock | null = null
let animationId = 0
let frameInterval = 1000 / 30
let lastFrameAt = 0
let isStageVisible = true
let stageObserver: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null

function createSeededRandom(seed: number) {
  let value = seed % 2147483647
  if (value <= 0) value += 2147483646
  return () => ((value = (value * 16807) % 2147483647) - 1) / 2147483646
}

function createRenderProfile(): RenderProfile {
  const nav = navigator as NavigatorWithDeviceMemory
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4
  const lowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 6
  const smallViewport = window.innerWidth < 1280
  const lowPower = coarsePointer || reducedMotion || lowMemory || lowCpu || smallViewport

  return {
    numLines: lowPower ? 1200 : 1800,
    segmentsPerLine: lowPower ? 22 : 28,
    pixelRatio: lowPower ? 1 : Math.min(window.devicePixelRatio || 1, 1.25),
    targetFps: lowPower ? 24 : 30,
  }
}

const handleResize = () => {
  if (!stageRef.value || !camera || !renderer) return
  const width = stageRef.value.clientWidth
  const height = stageRef.value.clientHeight
  if (!width || !height) return

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height, false)
}

const handleVisibilityChange = () => {
  if (!document.hidden) {
    lastFrameAt = 0
  }
}

const animate = (timestamp = performance.now()) => {
  animationId = requestAnimationFrame(animate)
  if (!clock || !linesMesh || !material || !renderer || !scene || !camera) return
  if (document.hidden || !isStageVisible) return
  if (timestamp - lastFrameAt < frameInterval) return

  lastFrameAt = timestamp

  const elapsedTime = clock.getElapsedTime()
  linesMesh.rotation.y = elapsedTime * 0.05
  material.opacity = 0.011 + Math.sin(elapsedTime * 0.45) * 0.002
  renderer.render(scene, camera)
}

onMounted(() => {
  const canvas = canvasRef.value
  const stage = stageRef.value
  if (!canvas || !stage) return

  const profile = createRenderProfile()
  frameInterval = 1000 / profile.targetFps

  scene = new THREE.Scene()
  if (!props.transparent) {
    scene.background = new THREE.Color(0x000000)
  }

  camera = new THREE.PerspectiveCamera(45, 1, 1, 1000)
  camera.position.set(0, 0, 60)

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: props.transparent,
    powerPreference: 'high-performance',
  })
  renderer.setClearAlpha(props.transparent ? 0 : 1)
  renderer.setPixelRatio(profile.pixelRatio)
  handleResize()

  const rand = createSeededRandom(props.seed)

  const { numLines, segmentsPerLine } = profile
  const positions = new Float32Array(numLines * segmentsPerLine * 3)
  let pIndex = 0

  const height = 50
  const radiusBase = 18

  for (let i = 0; i < numLines; i++) {
    const angleOffset = rand() * Math.PI * 2
    const radiusScale = rand() * 0.5 + 0.5
    const twistStrength = rand() * 0.5 + 0.5

    for (let j = 0; j < segmentsPerLine; j++) {
      const t = j / (segmentsPerLine - 1)
      const y = (t - 0.5) * height
      const normalizedY = y / (height / 2)
      const pinch = Math.pow(Math.abs(normalizedY), 1.8) * 0.95 + 0.05
      const currentRadius = radiusBase * pinch * radiusScale
      const twist = normalizedY * 1.5 * twistStrength
      const currentAngle = angleOffset + twist

      let x = Math.cos(currentAngle) * currentRadius
      let z = Math.sin(currentAngle) * currentRadius

      const noiseScale = 0.5 * (1 - pinch)
      x += Math.sin(y * 0.5 + i * 0.1) * noiseScale
      z += Math.cos(y * 0.3 + i * 0.1) * noiseScale

      x += normalizedY * 4.0

      positions[pIndex++] = x
      positions[pIndex++] = y
      positions[pIndex++] = z
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const indices = new Uint16Array(numLines * (segmentsPerLine - 1) * 2)
  let indexPointer = 0
  for (let i = 0; i < numLines; i++) {
    for (let j = 0; j < segmentsPerLine - 1; j++) {
      const start = i * segmentsPerLine + j
      const end = i * segmentsPerLine + j + 1
      indices[indexPointer++] = start
      indices[indexPointer++] = end
    }
  }
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))

  material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.011,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  linesMesh = new THREE.LineSegments(geometry, material)
  linesMesh.rotation.z = -0.1
  linesMesh.position.x = -5
  scene.add(linesMesh)

  clock = new THREE.Clock()
  animate()

  stageObserver = new IntersectionObserver(
    (entries) => {
      isStageVisible = entries.some((entry) => entry.isIntersecting)
      if (isStageVisible) {
        lastFrameAt = 0
      }
    },
    { threshold: 0.05 }
  )
  stageObserver.observe(stage)

  resizeObserver = new ResizeObserver(() => {
    handleResize()
    lastFrameAt = 0
  })
  resizeObserver.observe(stage)

  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  stageObserver?.disconnect()
  resizeObserver?.disconnect()
  if (renderer) renderer.dispose()
  if (linesMesh) linesMesh.geometry.dispose()
  if (material) material.dispose()
})
</script>

<style scoped>
.sgnl-stage {
  position: relative;
  min-height: 100vh;
  background: #000;
  overflow: hidden;
}

.sgnl-stage--transparent {
  background: transparent;
}

.sgnl-stage--overlay-mask {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.88) 18%, rgba(0, 0, 0, 1) 48%, rgba(0, 0, 0, 0.88) 78%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.88) 18%, rgba(0, 0, 0, 1) 48%, rgba(0, 0, 0, 0.88) 78%, transparent 100%);
}

.sgnl-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
