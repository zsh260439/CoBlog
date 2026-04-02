<script setup lang="ts">
import { computed } from 'vue'
import ProfileSidebarCard from '@/components/sidebar/ProfileSidebarCard.vue'
import SiteStatsCard from '@/components/sidebar/SiteStatsCard.vue'
import { siteConfig } from '@/config/site'
import { usePosts } from '@/composables/usePosts'
import { formatDate } from '@/utils'

interface GuestbookEntry {
  id: string
  author: string
  location: string
  device: string
  browser: string
  content: string
  createdAt: string
}

const mockMessages: GuestbookEntry[] = [
  {
    id: 'message-1',
    author: 'FeiTwnd',
    location: '河南-方城',
    device: 'Android',
    browser: 'Chrome',
    content: '占楼占楼😙',
    createdAt: '2026-02-21T11:13:00.000Z'
  },
  {
    id: 'message-2',
    author: '宿傩',
    location: '河南-南阳',
    device: 'Android',
    browser: 'Chrome',
    content: '差点找不到在哪',
    createdAt: '2026-02-21T11:15:00.000Z'
  },
  {
    id: 'message-3',
    author: 'Zsint',
    location: '河南-南阳',
    device: 'Windows',
    browser: 'Edge',
    content: '这个页面后面会把真实留言接口接上，现在先把版式和视觉跑顺。',
    createdAt: '2026-02-21T11:22:00.000Z'
  },
  {
    id: 'message-4',
    author: 'Lemon',
    location: '江苏-苏州',
    device: 'iPhone',
    browser: 'Safari',
    content: '顶部大图和内容区的衔接现在顺眼多了，等评论接起来应该会更完整。',
    createdAt: '2026-02-21T11:39:00.000Z'
  }
]

const { posts } = usePosts()

const heroStyle = computed(() => ({
  backgroundImage: `linear-gradient(180deg, rgba(16, 20, 31, 0.16), rgba(16, 20, 31, 0.58)), url(${siteConfig.aboutHeroImage})`
}))

const siteStats = computed(() => {
  const { onlineUsers, todayViews, totalViews, totalVisitors } = siteConfig.siteStatsSnapshot

  return [
    { label: '在线访客', value: String(onlineUsers) },
    { label: '今日浏览', value: String(todayViews) },
    { label: '总浏览量', value: String(totalViews) },
    { label: '总访客量', value: String(totalVisitors) }
  ]
})

const totalMessages = computed(() => 24)

const avatarStyle = (index: number) => ({
  backgroundImage: `url(${siteConfig.aboutHeroImage})`,
  backgroundPosition: `${20 + index * 18}% ${22 + index * 10}%`
})
</script>

<template>
  <div class="message-view">
    <section class="message-hero">
      <div class="message-hero__media" :style="heroStyle"></div>
      <div class="message-hero__veil"></div>
      <div class="message-hero__mist"></div>

      <div class="message-hero__inner">
        <h1 class="message-hero__title">留言板</h1>
        <p class="message-hero__description">说点什么吧</p>
      </div>
    </section>

    <section class="message-shell page-content-reveal">
      <div class="message-main">
        <section class="message-card composer-card">
          <h2 class="composer-card__title">写留言</h2>

          <form class="composer-form" @submit.prevent>
            <textarea class="composer-form__textarea" placeholder="写点什么..." rows="5"></textarea>

            <div class="composer-form__row">
              <input class="composer-form__input" type="text" placeholder="昵称 *" />
              <input class="composer-form__input" type="text" placeholder="邮箱/QQ号" />
              <input class="composer-form__input" type="text" placeholder="验证码" />
            </div>

            <div class="composer-form__footer">
              <label class="composer-form__check"><input type="checkbox" /> 悄悄话</label>
              <label class="composer-form__check"><input type="checkbox" checked /> 邮件提醒</label>
              <label class="composer-form__check"><input type="checkbox" checked /> Markdown</label>
              <button class="composer-form__button" type="submit">留言</button>
            </div>
          </form>
        </section>

        <div class="message-count">共 {{ totalMessages }} 条留言</div>

        <article v-for="(item, index) in mockMessages" :key="item.id" class="message-card guestbook-card">
          <div class="guestbook-card__avatar" :style="avatarStyle(index)"></div>

          <div class="guestbook-card__body">
            <div class="guestbook-card__header">
              <div class="guestbook-card__meta">
                <strong>{{ item.author }}</strong>
                <span>{{ item.location }}</span>
                <span>{{ item.device }}</span>
                <span>{{ item.browser }}</span>
              </div>

              <time>{{ formatDate(item.createdAt, 'iso').slice(0, 16).replace('T', ' ') }}</time>
            </div>

            <p class="guestbook-card__content">{{ item.content }}</p>
          </div>
        </article>
      </div>

      <aside class="message-side">
        <ProfileSidebarCard
          :posts="posts"
          :image-style="heroStyle"
          :owner-name="siteConfig.ownerName"
          :owner-role="siteConfig.ownerRole"
          :owner-location="siteConfig.ownerLocation"
        />

        <SiteStatsCard :items="siteStats" />
      </aside>
    </section>
  </div>
