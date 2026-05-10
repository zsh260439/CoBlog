<template>
  <div class="ink-hero-wrap" ref="wrapRef" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <canvas ref="canvasRef" class="ink-canvas"></canvas>
    <div class="ink-grain"></div>

    <h1
      ref="titleRef"
      class="ink-title"
      :style="heroTitleStyle"
    >Hello Im Zsint</h1>

    <div class="ink-meta meta-br">
      <span ref="counterRef" class="meta-counter">0.000 %</span>
    </div>

    <div class="crosshair crosshair-tl"></div>
    <div class="crosshair crosshair-tr"></div>
    <div class="crosshair crosshair-bl"></div>
    <div class="crosshair crosshair-br"></div>

    <div class="blog-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useMouse, useRafFn, useWindowSize } from '@vueuse/core'

const props = withDefaults(defineProps<{
  skipIntro?: boolean
}>(), {
  skipIntro: false,
})

const emit = defineEmits<{
  ready: []
}>()

const wrapRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const counterRef = ref<HTMLElement | null>(null)
const isHovered = ref(false)

const { x: mouseX, y: mouseY } = useMouse({ type: 'client' })
const { width, height } = useWindowSize()

const heroMotion = reactive({
  titleX: 0,
  titleY: 0,
  titleRotate: -4,
})

let gl: WebGLRenderingContext | null = null
let program: WebGLProgram | null = null
let animationId = 0
let progress = 0
let targetProgress = 0
let hasEmittedReady = false
const sequenceTimeouts: number[] = []
let lastRenderTime = 0

const heroTitleStyle = computed(() => ({
  transform: `translate(-50%, -50%) translate3d(${heroMotion.titleX}px, ${heroMotion.titleY}px, 0) rotate(${heroMotion.titleRotate}deg)`,
}))

const fragmentShaderSource = `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_progress;
  uniform vec2 u_resolution;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      p *= mat2(1.6, -1.2, 1.2, 1.6);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vec2 p = vUv;
    p.x *= u_resolution.x / u_resolution.y;
    vec2 center = vec2(0.5 * (u_resolution.x / u_resolution.y), 0.5);

    vec2 q = vec2(0.);
    q.x = fbm(p + vec2(u_time * 0.05, u_time * 0.08));
    q.y = fbm(p + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm(p + 1.0 * q + vec2(u_time * 0.1, u_time * 0.1));
    r.y = fbm(p + 1.0 * q + vec2(8.326, 2.825));

    float noiseVal = fbm(p + 3.0 * r);

    float dist = length(p - center);
    float threshold = (u_progress * 2.5) - 0.2;
    float inkMask = noiseVal + threshold - dist;
    float edge = smoothstep(-0.1, 0.1, inkMask);

    vec3 deepInk = vec3(0.02, 0.02, 0.02);
    vec3 texturedInk = vec3(0.07, 0.07, 0.07);
    vec3 finalInkColor = mix(deepInk, texturedInk, r.x);
    float grain = random(vUv * u_time) * 0.05;
    finalInkColor -= grain;

    gl_FragColor = vec4(finalInkColor, edge);
  }
`

const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 vUv;
  void main() {
    vUv = (a_position + 1.0) / 2.0;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

function compileShader(type: number, source: string): WebGLShader | null {
  if (!gl) return null
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function initWebGL() {
  if (!canvasRef.value || !wrapRef.value) return

  const canvas = canvasRef.value
  gl = canvas.getContext('webgl', { alpha: true, antialias: false })
  if (!gl) return

  const w = wrapRef.value.clientWidth
  const h = wrapRef.value.clientHeight
  canvas.width = w
  canvas.height = h
  gl.viewport(0, 0, w, h)

  const vs = compileShader(gl.VERTEX_SHADER, vertexShaderSource)
  const fs = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource)
  if (!vs || !fs) return

  program = gl.createProgram()
  if (!program) return
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  gl.useProgram(program)

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0, -1.0, 1.0, 1.0
  ]), gl.STATIC_DRAW)

  const posLoc = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(posLoc)
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
}

function render() {
  if (!gl || !program) return

  const time = performance.now() * 0.001
  const now = performance.now()
  if (!lastRenderTime) lastRenderTime = now
  const deltaMs = now - lastRenderTime
  lastRenderTime = now
  const frameIndependentLerp = 1 - Math.pow(1 - 0.05, deltaMs / (1000 / 60))
  progress += (targetProgress - progress) * frameIndependentLerp

  const timeLoc = gl.getUniformLocation(program, 'u_time')
  const progressLoc = gl.getUniformLocation(program, 'u_progress')
  const resLoc = gl.getUniformLocation(program, 'u_resolution')

  gl.uniform1f(timeLoc, time)
  gl.uniform1f(progressLoc, progress)
  gl.uniform2f(resLoc, gl.canvas.width, gl.canvas.height)

  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 6)

  syncDisplayState()

  if (!hasEmittedReady && progress >= 0.95) {
    emitReadyOnce()
  }

  animationId = requestAnimationFrame(render)
}

