<script setup lang="ts">
import { computed } from 'vue'
import { Vue3Marquee } from 'vue3-marquee'
import type { AboutTechHeroProps, AboutTechItem } from '@/types/ui'

const props = withDefaults(defineProps<AboutTechHeroProps>(), {
  eyebrow: '',
  repeat: 3,
  lanes: 4,
  paused: false,
  displayCopy: true,
})

const laneItems = computed(() => {
  return Array.from({ length: props.lanes }, (_, laneIndex) => {
    return props.items.filter((_, itemIndex) => itemIndex % props.lanes === laneIndex)
  }).filter((lane) => lane.length > 0)
})

const expandedLaneItems = computed(() => {
  return laneItems.value.map((lane) => {
    return Array.from({ length: props.repeat }, (_, repeatIndex) => {
      return lane.map((item) => ({
        ...item,
        __key: `${item.name}-${repeatIndex}`
      }))
    }).flat()
  })
})

const buildMarqueeDuration = (laneIndex: number) => {
  return laneIndex % 2 === 0 ? 36 : 42
}
</script>

<template>
  <section class="about-tech-hero" :class="{ 'about-tech-hero--background': !displayCopy }">
    <div class="about-tech-hero__ambient"></div>
    <div class="about-tech-hero__grid"></div>

    <div class="about-tech-hero__scene">
      <div class="about-tech-hero__plane">
        <div
          v-for="(lane, laneIndex) in expandedLaneItems"
          :key="`lane-${laneIndex}`"
          class="about-tech-hero__lane"
        >
          <Vue3Marquee
            vertical
            clone
            :pause="paused"
            :pause-on-hover="true"
            :direction="laneIndex % 2 === 1 ? 'reverse' : 'normal'"
            :duration="buildMarqueeDuration(laneIndex)"
            class="about-tech-hero__marquee"
          >
            <article
              v-for="item in lane"
              :key="item.__key"
              class="about-tech-card"
              :style="{ '--tech-accent': item.accent }"
            >
              <div class="about-tech-card__topline"></div>

              <div class="about-tech-card__icon-wrap">
                <img :src="item.icon" :alt="item.name" class="about-tech-card__icon" loading="lazy" />
              </div>

              <div class="about-tech-card__copy">
                <span class="about-tech-card__short">{{ item.short }}</span>
                <strong>{{ item.name }}</strong>
                <p>{{ item.description }}</p>
              </div>
            </article>
          </Vue3Marquee>
        </div>
      </div>
    </div>

    <div class="about-tech-hero__veil"></div>
    <div v-if="displayCopy" class="about-tech-hero__mist"></div>

    <div v-if="displayCopy" class="about-tech-hero__inner">
      <span v-if="eyebrow" class="about-tech-hero__eyebrow">{{ eyebrow }}</span>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>

      <div class="about-tech-hero__meta">
        <span>Vue 3 / TypeScript / Content Systems</span>
        <span>Hover scene to pause motion</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-tech-hero {
  position: relative;
  min-height: 76vh;
  height: 100%;
  overflow: hidden;
  color: #1f2937;
  background:
    radial-gradient(circle at 20% 20%, rgba(0, 119, 204, 0.08), transparent 28%),
    radial-gradient(circle at 80% 22%, rgba(0, 163, 153, 0.07), transparent 26%),
    linear-gradient(180deg, #f9fbff 0%, #eef5fb 48%, #ffffff 100%);
}

.about-tech-hero--background {
  min-height: 100%;
  background:
    radial-gradient(circle at 20% 20%, rgba(0, 119, 204, 0.09), transparent 28%),
    radial-gradient(circle at 80% 22%, rgba(0, 163, 153, 0.08), transparent 26%),
    linear-gradient(180deg, rgba(248, 251, 255, 0.96) 0%, rgba(240, 246, 251, 0.98) 48%, rgba(255, 255, 255, 0.99) 100%);
}

.about-tech-hero__ambient,
.about-tech-hero__grid,
.about-tech-hero__veil,
.about-tech-hero__mist {
  position: absolute;
  inset: 0;
}

.about-tech-hero__ambient,
.about-tech-hero__grid,
.about-tech-hero__veil,
.about-tech-hero__mist {
  pointer-events: none;
}

.about-tech-hero__ambient {
  background:
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.7), transparent 32%),
    radial-gradient(circle at 18% 72%, rgba(64, 158, 255, 0.08), transparent 24%),
    radial-gradient(circle at 78% 66%, rgba(0, 163, 153, 0.08), transparent 22%);
}

.about-tech-hero__grid {
  background-image:
    linear-gradient(rgba(17, 24, 39, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(17, 24, 39, 0.04) 1px, transparent 1px);
  background-size: 52px 52px;
  opacity: 0.58;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.8), transparent 88%);
}

.about-tech-hero__scene {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1400px;
  z-index: 1;
}

