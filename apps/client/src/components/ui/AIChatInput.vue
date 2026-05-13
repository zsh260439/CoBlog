<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue'
import gsap from 'gsap'
const props = withDefaults(defineProps<{
  loading?: boolean
  placeholder?: string
  modelValue?: string
}>(), {
  modelValue: '',
  loading: false,
  placeholder: '输入你的问题...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [value: string]
}>()

const placeholderRef = ref<HTMLElement | null>(null)
//输入框的值是子组件的属性
const inputValue = computed({
  get:()=>props.modelValue,
  set:(value:string)=>emit('update:modelValue', value)
})
const isActive = ref(false)

const placeholders = [
  '帮我整理成 Markdown 文章',
  '优化这段文字的表达',
  '总结一下正文内容',
  '给这段代码加注释',
  '写一段技术博客开头',
]

let placeholderIndex = 0
let intervalId: ReturnType<typeof setInterval> | null = null
let tween: gsap.core.Tween | null = null

const animatePlaceholder = () => {
  if (!placeholderRef.value || isActive.value || inputValue.value) return
  const chars = placeholderRef.value.querySelectorAll('.ph-char')
  if (!chars.length) return
  gsap.fromTo(chars,
    { opacity: 0, filter: 'blur(8px)', y: 6 },
    { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.3, stagger: 0.02, ease: 'power2.out' }
  )
}

const cyclePlaceholder = () => {
  if (isActive.value || inputValue.value) return
  if (!placeholderRef.value) return
  const chars = placeholderRef.value.querySelectorAll('.ph-char')
  tween = gsap.to(chars, {
    opacity: 0, filter: 'blur(8px)', y: -6,
    duration: 0.2, stagger: 0.01, ease: 'power2.in',
    onComplete: () => {
      placeholderIndex = (placeholderIndex + 1) % placeholders.length
      requestAnimationFrame(animatePlaceholder)
    }
  })
}

const startCycle = () => {
  intervalId = setInterval(cyclePlaceholder, 3000)
}

const stopCycle = () => {
  if (intervalId) { clearInterval(intervalId); intervalId = null }
  if (tween) { tween.kill(); tween = null }
}

watch(isActive, (active) => {
  if (active) {
    stopCycle()
  } else if (!inputValue.value) {
    requestAnimationFrame(animatePlaceholder)
    startCycle()
  }
})

const handleFocus = () => { isActive.value = true }
const handleBlur = () => { if (!inputValue.value) isActive.value = false }
const handleSubmit = () => {
  if (!inputValue.value.trim()) return
  emit('submit', inputValue.value.trim())
  inputValue.value = ''
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}


onUnmounted(stopCycle)
</script>

<template>
  <div class="chat-input-wrap" :class="{ 'chat-input-wrap--active': isActive }">
    <div class="chat-input-inner">
      <div class="chat-input-field">
        <input
          v-model="inputValue"
          type="text"
          class="chat-input"
          :placeholder="''"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
        />
        <div class="chat-input-placeholder" v-if="!isActive && !inputValue">
          <span ref="placeholderRef" class="ph-text">
            <span
              v-for="(char, i) in placeholders[placeholderIndex].split('')"
              :key="`${placeholderIndex}-${i}`"
              class="ph-char"
            >{{ char === ' ' ? '\u00A0' : char }}</span>
          </span>
        </div>
      </div>

      <button class="chat-send-btn" :disabled="loading || !inputValue.trim()" @click="handleSubmit">
        <svg v-if="!loading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        <span v-else class="chat-send-loading" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-input-wrap {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 24px;
  background: #fff;
  padding: 6px;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
  overflow: hidden;
}

.chat-input-wrap--active {
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.chat-input-inner {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
}

.chat-input-field {
  flex: 1;
  position: relative;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.chat-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  padding: 8px 12px;
  color: #111;
  position: relative;
  z-index: 1;
}

.chat-input-placeholder {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 0;
}

.ph-text {
  font-size: 0.9rem;
  color: #9ca3af;
}

.ph-char {
  display: inline-block;
}

.chat-send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #111;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s ease, opacity 0.2s ease;
}

.chat-send-btn:hover:not(:disabled) {
  background: #333;
}

.chat-send-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.chat-send-loading {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
