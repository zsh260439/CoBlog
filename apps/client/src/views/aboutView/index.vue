<script setup lang="ts">
import AboutTechHero from '@/views/aboutView/components/AboutTechHero.vue'
import { aboutProfileCard, aboutTechItems, siteConfig } from '@/config/site'
</script>

<template>
  <div class="about-view">
    <section class="about-hero-stage">
      <div class="about-view__background">
        <AboutTechHero
          title=""
          description=""
          :items="aboutTechItems"
          :paused="false"
          :display-copy="false"
        />
      </div>

      <div class="about-hero-stage__content">
        <article class="about-intro-card">
          <section class="about-intro-card__section">
            <h2>关于作者</h2>
            <p>我是 {{ siteConfig.ownerName }}，一名喜欢折腾代码的普通计科学生。</p>
            <p>武汉轻工大学计算机科学与技术 24 级在读，主要兴趣和精力都投在了探索 Web 开发的方方面面。</p>
          </section>

          <section class="about-intro-card__section">
            <h2>关于博客</h2>
          <p>
            这个博客对我而言，远不止一个技术笔记本。
          </p>

          <p>
            如果你仔细看看，会发现这里除了技术分享，还有不少我的日常琐碎和内心所想，记录这些才是我最初建立这里的根本原因。
          </p>

          <p>
            我过去没有写日记的习惯，以至于许多重要的时刻和感受，都在时间的流逝中变得模糊不清。这让我觉得有些遗憾。
          </p>

          <p>
            于是，我想在这里诚实地留下一些痕迹。记录下解决问题时的思路，也记录下某个黄昏的触动；分享学到的知识，也分享那些不成熟但真实的思考。
          </p>

          <p>
            我相信，当未来的某一天回看这些文字，无论是为某个技术难点焦头烂额，还是为生活中一件小事感慨，这些记录都会让那个时刻的我，与现在的我重逢，并会心一笑。
          </p>

          <p>
            感谢你的到访。这里没什么特别，只是一个学生记录成长、思考和生活的地方。欢迎常来坐坐。
          </p>
</section>
          <section class="about-intro-card__section about-intro-card__section--meta">
            <h2>联系我</h2>

            <div class="about-intro-card__meta-row">
              <span>位置</span>
              <strong>{{ siteConfig.ownerLocation }}</strong>
            </div>

            <div class="about-intro-card__meta-row">
              <span>邮箱</span>
              <strong>{{ aboutProfileCard.email }}</strong>
            </div>

        
          </section>
        </article>

        <article class="about-profile-card">
          <div class="about-profile-card__avatar-wrap">
            <el-avatar :src="aboutProfileCard.avatar" :alt="siteConfig.ownerName" class="about-profile-card__avatar" />
          </div>

          <strong>{{ siteConfig.ownerName }}</strong>
          <p class="about-profile-card__role">{{ siteConfig.ownerRole }}</p>

          <div class="about-profile-card__info">
            <span>{{ siteConfig.ownerLocation }}</span>
            <span>{{ aboutProfileCard.email }}</span>
 
          </div>

          <div class="about-profile-card__socials">
            <span v-for="item in aboutProfileCard.socials" :key="item">{{ item }}</span>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-view {
  background: linear-gradient(180deg, #ffffff 0%, #f7f7f7 34%, #ffffff 100%);
}

.about-hero-stage {
  position: relative;
  min-height: 100vh;
}

.about-view__background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.about-hero-stage__content {
  position: sticky;
  top: 0;
  z-index: 1;
  min-height: 100vh;
  width: min(100%, 1180px);
  margin: 0 auto;
  padding: 6rem 2rem 4rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 2.8rem;
  align-items: center;
}

.about-intro-card {
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 44px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(4px);
  padding: 0;
  color: #243241;
}

.about-intro-card__section {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.65rem 1.8rem;
}

.about-intro-card__section + .about-intro-card__section {
  border-top: 1px solid rgba(31, 41, 55, 0.08);
}

.about-intro-card__section h2 {
  margin: 0;
  font-size: 1.28rem;
  font-weight: 600;
  color: #1f2937;
}

.about-intro-card__section p {
  margin: 0;
  color: #4b5563;
  line-height: 1.9;
}

.about-intro-card__section--meta {
  gap: 0.8rem;
}

.about-intro-card__meta-row {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 0.8rem;
  align-items: start;
}

.about-intro-card__meta-row span {
  color: #6b7280;
  font-size: 0.92rem;
}

.about-intro-card__meta-row strong {
  color: #1f2937;
  font-weight: 500;
}

.about-profile-card {
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 24px 50px rgba(3, 8, 16, 0.2);
  backdrop-filter: blur(18px);
  padding: 2rem 1.8rem;
  text-align: center;
  justify-self: end;
  width: min(100%, 100%);
}

.about-profile-card__avatar-wrap {
  width: 132px;
  height: 132px;
  margin: 0 auto 1.2rem;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(203, 212, 225, 0.8));
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
}

.about-profile-card__avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.about-profile-card__avatar :deep(img) {
  object-fit: cover;
}

.about-profile-card strong {
  display: block;
  font-size: 2rem;
  color: #202733;
}

.about-profile-card__role {
  margin: 0.7rem 0 0;
  color: #6b7280;
  font-size: 1rem;
}

.about-profile-card__info {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-top: 2rem;
  padding-top: 1.35rem;
  border-top: 1px solid rgba(32, 39, 51, 0.08);
  color: #6b7280;
}

.about-profile-card__socials {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1.5rem;
}

.about-profile-card__socials span {
  border: 1px solid rgba(32, 39, 51, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  padding: 0.48rem 0.78rem;
  font-size: 0.74rem;
  color: #6b7280;
}

@media (max-width: 960px) {
  .about-hero-stage__content {
    grid-template-columns: 1fr;
    align-items: end;
  }

  .about-profile-card {
    justify-self: stretch;
  }
}

@media (max-width: 767px) {
  .about-hero-stage__content {
    padding: 4.5rem 1.25rem 3rem;
  }

  .about-intro-card,
  .about-profile-card {
    border-radius: 20px;
  }
}
</style>
