<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { useMusicPlayer } from '@/composables/useMusicPlayer'
import MusicPlaylist from '@/components/ui/MusicPlaylist.vue'

const {
  isPlaying, currentTrack, currentLyricText, currentLyricIndex,
  heights, toggle, togglePlaylist, playlistOpen,
} = useMusicPlayer()

const playerRef = ref<HTMLElement | null>(null)
const lyricsRef = ref<HTMLElement | null>(null)

const bars = computed(() =>
  heights.value.map((h, i) => ({
    key: i,
    height: Math.max(4, h * 14),
  }))
)

// 当前要显示的文字：播放中有歌词就用歌词，否则用歌名
const displayText = computed(() => {
  if (isPlaying.value && currentLyricText.value) return currentLyricText.value
  return currentTrack.value.title
})

// chars 用 ref 而非 computed，这样我们可以手动控制更新时机
const chars = ref<Array<{ key: string; char: string }>>([])
let fadeOutTween: gsap.core.Tween | null = null

// 把文字拆成字符数组
const buildChars = (text: string, lyricIdx: number) =>
  text.split('').map((char, i) => ({
    key: `${lyricIdx}-${i}`,
    char: char === ' ' ? '\u00A0' : char,
  }))

// fade in：从模糊+下方移入
const animateIn = () => {
  if (!lyricsRef.value) return
  const els = lyricsRef.value.querySelectorAll('.lyric-char')
  if (!els.length) return
  gsap.fromTo(els,
    { opacity: 0, y: 6, filter: 'blur(4px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.35, stagger: 0.03, ease: 'power2.out' },
  )
}

watch(displayText, (newText) => {
  // 如果上一次 fade out 还在跑，直接杀掉
  if (fadeOutTween) { fadeOutTween.kill(); fadeOutTween = null }

  const doUpdate = () => {
    // 替换字符 → Vue 重新渲染 → fade in
    chars.value = buildChars(newText, currentLyricIndex.value)
    nextTick(animateIn)
  }

  // 当前没有字符，直接更新（首次加载）
  if (!lyricsRef.value) { doUpdate(); return }
  const els = lyricsRef.value.querySelectorAll('.lyric-char')
  if (!els.length) { doUpdate(); return }

  // fade out 旧字符（从左到右逐个消失），完成后再更新
  fadeOutTween = gsap.to(els, {
    opacity: 0, y: -4, filter: 'blur(4px)',
    duration: 0.25, stagger: 0.025, ease: 'power2.in',
    onComplete: doUpdate,
  })
})

// 初始化
chars.value = buildChars(displayText.value, currentLyricIndex.value)

const handleClickOutside = (e: MouseEvent) => {
  if (playlistOpen.value && playerRef.value && !playerRef.value.contains(e.target as Node)) {
    togglePlaylist()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  nextTick(animateIn)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  if (fadeOutTween) fadeOutTween.kill()
})
</script>

<template>
  <div ref="playerRef" class="music-player">
    <button class="music-player__waveform" @click="toggle" aria-label="播放/暂停">
      <div class="music-player__bars">
        <span
          v-for="bar in bars"
          :key="bar.key"
          class="music-player__bar"
          :style="{ height: bar.height + 'px' }"
        />
      </div>
    </button>

    <div ref="lyricsRef" class="music-player__name" :class="{ 'music-player__name--active': isPlaying }">
      <span
        v-for="c in chars"
        :key="c.key"
        class="lyric-char"
      >{{ c.char }}</span>
    </div>

    <button class="music-player__menu" @click="togglePlaylist" aria-label="播放列表">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect y="2" width="14" height="1" rx="0.5" fill="currentColor" />
        <rect y="6.5" width="10" height="1" rx="0.5" fill="currentColor" />
        <rect y="11" width="14" height="1" rx="0.5" fill="currentColor" />
      </svg>
    </button>

    <MusicPlaylist v-if="playlistOpen" />
  </div>
</template>

<style scoped>
.music-player {
  display: none;
  align-items: center;
  gap: 10px;
  position: relative;
  margin-left: 230px;
}

@media (min-width: 768px) {
  .music-player {
    display: flex;
  }
}

.music-player__waveform {
  cursor: pointer;
  border: none;
  border-radius: 50px;
  padding: 4px 9px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.music-player__bars {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 18px;
}

.music-player__bar {
  width: 1px;
  background: #111;
  border-radius: 999px;
  transition: height 0.15s cubic-bezier(0.22, 1, 0.36, 1);
}

.music-player__name {
  width: 100px;
  font-size: 0.72rem;
  font-family: var(--font-mono, monospace);
  color: rgba(17, 17, 17, 0.5);
  letter-spacing: 0.05em;
  max-width: 120px;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  position: relative;
  transition: color 0.3s ease;
}

.music-player__name--active {
  color: rgba(17, 17, 17, 0.85);
}

.lyric-char {
  display: inline-block;
  will-change: transform, opacity, filter;
}

.music-player__menu {
  cursor: pointer;
  border: none;
  background: none;
  padding: 0 1px;
  color: var(--text-muted, #999);
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
}

.music-player__menu:hover {
  color: var(--text-primary, #111);
}
</style>
