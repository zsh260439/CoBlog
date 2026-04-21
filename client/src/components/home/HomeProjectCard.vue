<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { HomeProjectCardStyle, HomeProjectItem } from '@/types/ui'

const props = defineProps<{
  project: HomeProjectItem
  index: number
  cardStyle?: HomeProjectCardStyle
}>()

const emit = defineEmits<{
  cardEnter: []
  cardLeave: []
  cardMove: [event: MouseEvent]
}>()

// 项目卡只把鼠标事件抛给父层，3D 倾斜计算仍然在首页统一处理。
const handleEnter = () => {
  emit('cardEnter')
}

const handleLeave = () => {
  emit('cardLeave')
}

const handleMove = (event: MouseEvent) => {
  emit('cardMove', event)
}
</script>

<template>
  <article class="home-project-card" :style="props.cardStyle" @mousemove="handleMove" @mouseenter="handleEnter" @mouseleave="handleLeave">
    <span class="home-project-card__index">{{ String(props.index + 1).padStart(2, '0') }}</span>

    <div class="home-project-card__content">
      <div class="home-project-card__year">{{ props.project.year }}</div>
      <h3>{{ props.project.title }}</h3>

      <div class="home-project-card__tags">
        <span v-for="tag in props.project.tags" :key="tag">{{ tag }}</span>
      </div>

      <p>{{ props.project.summary }}</p>

      <RouterLink v-if="props.project.internal" :to="props.project.href" class="home-project-card__link">打开页面</RouterLink>
      <a v-else :href="props.project.href" target="_blank" rel="noreferrer" class="home-project-card__link">查看仓库</a>
    </div>
  </article>
</template>

<style scoped>
.home-project-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(23, 21, 18, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 44px rgba(17, 17, 17, 0.06);
  backdrop-filter: blur(18px);
  transform-style: preserve-3d;
  transform-origin: center center;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}

.home-project-card:hover {
  border-color: rgba(23, 21, 18, 0.14);
  box-shadow: 0 28px 56px rgba(17, 17, 17, 0.08);
}

.home-project-card__index {
  position: absolute;
  top: 1.7rem;
  right: 1.8rem;
  font-size: clamp(3.6rem, 8vw, 5.5rem);
  font-weight: 700;
  line-height: 1;
  color: rgba(23, 21, 18, 0.05);
}

.home-project-card__content {
  padding: 2rem;
}

.home-project-card__year {
  color: #9c9c9c;
  font-size: 0.86rem;
  font-weight: 600;
}

.home-project-card__content h3 {
  margin: 0.4rem 0 0;
}

.home-project-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1rem;
  opacity: 0.34;
  transform: translateY(10px);
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.home-project-card:hover .home-project-card__tags {
  opacity: 1;
  transform: translateY(0);
}

.home-project-card__tags span {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.5rem 0.85rem;
  background: rgba(23, 21, 18, 0.05);
  color: #5d5d5d;
  font-size: 0.74rem;
  font-weight: 600;
}

.home-project-card:hover .home-project-card__tags span {
  background: #111111;
  color: #ffffff;
}

.home-project-card__content p {
  width: min(100%, 42rem);
  margin: 1rem 0 0;
  color: #767676;
}

.home-project-card__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.35rem;
  border: 1px solid rgba(23, 21, 18, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #171512;
  padding: 0.78rem 1.05rem;
  font-size: 0.76rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

.home-project-card__link:hover {
  background: #111111;
  border-color: #111111;
  color: #ffffff;
  transform: translateY(-2px);
}

@media (max-width: 767px) {
  .home-project-card__content {
    padding: 1.35rem;
  }
}
</style>
