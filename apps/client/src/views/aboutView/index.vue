<script setup lang="ts">
import { onMounted } from 'vue'
import { aboutProfileCard, siteConfig } from '@/config/site'
import MarqueeText from '@/components/ui/MarqueeText.vue'
import TextParticle from '@/components/ui/TextParticle.vue'
import LineTrendChart from '@/views/admin/adminDashboardView/components/LineTrendChart.vue'
import DonutDistributionChart from '@/views/admin/adminDashboardView/components/DonutDistributionChart.vue'
import { useVisitStats } from '@/composables/useVisitStats'
import { Monitor, Notebook } from '@element-plus/icons-vue'

const { trend, cities, loadVisitStats } = useVisitStats()

const notes = [
  '武汉轻工大学计算机科学与技术 24 级在读',
  '热爱并关注 Vue / TypeScript / Web 工程化和全栈思维',
  '喜欢分享知识和经验，与他人互动和合作',
]

onMounted(() => {
  loadVisitStats()
})
</script>

<template>
  <div class="about-view">
    <section class="about-stage">
      <div class="about-stage__cloud about-stage__cloud--left"></div>
      <div class="about-stage__cloud about-stage__cloud--right"></div>

      <div class="about-stage__inner">
        <div class="about-stage__particle-wrap about-stage__particle-wrap--desktop">
          <TextParticle
            text="Welcome to Zsint Blog"
            :font-size="100"
            particle-color="#1f2937"
            :particle-size="1.5"
            :particle-density="7"
          />
        </div>

        <div class="about-stage__mobile-marquee">
          <MarqueeText
            text="Welcome to Zsint Blog"
            size="lg"
            :repeat="5"
            :duration="26"
            stroke-color="rgba(156, 163, 175, 0.45)"
            class-name="about-stage__marquee"
          />
        </div>
      </div>
    </section>

    <section class="about-flow page-content-reveal">
      <article class="about-story">
        <div class="about-story__head">
          <span class="about-story__kicker">
            <el-icon style="margin-right: 8px; font-size: 1.2rem;"><Notebook /></el-icon>
            关于博客
          </span>
          <p>
            我是 {{ siteConfig.ownerName }}，目前在 {{ siteConfig.ownerLocation }} 学习和生活，一名普通大二学生
          </p>
        </div>

        <div class="about-story__body">
          <div class="about-story__signals">
            <span v-for="item in notes" :key="item">{{ item }}</span>
          </div>

          <div class="about-story__text">
            <p>
             这个博客对我而言，远不止一个技术笔记本。
 <br>
如果你仔细看看，会发现这里除了技术分享，还有不少我的日常琐碎和内心所想，记录这些才是我最初建立这里的根本原因。
 <br>
我过去没有写日记的习惯，以至于许多重要的时刻和感受，都在时间的流逝中变得模糊不清。这让我觉得有些遗憾。
 <br>
于是，我想在这里诚实地留下一些痕迹。记录下解决问题时的思路，也记录下某个黄昏的触动；分享学到的知识，也分享那些不成熟但真实的思考。
 <br>
我相信，当未来的某一天回看这些文字，无论是为某个技术难点焦头烂额，还是为生活中一件小事感慨，这些记录都会让那个时刻的我，与现在的我重逢，并会心一笑。
 <br>
