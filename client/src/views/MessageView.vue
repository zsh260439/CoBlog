<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import ProfileSidebarCard from '@/components/sidebar/ProfileSidebarCard.vue'
import SiteStatsCard from '@/components/sidebar/SiteStatsCard.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { useGuestbook } from '@/composables/useGuestbook'
import { siteConfig } from '@/config/site'
import { useArticles } from '@/composables/useArticles'
import type { GuestbookEntry, MessageFormData } from '@/types/message'
import { formatDate } from '@/utils'

const { articles } = useArticles()

const {
  messages,
  isLoading,
  error,
  submitMessage,
  submitLoading,
} = useGuestbook()

const createDefaultForm = (): MessageFormData => ({
  author: '',
  content: '',
  email: '',
  qq: '',
  isPrivate: false,
  enableEmailNotice: true,
  useMarkdown: true,
})

const formRef = ref<FormInstance>()
const form = reactive(createDefaultForm())

const formRules: FormRules<MessageFormData> = {
  author: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入留言内容', trigger: 'blur' }],
}

const resetForm = () => {
  Object.assign(form, createDefaultForm())
  formRef.value?.clearValidate()
}

const formatMessageDate = (createdAt: string) =>
  formatDate(createdAt, 'iso').slice(0, 16).replace('T', ' ')

const messageMeta = (item: GuestbookEntry) => [item.location, item.device, item.browser].filter(Boolean)

const avatarStyle = (index: number) => ({
  backgroundImage: `url(${siteConfig.aboutHeroImage})`,
  backgroundPosition: `${20 + index * 18}% ${22 + index * 10}%`,
})

const handleSubmit = async () => {
  const valid = formRef.value ? await formRef.value.validate().catch(() => false) : false

  if (!valid) {
    return
  }

  const success = await submitMessage(form)

  if (!success) {
    ElMessage.error('留言提交失败')
    return
  }

  resetForm()
  ElMessage.success('留言提交成功')
}
</script>

<template>
  <div class="message-view">
    <PageHero title="留言板" description="说点什么吧" :image="siteConfig.aboutHeroImage" />

    <section class="message-shell page-content-reveal">
      <div class="message-main">
        <el-card class="message-card composer-card" shadow="never">
          <template #header>
            <div class="composer-card__header">
              <h2 class="composer-card__title">写留言</h2>
              <span class="composer-card__hint">留个印记，站长都会看。</span>
            </div>
          </template>

          <el-form ref="formRef" :model="form" :rules="formRules" class="composer-form" @submit.prevent="handleSubmit">
            <el-form-item prop="content">
              <el-input
                v-model="form.content"
                type="textarea"
                :rows="5"
                resize="none"
                placeholder="写点什么..."
              />
            </el-form-item>

            <div class="composer-form__row">
              <el-form-item prop="author">
                <el-input v-model="form.author" clearable placeholder="昵称 *" />
              </el-form-item>
              <el-form-item prop="email">
                <el-input v-model="form.email" clearable placeholder="邮箱" />
              </el-form-item>
              <el-form-item prop="qq">
                <el-input v-model="form.qq" clearable placeholder="QQ号" />
              </el-form-item>
            </div>

            <div class="composer-form__actions">
              <div class="composer-form__toggles">
                <el-checkbox v-model="form.isPrivate" label="悄悄话" />
                <el-checkbox v-model="form.enableEmailNotice" label="邮件提醒" />
                <el-checkbox v-model="form.useMarkdown" label="Markdown" />
              </div>

              <el-button type="primary" native-type="submit" :loading="submitLoading">
                {{ submitLoading ? '提交中...' : '留言' }}
              </el-button>
            </div>
          </el-form>

        </el-card>

        <div class="message-count">
          <el-tag effect="plain" round>共 {{ messages.length }} 条留言</el-tag>
        </div>

        <section v-loading="isLoading" class="guestbook-list">
          <el-card v-if="error" class="message-card" shadow="never">
            <el-alert :title="error" type="error" :closable="false" show-icon />
          </el-card>

          <el-card v-else-if="!messages.length" class="message-card" shadow="never">
            <el-empty description="还没有留言，来留下第一条吧。" :image-size="88" />
          </el-card>

          <template v-else>
            <el-card
              v-for="(item, index) in messages"
              :key="item.id"
              class="message-card guestbook-card"
              shadow="never"
            >
              <div class="guestbook-card__inner">
                <el-avatar class="guestbook-card__avatar" :size="52" :style="avatarStyle(index)">
                  {{ item.author.slice(0, 1).toUpperCase() }}
                </el-avatar>

                <div class="guestbook-card__body">
                  <div class="guestbook-card__header">
                    <div class="guestbook-card__meta">
                      <strong class="guestbook-card__name">{{ item.author }}</strong>

                      <div class="guestbook-card__tags">
                        <el-tag
                          v-for="meta in messageMeta(item)"
                          :key="`${item.id}-${meta}`"
                          size="small"
                          effect="plain"
                          round
                        >
                          {{ meta }}
                        </el-tag>
                      </div>
                    </div>

                    <time class="guestbook-card__time">{{ formatMessageDate(item.createdAt) }}</time>
                  </div>

                  <p class="guestbook-card__content">{{ item.content }}</p>
                </div>
              </div>
            </el-card>
          </template>
        </section>
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
  border-radius: 12px;
}

.message-card :deep(.el-card__body) {
  padding: 1.15rem;
}

.composer-card :deep(.el-card__header) {
  padding: 1.15rem 1.15rem 0;
  border-bottom: none;
}

.composer-card__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
  flex-wrap: wrap;
}

.composer-card__title {
  margin: 0;
  font-size: 1.28rem;
  font-weight: 500;
  color: var(--text-primary);
}

.composer-card__hint {
  font-size: 0.84rem;
  color: var(--text-muted);
}

.composer-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.composer-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.composer-form__row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.composer-form__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.composer-form__toggles {
  display: flex;
  gap: 0.75rem 1rem;
  flex-wrap: wrap;
}

.composer-form__toggles :deep(.el-checkbox) {
  margin-right: 0;
}

.message-count {
  display: flex;
  justify-content: flex-end;
}

.guestbook-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 160px;
}

.guestbook-card__inner {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 1rem;
}

.guestbook-card__avatar {
  background-size: cover;
  background-position: center;
  font-weight: 600;
}

.guestbook-card__body {
  min-width: 0;
}

.guestbook-card__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.guestbook-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.guestbook-card__name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.guestbook-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.guestbook-card__time {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.guestbook-card__content {
  margin: 0.75rem 0 0;
  color: var(--text-secondary);
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
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

  .guestbook-card__inner {
    grid-template-columns: 1fr;
  }

  .guestbook-card__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
