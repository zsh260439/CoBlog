<template>
  <section
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

const canvasRef = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let linesMesh: THREE.LineSegments | null = null
let material: THREE.LineBasicMaterial | null = null
let clock: THREE.Clock | null = null
let animationId = 0

function createSeededRandom(seed: number) {
  let value = seed % 2147483647
  if (value <= 0) value += 2147483646
  return () => ((value = (value * 16807) % 2147483647) - 1) / 2147483646
}

const handleResize = () => {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  if (!clock || !linesMesh || !material || !renderer || !scene || !camera) return

  const elapsedTime = clock.getElapsedTime()
  linesMesh.rotation.y = elapsedTime * 0.05
  material.opacity = 0.012 + Math.sin(elapsedTime * 0.5) * 0.003
  renderer.render(scene, camera)
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  scene = new THREE.Scene()
  if (!props.transparent) {
    scene.background = new THREE.Color(0x000000)
  }

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.set(0, 0, 60)

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: props.transparent })
  renderer.setClearAlpha(props.transparent ? 0 : 1)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const rand = createSeededRandom(props.seed)

  const numLines = 12000
  const segmentsPerLine = 80
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

  const indices: number[] = []
  for (let i = 0; i < numLines; i++) {
    for (let j = 0; j < segmentsPerLine - 1; j++) {
      const start = i * segmentsPerLine + j
      const end = i * segmentsPerLine + j + 1
      indices.push(start, end)
    }
  }
  geometry.setIndex(indices)

  material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.015,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  linesMesh = new THREE.LineSegments(geometry, material)
  linesMesh.rotation.z = -0.1
  linesMesh.position.x = -5
  scene.add(linesMesh)

  clock = new THREE.Clock()
  animate()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
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