感谢你的到访。这里没什么特别，只是一个学生记录成长、思考和生活的地方。欢迎常来坐坐。
            </p>
          </div>
        </div>
      </article>

      <aside class="about-presence">
        <div class="about-presence__avatar-wrap">
          <el-avatar :src="aboutProfileCard.avatar" :alt="siteConfig.ownerName" class="about-presence__avatar" />
        </div>

        <div class="about-presence__identity">
          <strong>{{ siteConfig.ownerName }}</strong>
          <span>{{ siteConfig.ownerRole }}</span>
        </div>

        <div class="about-presence__info">
          <div>
            <span>位置</span>
            <strong>{{ siteConfig.ownerLocation }}</strong>
          </div>
          <div>
            <span>邮箱</span>
            <strong>{{ aboutProfileCard.email }}</strong>
          </div>
        </div>

        <div class="about-presence__socials">
          <span v-for="item in aboutProfileCard.socials" :key="item">{{ item }}</span>
        </div>
      </aside>

      <div class="about-jump">
        <div class="about-jump__inner">
          <span class="about-jump__label">
            <el-icon style="margin-right: 8px; font-size: 1.2rem;"><Monitor /></el-icon>
            关于这个网站
          </span>
          <div class="about-jump__body">
            <p style="margin-bottom: 30px;">
              本网站含有主页博客 Blog、管理 Admin双端，适配手机和网页版。
            </p>
            <p class="about-jump__muted">
               前端 Vue3 ／ 后端 Node.js
            </p>
            <p style="margin-top: 30px; line-height: 1.5;">
              如果你喜欢这样的风格或对部分功能感兴趣，欢迎去
              <a
                class="about-jump__link"
                href="https://github.com/zsh260439/CoBlog"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="about-jump__link-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </a>
              拿代码。
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="about-stats page-content-reveal">
      <div class="about-stats__inner">
        <span class="about-stats__kicker">Site Analytics</span>
        <h2 class="about-stats__heading">站点统计</h2>
        <div class="about-stats__grid">
          <div class="about-stats__card">
            <span class="about-stats__card-label">累计浏览趋势（近 7 天）</span>
            <LineTrendChart :items="trend" />
          </div>
          <div class="about-stats__card">
            <DonutDistributionChart :items="cities" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-view {
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 18%, rgba(255, 255, 255, 0.88), transparent 26%),
    radial-gradient(circle at 80% 16%, rgba(241, 245, 249, 0.92), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 40%, #ffffff 100%);
  color: #111827;
}

.about-stage {
  position: relative;
  overflow: hidden;
}

.about-stage__cloud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  filter: blur(32px);
  opacity: 0.56;
  animation: drift 14s ease-in-out infinite alternate;
}

.about-stage__cloud--left {
  background:
    radial-gradient(circle at 22% 28%, rgba(226, 232, 240, 0.72), transparent 24%),
    radial-gradient(circle at 30% 52%, rgba(241, 245, 249, 0.82), transparent 28%);
}

.about-stage__cloud--right {
  background:
    radial-gradient(circle at 76% 26%, rgba(226, 232, 240, 0.7), transparent 24%),
    radial-gradient(circle at 68% 56%, rgba(248, 250, 252, 0.8), transparent 30%);
  animation-duration: 18s;
}

