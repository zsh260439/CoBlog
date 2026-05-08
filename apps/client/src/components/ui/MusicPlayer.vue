<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useMusicPlayer } from '@/composables/useMusicPlayer'
import MusicPlaylist from '@/components/ui/MusicPlaylist.vue'

const { isPlaying, currentTrack, heights, toggle, togglePlaylist, playlistOpen } = useMusicPlayer()

const playerRef = ref<HTMLElement | null>(null)

const bars = computed(() =>
  heights.value.map((h, i) => ({
    key: i,
    height: Math.max(4, h * 14),
  }))
)

const handleClickOutside = (e: MouseEvent) => {
  if (playlistOpen.value && playerRef.value && !playerRef.value.contains(e.target as Node)) {
    togglePlaylist()
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
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

    <span class="music-player__name" :class="{ 'music-player__name--active': isPlaying }">
      {{ currentTrack.title }}
    </span>

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
  font-size: 0.72rem;
  font-family: var(--font-mono, monospace);
  color: rgba(17, 17, 17, 0.5);
  letter-spacing: 0.05em;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  transition: color 0.3s ease;
}

.music-player__name--active {
  color: rgba(17, 17, 17, 0.85);
  animation: particleWave 2s ease-in-out infinite;
}

@keyframes particleWave {
  0%, 100% { opacity: 0.6; filter: blur(0.3px); }
  50% { opacity: 1; filter: blur(0px); }
}

.music-player__menu {
  cursor: pointer;
  border: none;
  background: none;
  padding: 4px;
  color: var(--text-muted, #999);
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
}

.music-player__menu:hover {
  color: var(--text-primary, #111);
}
</style>