</template>

<style scoped>
.message-view {
  background: linear-gradient(180deg, #eff3f9 0%, #ffffff 34%, #ffffff 100%);
}

.message-hero {
  position: relative;
  min-height: 360px;
  overflow: hidden;
  color: #ffffff;
}

.message-hero__media,
.message-hero__veil,
.message-hero__mist {
  position: absolute;
  inset: 0;
}

.message-hero__media {
  background:
    linear-gradient(135deg, rgba(57, 64, 100, 0.88), rgba(27, 43, 89, 0.48)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 32%);
  background-size: cover;
  background-position: center;
  transform: scale(1.02);
}

.message-hero__veil {
  background: linear-gradient(180deg, rgba(11, 18, 28, 0.16), rgba(11, 18, 28, 0.38));
}

.message-hero__mist {
  top: auto;
  height: 148px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.74) 60%, #ffffff 100%);
}

.message-hero__inner {
  position: relative;
  z-index: 1;
  width: min(100%, var(--content-width));
  margin: 0 auto;
  padding: calc(var(--header-height) + 3rem) 2rem 6.8rem;
  text-align: center;
}

.message-hero__title {
  margin: 0;
  font-size: clamp(2rem, 4.6vw, 2.8rem);
  font-weight: 500;
  letter-spacing: -0.04em;
}

.message-hero__description {
  margin: 0.8rem 0 0;
  font-size: 0.94rem;
  color: rgba(255, 255, 255, 0.9);
}

.message-shell {
  position: relative;
  z-index: 2;
  width: min(100%, 1120px);
  margin: -62px auto 0;
  padding: 0 2rem 5rem;
  display: grid;
  grid-template-columns: minmax(0, 1.58fr) 260px;
  gap: 1.5rem;
}

.message-main,
.message-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.composer-card,
.guestbook-card {
  padding: 1.15rem;
}

.composer-card__title {
  margin: 0 0 1rem;
  font-size: 1.28rem;
  font-weight: 500;
  color: var(--text-primary);
}

.composer-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.composer-form__textarea,
.composer-form__input {
  width: 100%;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #ffffff;
  color: var(--text-secondary);
  font: inherit;
}

.composer-form__textarea {
  min-height: 122px;
  padding: 0.95rem 1rem;
  resize: vertical;
}

.composer-form__row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
}

.composer-form__input {
  height: 40px;
  padding: 0 0.9rem;
}

.composer-form__footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.composer-form__check {
  font-size: 0.86rem;
  color: var(--text-secondary);
}

.composer-form__button {
  margin-left: auto;
  height: 36px;
  padding: 0 1.2rem;
  border: none;
  border-radius: 8px;
  background: #2d3138;
  color: #ffffff;
  font: inherit;
  cursor: pointer;
}

.message-count {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.guestbook-card {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 1rem;
}

.guestbook-card__avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}

.guestbook-card__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
}

.guestbook-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: center;
}

.guestbook-card__meta strong {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.guestbook-card__meta span,
.guestbook-card__header time {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
}

.guestbook-card__content {
  margin: 0.5rem 0 0;
  color: var(--text-secondary);
  line-height: 1.75;
}

@media (max-width: 1024px) {
  .message-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .message-hero {
    min-height: 320px;
  }

  .message-hero__inner {
    padding: calc(var(--header-height) + 2.4rem) 1.25rem 5.8rem;
  }

  .message-shell {
    padding: 0 1.25rem 4rem;
  }

  .composer-form__row {
    grid-template-columns: 1fr;
  }

  .guestbook-card {
    grid-template-columns: 1fr;
  }

  .guestbook-card__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
