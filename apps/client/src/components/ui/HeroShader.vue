<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'

const props = withDefaults(defineProps<{
  color?: string
  spread?: number
  speed?: number
}>(), {
  color: '#080808',
  spread: 0.5,
  speed: 2,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const heroRef = ref<HTMLElement | null>(null)

let scene: THREE.Scene
let camera: THREE.OrthographicCamera
let renderer: THREE.WebGLRenderer
let material: THREE.ShaderMaterial
let mesh: THREE.Mesh
let scrollProgress = 0
let rafId = 0

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
uniform float uProgress;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uSpread;
varying vec2 vUv;

float Hash(vec2 p) {
  vec3 p2 = vec3(p.xy, 1.0);
  return fract(sin(dot(p2, vec3(37.1, 61.7, 12.4))) * 3758.5453123);
}

float noise(in vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f *= f * (3.0 - 2.0 * f);
  return mix(
    mix(Hash(i + vec2(0.0, 0.0)), Hash(i + vec2(1.0, 0.0)), f.x),
    mix(Hash(i + vec2(0.0, 1.0)), Hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  v += noise(p * 1.0) * 0.5;
  v += noise(p * 2.0) * 0.25;
  v += noise(p * 4.0) * 0.125;
  return v;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0);
  float dissolveEdge = uv.y - uProgress * 1.2;
  float noiseValue = fbm(centeredUv * 15.0);
  float d = dissolveEdge + noiseValue * uSpread;
  float mask = smoothstep(0.0, 0.05, d);
  gl_FragColor = vec4(uColor, mask);
}
`

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 }
    : { r: 0.03, g: 0.03, b: 0.03 }
}

const init = () => {
  if (!canvasRef.value || !heroRef.value) return

  const canvas = canvasRef.value
  const hero = heroRef.value

  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
  renderer.setSize(hero.offsetWidth, hero.offsetHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const rgb = hexToRgb(props.color)
  const geometry = new THREE.PlaneGeometry(2, 2)
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uProgress: { value: 0 },
      uResolution: { value: new THREE.Vector2(hero.offsetWidth, hero.offsetHeight) },
      uColor: { value: new THREE.Vector3(rgb.r, rgb.g, rgb.b) },
      uSpread: { value: props.spread },
    },
    transparent: true,
  })

  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
}

const animate = () => {
  material.uniforms.uProgress.value = scrollProgress
  renderer.render(scene, camera)
  rafId = requestAnimationFrame(animate)
}

const onScroll = () => {
  if (!heroRef.value) return
  const heroHeight = heroRef.value.offsetHeight
  const windowHeight = window.innerHeight
  const maxScroll = heroHeight - windowHeight
  scrollProgress = Math.min((window.scrollY / maxScroll) * props.speed, 1.1)
}

const onResize = () => {
  if (!heroRef.value || !renderer || !material) return
  const w = heroRef.value.offsetWidth
  const h = heroRef.value.offsetHeight
  renderer.setSize(w, h)
  material.uniforms.uResolution.value.set(w, h)
}

onMounted(() => {
  init()
  animate()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  renderer?.dispose()
  material?.dispose()
})
</script>

<template>
  <div ref="heroRef" class="shader-hero">
    <canvas ref="canvasRef" class="shader-hero__canvas"></canvas>
    <div class="shader-hero__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.shader-hero {
  position: relative;
  width: 100%;
  min-height: 150vh;
  overflow: hidden;
}

.shader-hero__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.shader-hero__content {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
