<script setup lang="ts">
import { reactive } from 'vue'
import ProfileSidebarCard from '@/components/sidebar/ProfileSidebarCard.vue'
import SiteStatsCard from '@/components/sidebar/SiteStatsCard.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { useGuestbook } from '@/composables/useGuestbook'
import { siteConfig } from '@/config/site'
import { useArticles } from '@/composables/useArticles'
import { formatDate } from '@/utils'

const { articles } = useArticles()

const {
  messages,
  isLoading,
  error,
  totalMessages,
  avatarStyle,
  submitMessage,
  submitLoading,
  submitError,
  submitSuccess,
} = useGuestbook()

const form = reactive({
  author: '',
  content: '',
  email: '',
  qq: '',
  isPrivate: false,
  enableEmailNotice: true,
  useMarkdown: true,
})

const handleSubmit = async () => {
  if (!form.author.trim()) {
    return
  }

  if (!form.content.trim()) {
    return
  }

  const success = await submitMessage(form)
 
  if (success) {
    form.author = ''
    form.content = ''
    form.email = ''
    form.qq = ''
    form.isPrivate = false
    form.enableEmailNotice = true
    form.useMarkdown = true
  }
}
</script>

<template>
  <div class="message-view">
    <PageHero title="留言板" description="说点什么吧" :image="siteConfig.aboutHeroImage" />

    <section class="message-shell page-content-reveal">
      <div class="message-main">
        <section class="message-card composer-card">
          <h2 class="composer-card__title">写留言</h2>

          <form class="composer-form" @submit.prevent="handleSubmit">
            <textarea
              v-model="form.content"
              class="composer-form__textarea"
              placeholder="写点什么..."
              rows="5"
            />

            <div class="composer-form__row">
              <input
                v-model="form.author"
                class="composer-form__input"
                type="text"
                placeholder="昵称 *"
              />
              <input
                v-model="form.email"
                class="composer-form__input"
                type="text"
                placeholder="邮箱"
              />
              <input
                v-model="form.qq"
                class="composer-form__input"
                type="text"
                placeholder="QQ号"
              />
            </div>

            <div class="composer-form__footer">
              <label class="composer-form__check">
                <input v-model="form.isPrivate" type="checkbox" />
                悄悄话
              </label>

              <label class="composer-form__check">
                <input v-model="form.enableEmailNotice" type="checkbox" />
                邮件提醒
              </label>

              <label class="composer-form__check">
                <input v-model="form.useMarkdown" type="checkbox" />
                Markdown
              </label>

              <button class="composer-form__button" type="submit" :disabled="submitLoading">
                {{ submitLoading ? '提交中...' : '留言' }}
              </button>
            </div>
          </form>

          <p v-if="submitError" class="composer-form__message composer-form__message--error">
            {{ submitError }}
          </p>

          <p v-if="submitSuccess" class="composer-form__message composer-form__message--success">
            {{ submitSuccess }}
          </p>
        </section>

        <div class="message-count">共 {{ totalMessages }} 条留言</div>

        <div v-if="isLoading" class="message-card message-card--state">
          正在加载留言...
        </div>

        <div v-else-if="error" class="message-card message-card--state">
          {{ error }}
        </div>

        <div v-else-if="!messages.length" class="message-card message-card--state">
          还没有留言，来留下第一条吧。
        </div>

        <article
          v-for="(item, index) in messages"
          v-else
          :key="item.id"
          class="message-card guestbook-card"
        >
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
          :articles="articles"
          :image-url="siteConfig.aboutHeroImage"
          :owner-name="siteConfig.ownerName"
          :owner-role="siteConfig.ownerRole"
          :owner-location="siteConfig.ownerLocation"
        />

        <SiteStatsCard />
      </aside>
    </section>
  </div>
</template>

<style scoped>
.message-view {
  background: linear-gradient(180deg, #eff3f9 0%, #ffffff 34%, #ffffff 100%);
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

.message-card--state {
  padding: 1rem 1.15rem;
  color: var(--text-secondary);
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

.composer-form__button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.composer-form__message {
  margin: 0.4rem 0 0;
  font-size: 0.86rem;
}

.composer-form__message--error {
  color: #c05656;
}

.composer-form__message--success {
  color: #2f855a;
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