.about-stage__inner {
  position: relative;
  z-index: 1;
  width: min(100%, 1400px);
  margin: 0 auto;
  padding: 10px 0 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.about-story__kicker {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  border-radius: 999px;
  color: #404652;
  font-size:1rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.about-stage__particle-wrap {
  width: 100%;
  min-height: 420px;
  overflow: visible;
}

.about-stage__mobile-marquee {
  display: none;
  width: 100%;
}

.about-stage__marquee {
  padding-top: 3rem;
}

.about-flow {
  width: min(100%, 1180px);
  margin: -1.4rem auto 0;
  padding: 0 2rem 5rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 2rem;
  align-items: start;
}

.about-story {
  padding: 1rem 0 0;
}

.about-story__head h2 {
  margin: 1rem 0 0;
  font-size: clamp(1.9rem, 3vw, 2.8rem);
  color: #111827;
}

.about-story__head p,
.about-story__text p,
.about-story__signals {
  color: #2e3136;
  line-height: 1.95;
}

.about-story__head p {
  margin: 0.5rem 0 0;
}

.about-story__body {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 2rem;
}

.about-story__signals {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.about-story__signals span {
  display: block;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  background: rgb(255, 254, 254);
}

.about-story__text {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.about-story__text p {
  margin: 0;
  padding: 1rem 1.2rem;
  border-radius: 28px 20px 28px 18px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.05);
}

.about-presence {
  position: relative;
  padding: 2rem 1.4rem;
  transform: translateY(2rem);
}

.about-presence__avatar-wrap {
  width: 128px;
  height: 128px;
  margin: 0 auto 1.2rem;
  padding: 4px;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffffff, #e5e7eb);
}

.about-presence__avatar {
  width: 100%;
  height: 100%;
}

.about-presence__avatar :deep(img) {
  object-fit: cover;
}

.about-presence__identity {
  text-align: center;
}

.about-presence__identity strong {
  display: block;
  font-size: 1.85rem;
  color: #111827;
}

.about-presence__identity span {
  display: block;
  margin-top: 0.55rem;
  color: #6b7280;
}

.about-presence__info {
  margin-top: 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.about-presence__info div {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.9rem 1rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
}

.about-presence__info span {
  font-size: 0.82rem;
  color: #9ca3af;
}

.about-presence__info strong {
  color: #111827;
}

.about-presence__socials {
  margin-top: 1.2rem;
  display: flex;
  margin-left: 50px;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.about-presence__socials span {
  padding: 0.42rem 0.74rem;
  border-radius: 999px;
  background: rgba(226, 232, 240, 0.72);
  color: #4b5563;
  font-size: 0.75rem;
}

@keyframes drift {
  from {
    transform: translate3d(-2%, -1%, 0);
  }
  to {
    transform: translate3d(2%, 1.5%, 0);
  }
}

@media (max-width: 1024px) {
  .about-flow,
  .about-story__body {
    grid-template-columns: 1fr;
  }

  .about-presence {
    transform: none;
  }

  .about-stage__particle-wrap {
    min-height: 300px;
  }
}

@media (max-width: 767px) {
  .about-stage {
    min-height: 38vh;
    margin-top: 100px;
  }

  .about-stage__inner {
    padding: 4px 0 0.25rem;
  }

  .about-stage__particle-wrap--desktop {
    display: none;
  }

  .about-stage__mobile-marquee {
    display: block;
  }

  .about-flow {
    padding: 0 1.25rem 4rem;
  }

  .about-stage__marquee {
    padding-top: 1rem;
  }
}

.about-jump {
  margin-top: 1.5rem;
  padding: 1.4rem 1.6rem 1.6rem;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03));
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
}

.about-jump__inner {
  width: min(100%, 580px);
}

.about-jump__label {
  display: inline-block;
  margin-bottom: 0.65rem;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #000000;
}

.about-jump__body p {
  margin: 0.75rem 0 0;
  color: rgba(0, 0, 0, 0.82);
  line-height: 1.8;
  font-size: 1rem;
}

.about-jump__body p:first-child {
  margin-top: 0;
}

.about-jump__muted {
  color: #9ca3af !important;
  font-size: 0.9rem !important;
  font-weight: 500;
  letter-spacing: 0.09em;
}

.about-jump__link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.2s;
}

.about-jump__link:hover {
  color: #1f2937;
}

.about-jump__link-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.about-stats {
  padding: 0 2rem 5rem;
}

.about-stats__inner {
  width: min(100%, 1180px);
  margin: 0 auto;
}

.about-stats__kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #6b7280;
}

.about-stats__kicker::before {
  content: '';
  width: 28px;
  height: 1px;
  background: rgba(17, 17, 17, 0.16);
}

.about-stats__heading {
  margin: 0.4rem 0 0;
  font-size: clamp(1.6rem, 2.8vw, 2.4rem);
  color: #111827;
}

.about-stats__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1.8rem;
}

.about-stats__card {
  border-radius: 20px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 10px 28px rgba(17, 17, 17, 0.04);
  border: 1px solid rgba(226, 232, 240, 0.64);
}

.about-stats__card-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #4b5563;
  letter-spacing: 0.02em;
}

@media (max-width: 900px) {
  .about-stats__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .about-stats {
    padding: 0 1.25rem 4rem;
  }
}
</style>