.about-tech-hero__plane {
  width: min(1500px, 150vw);
  height: 108%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 1.1rem;
  transform: translateY(2%) rotateX(28deg) rotateY(-16deg) rotateZ(10deg);
  transform-style: preserve-3d;
}

.about-tech-hero__lane {
  flex: 1 1 0;
  min-width: 180px;
  overflow: hidden;
}

.about-tech-hero__marquee {
  height: 100%;
  --gap: 1rem;
}

.about-tech-hero__marquee :deep(.vue3-marquee),
.about-tech-hero__marquee :deep(.marquee) {
  width: 100% !important;
}

.about-tech-hero__marquee :deep(.overlay),
.about-tech-hero__marquee :deep(.transparent-overlay) {
  pointer-events: none !important;
}

.about-tech-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.42) inset,
    0 14px 34px rgba(15, 23, 42, 0.08);
  padding: 1rem 0.95rem 1.05rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition:
    transform 0.28s ease,
    border-color 0.28s ease,
    background-color 0.28s ease,
    box-shadow 0.28s ease;
  pointer-events: auto;
}

.about-tech-card:hover {
  transform: translate3d(0, -8px, 26px);
  border-color: rgba(0, 119, 204, 0.18);
  background: rgba(255, 255, 255, 0.88);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.56) inset,
    0 20px 50px rgba(15, 23, 42, 0.12),
    0 0 32px color-mix(in srgb, var(--tech-accent) 20%, transparent);
}

.about-tech-card__topline {
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--tech-accent), transparent);
  opacity: 0.85;
}

.about-tech-card__icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(248, 250, 252, 0.96);
  box-shadow: 0 0 24px color-mix(in srgb, var(--tech-accent) 22%, transparent);
}

.about-tech-card__icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.about-tech-card__copy {
  margin-top: 0.9rem;
}

.about-tech-card__short {
  display: inline-flex;
  margin-bottom: 0.45rem;
  font-size: 0.66rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--tech-accent) 72%, #1f2937);
  text-shadow: 0 0 14px color-mix(in srgb, var(--tech-accent) 42%, transparent);
}

.about-tech-card strong {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #202733;
}

.about-tech-card p {
  margin: 0.42rem 0 0;
  font-size: 0.76rem;
  line-height: 1.7;
  color: rgba(75, 85, 99, 0.86);
}

.about-tech-hero--background .about-tech-card {
  background: rgba(255, 255, 255, 0.64);
  border-color: rgba(15, 23, 42, 0.06);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.52) inset,
    0 18px 40px rgba(15, 23, 42, 0.08);
}

.about-tech-hero__veil {
  background:
    radial-gradient(circle at center, transparent 30%, rgba(255, 255, 255, 0.06) 70%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(237, 244, 250, 0.48));
}

.about-tech-hero--background .about-tech-hero__veil {
  background:
    radial-gradient(circle at center, transparent 26%, rgba(255, 255, 255, 0.08) 68%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(237, 244, 250, 0.42));
}

.about-tech-hero__mist {
  inset: auto 0 0;
  height: 190px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(244, 248, 253, 0.74) 58%, #ffffff 100%);
}

.about-tech-hero__inner {
  position: relative;
  z-index: 2;
  width: min(100%, var(--content-width));
  margin: 0 auto;
  padding: calc(var(--header-height) + 4rem) 2rem 7.6rem;
  text-align: center;
}

.about-tech-hero__eyebrow {
  display: inline-block;
  margin-bottom: 0.95rem;
  font-size: 0.74rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(214, 228, 246, 0.72);
}

.about-tech-hero__inner h1 {
  margin: 0;
  font-size: clamp(2.2rem, 6vw, 4.8rem);
  font-weight: 500;
  letter-spacing: -0.05em;
  text-shadow: 0 0 28px rgba(0, 119, 204, 0.2);
}

.about-tech-hero__inner p {
  width: min(100%, 42rem);
  margin: 1rem auto 0;
  font-size: 0.98rem;
  line-height: 1.9;
  color: rgba(224, 233, 246, 0.88);
}

.about-tech-hero__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.7rem;
  margin-top: 1.25rem;
}

.about-tech-hero__meta span {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.5rem 0.85rem;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: rgba(231, 239, 250, 0.82);
}

@media (max-width: 1100px) {
  .about-tech-hero__plane {
    width: 170vw;
    transform: translateY(3%) rotateX(24deg) rotateY(-12deg) rotateZ(8deg);
  }
}

@media (max-width: 767px) {
  .about-tech-hero {
    min-height: 66vh;
  }

  .about-tech-hero__inner {
    padding: calc(var(--header-height) + 3rem) 1.25rem 6rem;
  }

  .about-tech-hero__plane {
    width: 220vw;
    gap: 0.7rem;
    transform: translateY(5%) rotateX(20deg) rotateY(-10deg) rotateZ(6deg);
  }

  .about-tech-card {
    border-radius: 14px;
    padding: 0.8rem;
  }

  .about-tech-card strong {
    font-size: 0.92rem;
  }
}
</style>