function syncDisplayState() {
  if (titleRef.value) {
    const titleOpacity = 0.15 + 0.85 * progress
    titleRef.value.style.color = `rgba(240,240,238,${titleOpacity})`
  }

  if (counterRef.value) {
    const percent = Math.min(100, progress * 100).toFixed(3)
    counterRef.value.innerText = `${percent} %`
  }
}

function emitReadyOnce() {
  if (hasEmittedReady) return

  hasEmittedReady = true
  emit('ready')
}

function clearSequenceTimeouts() {
  sequenceTimeouts.forEach(timeoutId => window.clearTimeout(timeoutId))
  sequenceTimeouts.length = 0
}

function completeDiffusion() {
  clearSequenceTimeouts()
  progress = 1
  targetProgress = 1
  syncDisplayState()
  emitReadyOnce()
}

function handleResize() {
  if (!wrapRef.value || !gl) return
  const w = wrapRef.value.clientWidth
  const h = wrapRef.value.clientHeight
  gl.canvas.width = w
  gl.canvas.height = h
  gl.viewport(0, 0, w, h)
}

function handleMouseEnter() {
  isHovered.value = true
}

function handleMouseLeave() {
  isHovered.value = false
}

const { pause, resume } = useRafFn(() => {
  const heroElement = wrapRef.value
  if (!heroElement) return

  const rect = heroElement.getBoundingClientRect()
  const localX = mouseX.value - rect.left
  const localY = mouseY.value - rect.top
  const ratioX = (localX - rect.width / 2) / rect.width
  const ratioY = (localY - rect.height / 2) / rect.height

  if (isHovered.value) {
    heroMotion.titleX += (ratioX * 46 - heroMotion.titleX) * 0.12
    heroMotion.titleY += (ratioY * 28 - heroMotion.titleY) * 0.12
    heroMotion.titleRotate += (-4 + ratioX * 8 - heroMotion.titleRotate) * 0.12
  } else {
    heroMotion.titleX += (0 - heroMotion.titleX) * 0.12
    heroMotion.titleY += (0 - heroMotion.titleY) * 0.12
    heroMotion.titleRotate += (-4 - heroMotion.titleRotate) * 0.12
  }
}, { immediate: false })

onMounted(() => {
  initWebGL()

  if (props.skipIntro) {
    completeDiffusion()
  } else {
    const sequence = [
      { time: 100, target: 0.1 },
      { time: 500, target: 0.15 },
      { time: 700, target: 0.45 },
      { time: 1300, target: 0.5 },
      { time: 1800, target: 0.85 },
      { time: 2500, target: 1.0 }
    ]
    sequence.forEach(step => {
      const timeoutId = window.setTimeout(() => {
        targetProgress = step.target
      }, step.time)
      sequenceTimeouts.push(timeoutId)
    })
  }

  render()
  resume()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  pause()
  lastRenderTime = 0
  clearSequenceTimeouts()
  window.removeEventListener('resize', handleResize)
  if (gl && program) {
    gl.deleteProgram(program)
  }
})
</script>

<style scoped>
.ink-hero-wrap {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  cursor: crosshair;
  background-color: #dcdcd9;
}
.ink-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.ink-grain {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  mix-blend-mode: multiply;
}
.ink-title {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0;
  padding: 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 400;
  letter-spacing: 0.05em;
  color: rgba(240, 240, 238, 0.15);
  z-index: 3;
  pointer-events: none;
  user-select: none;
  transition: color 0.15s ease;
  transform-style: preserve-3d;
  will-change: transform;
  transform-origin: center center;
}
.ink-meta {
  position: absolute;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  color: #f0f0ee;
  z-index: 4;
  pointer-events: none;
  user-select: none;
  opacity: 0;
  transition: opacity 0.6s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.meta-br { bottom: 40px; right: 40px; text-align: right; }
.crosshair {
  position: absolute;
  width: 15px;
  height: 15px;
  z-index: 4;
  pointer-events: none;
}
.crosshair-tl { top: 40px; left: 40px; border-top: 1px solid rgba(240,240,238,0.15); border-left: 1px solid rgba(240,240,238,0.15); }
.crosshair-tr { top: 40px; right: 40px; border-top: 1px solid rgba(240,240,238,0.15); border-right: 1px solid rgba(240,240,238,0.15); }
.crosshair-bl { bottom: 40px; left: 40px; border-bottom: 1px solid rgba(240,240,238,0.15); border-left: 1px solid rgba(240,240,238,0.15); }
.crosshair-br { bottom: 40px; right: 40px; border-bottom: 1px solid rgba(240,240,238,0.15); border-right: 1px solid rgba(240,240,238,0.15); }
.blog-content {
  position: absolute;
  top: 65%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
</style>
