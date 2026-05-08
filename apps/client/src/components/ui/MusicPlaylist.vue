<script setup lang="ts">
import { useMusicPlayer, type Track } from '@/composables/useMusicPlayer'

const { playlist, currentTrack, isPlaying, switchTrack, togglePlaylist } = useMusicPlayer()

const onSelect = (track: Track) => {
  switchTrack(track)
}

const isActive = (track: Track) => track.id === currentTrack.value.id
</script>

<template>
  <div class="playlist-panel">
    <div class="playlist-particles">
      <span v-for="i in 12" :key="i" class="playlist-particle" :style="{ '--i': i }" />
    </div>

    <div class="playlist-header">
      <span class="playlist-title">Playlist</span>
      <button class="playlist-close" @click="togglePlaylist">×</button>
    </div>

    <div class="playlist-list">
      <button
        v-for="(track, idx) in playlist"
        :key="track.id"
        class="playlist-item"
        :class="{ 'playlist-item--active': isActive(track) }"
        :style="{ '--delay': idx * 0.06 + 's' }"
        @click="onSelect(track)"
      >
        <span class="playlist-item__dot" :class="{ 'playlist-item__dot--playing': isActive(track) && isPlaying }" />
        <div class="playlist-item__info">
          <span class="playlist-item__title">{{ track.title }}</span>
          <span class="playlist-item__artist">{{ track.artist }}</span>
        </div>
        <span v-if="isActive(track)" class="playlist-item__badge">♪</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.playlist-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: -8px;
  width: 280px;
  max-height: 400px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.04);
  padding: 1.25rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 200;
  transform-origin: right top;
  animation: menuBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes menuBounce {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-8deg);
    filter: blur(6px);
  }
  60% {
    opacity: 1;
    transform: scale(1.04) rotate(1deg);
    filter: blur(0);
  }
  100% {
    transform: scale(1) rotate(0);
  }
}

/* ── 粒子背景 ── */
.playlist-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.playlist-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(100, 160, 193, 0.3);
  animation: particleFloat 8s ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.6s);
}

.playlist-particle:nth-child(odd) {
  width: 2px;
  height: 2px;
  background: rgba(17, 17, 17, 0.12);
}

.playlist-particle:nth-child(1) { left: 10%; top: 15%; }
.playlist-particle:nth-child(2) { left: 80%; top: 8%; }
.playlist-particle:nth-child(3) { left: 30%; top: 45%; }
.playlist-particle:nth-child(4) { left: 65%; top: 30%; }
.playlist-particle:nth-child(5) { left: 15%; top: 70%; }
.playlist-particle:nth-child(6) { left: 85%; top: 55%; }
.playlist-particle:nth-child(7) { left: 45%; top: 85%; }
.playlist-particle:nth-child(8) { left: 70%; top: 75%; }
.playlist-particle:nth-child(9) { left: 25%; top: 20%; }
.playlist-particle:nth-child(10) { left: 55%; top: 60%; }
.playlist-particle:nth-child(11) { left: 90%; top: 40%; }
.playlist-particle:nth-child(12) { left: 40%; top: 10%; }

@keyframes particleFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  25% {
    transform: translate(8px, -12px) scale(1.5);
    opacity: 0.7;
  }
  50% {
    transform: translate(-5px, 6px) scale(0.8);
    opacity: 0.4;
  }
  75% {
    transform: translate(10px, -4px) scale(1.2);
    opacity: 0.6;
  }
}

/* ── 头部 ── */
.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.playlist-title {
  font-family: var(--font-mono, monospace);
  font-size: 0.72rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-muted, #999);
}

.playlist-close {
  border: none;
  background: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--text-muted, #999);
  padding: 2px 6px;
  transition: color 0.2s ease;
}

.playlist-close:hover {
  color: var(--text-primary, #111);
}

/* ── 列表 ── */
.playlist-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  z-index: 1;
  overflow-y: auto;
  flex: 1;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  cursor: pointer;
  text-align: left;
  transition: all 0.25s ease;
  animation: itemIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--delay);
}

@keyframes itemIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.playlist-item--active {
  background: rgba(100, 160, 193, 0.08);
  box-shadow: 0 0 0 1px rgba(100, 160, 193, 0.2);
}

.playlist-item__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(17, 17, 17, 0.15);
  flex-shrink: 0;
  transition: background 0.3s ease;
}

.playlist-item--active .playlist-item__dot {
  background: var(--accent-cyan, #64a0c1);
}

.playlist-item__dot--playing {
  animation: dotPulse 1s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.6); opacity: 1; }
}

.playlist-item__info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.playlist-item__title {
  font-size: 0.78rem;
  color: var(--text-primary, #111);
  font-weight: 500;
}

.playlist-item__artist {
  font-size: 0.65rem;
  color: var(--text-muted, #999);
}

.playlist-item__badge {
  font-size: 0.8rem;
  color: var(--accent-cyan, #64a0c1);
  animation: noteFloat 1.5s ease-in-out infinite;
}

@keyframes noteFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
</style>
