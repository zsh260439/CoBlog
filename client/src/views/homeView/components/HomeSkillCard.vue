<script setup lang="ts">
import type { HomeSkillGroup } from '@/types/ui'

const props = defineProps<{
  group: HomeSkillGroup
}>()

const emit = defineEmits<{
  cardEnter: []
  cardLeave: []
}>()

// 技能卡片只负责展示正反两面内容，翻转节奏交给样式层控制。
const handleEnter = () => {
  emit('cardEnter')
}

const handleLeave = () => {
  emit('cardLeave')
}
</script>

<template>
  <article class="home-skill-card" @mouseenter="handleEnter" @mouseleave="handleLeave">
    <div class="home-skill-card__inner">
      <div class="home-skill-card__face home-skill-card__face--front">
        <div class="home-skill-card__head">
          <span class="home-skill-card__badge">{{ props.group.badge }}</span>

          <div>
            <h3>{{ props.group.title }}</h3>
            <p>{{ props.group.subtitle }}</p>
          </div>
        </div>

        <div class="home-skill-card__divider"></div>

        <div class="home-skill-card__metrics">
          <div v-for="metric in props.group.metrics" :key="metric.label" class="home-skill-card__metric">
            <strong>{{ metric.value }}</strong>
            <span>{{ metric.label }}</span>
          </div>
        </div>
      </div>

      <div class="home-skill-card__face home-skill-card__face--back">
        <div class="home-skill-card__head">
          <span class="home-skill-card__badge">{{ props.group.badge }}</span>

          <div>
            <h3>{{ props.group.title }}</h3>
            <p>{{ props.group.subtitle }}</p>
          </div>
        </div>

        <div class="home-skill-card__details-scroll">
          <div v-for="detail in props.group.details" :key="detail.name" class="home-skill-card__detail-row">
            <span>{{ detail.name }}</span>
            <strong>{{ detail.level }}</strong>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.home-skill-card {
  min-height: 340px;
  perspective: 1600px;
}

.home-skill-card__inner {
  position: relative;
  width: 100%;
  min-height: 340px;
  transform-style: preserve-3d;
  transition: transform 1.35s cubic-bezier(0.2, 0.9, 0.24, 1);
}

.home-skill-card:hover .home-skill-card__inner {
  transform: rotateY(180deg);
}

.home-skill-card__face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border: 1px solid rgba(17, 17, 17, 0.08);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(16px);
  backface-visibility: hidden;
  padding: 1.8rem;
}

.home-skill-card__face--back {
  transform: rotateY(180deg);
}

.home-skill-card__head {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.home-skill-card__badge {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: #171717;
  color: #ffffff;
  font-size: 1.15rem;
  font-weight: 700;
}

.home-skill-card__head h3 {
  margin: 0;
}

.home-skill-card__head p {
  margin: 0.4rem 0 0;
  color: #767676;
}

.home-skill-card__divider {
  margin: 1.3rem 0 1.2rem;
  border-top: 1px solid rgba(17, 17, 17, 0.08);
}

.home-skill-card__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.home-skill-card__metric strong {
  display: block;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1;
}

.home-skill-card__metric span {
  display: block;
  margin-top: 0.6rem;
  color: #767676;
}

.home-skill-card__details-scroll {
  margin-top: 1.25rem;
  max-height: 230px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.home-skill-card__details-scroll::-webkit-scrollbar {
  width: 6px;
}

.home-skill-card__details-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(17, 17, 17, 0.28);
}

.home-skill-card__detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.95rem;
  border-radius: 14px;
  background: rgba(17, 17, 17, 0.04);
}

.home-skill-card__detail-row + .home-skill-card__detail-row {
  margin-top: 0.85rem;
}

.home-skill-card__detail-row span {
  color: #202733;
}

.home-skill-card__detail-row strong {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  font-size: 0.72rem;
  padding: 0.35rem 0.65rem;
}

@media (max-width: 767px) {
  .home-skill-card,
  .home-skill-card__inner {
    min-height: 380px;
  }

  .home-skill-card__face {
    padding: 1.35rem;
  }

  .home-skill-card__metrics {
    grid-template-columns: 1fr;
  }
}
</style>
