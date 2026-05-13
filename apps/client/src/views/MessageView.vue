<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {  ChatLineRound, Close, Promotion, RefreshRight } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import MessageThreadItem from '@/components/MessageThreadItem.vue'
import ProfileSidebarCard from '@/components/sidebar/ProfileSidebarCard.vue'
import SiteStatsCard from '@/components/sidebar/SiteStatsCard.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { useMessage } from '@/composables/useMessage'
import { aboutProfileCard, siteConfig } from '@/config/site'
import { useArticles } from '@/composables/useArticles'
import type { MessageFormData, MessageItem } from '@/types/message'
//个人信息要用的
const { articles, loadArticles } = useArticles()
const { messages, isLoading, error, loadMessages, submitMessage, submitLoading } = useMessage()

onMounted(() => {
  loadArticles()
  loadMessages()
})

const formRef = ref<FormInstance>()
  //要跳转到的元素位置
const composerAnchorRef = ref<HTMLElement | null>(null)
  //点击回复的那个item
const replyTarget = ref<MessageItem | null>(null)

const form = reactive<MessageFormData>({
  author: '',
  content: '',
  email: '',
  qq: '',
  enableEmailNotice: false,
})

const formRules: FormRules<MessageFormData> = {
  author: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入留言内容', trigger: 'blur' }],
}

const createCaptcha = () => {
  const left = Math.floor(Math.random() * 18) + 1
  const usePlus = Math.random() > 0.5
  const right = usePlus ? Math.floor(Math.random() * 18) + 1 : Math.floor(Math.random() * left) + 1
  return { question: `${left} ${usePlus ? '+' : '-'} ${right} = ?`, answer: usePlus ? left + right : left - right }
}
const captcha = ref(createCaptcha())
const captchaAnswer = ref('')
const refreshCaptcha = () => {
  captcha.value = createCaptcha()
  captchaAnswer.value = ''
}

const resetForm = () => {
  Object.assign(form, { author: '', content: '', email: '', qq: '', enableEmailNotice: false })
  replyTarget.value = null
  refreshCaptcha()
  //清除所有的校验提示
  formRef.value?.clearValidate()
}

const beginReply = async (item: MessageItem) => {
  //标记当前的回复目标为 item
  replyTarget.value = item
  await nextTick()
  //滚动到回复目标位置
  composerAnchorRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const cancelReply = () => {
  replyTarget.value = null
}

// 留言接口返回扁平数组，按 parentId 分桶，由 MessageThreadItem 递归渲染楼中楼。
const threadBuckets = computed(() => {
  const replyMap = new Map<string, MessageItem[]>()
  const roots: MessageItem[] = []
  const ordered = [...messages.value].sort((left, right) => +new Date(left.createdAt) - +new Date(right.createdAt))

  ordered.forEach((item) => {
    if (!item.parentId) {
      roots.push(item)
      return
    }
    //按照每个parentId分桶，将回复分桶
    const siblings = replyMap.get(item.parentId) ?? []
    //将回复添加到回复桶中
    siblings.push(item)
    //更新回复桶中的回复列表
    replyMap.set(item.parentId, siblings)
  })
  //将根留言按创建时间排序
  roots.sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))

  return {
    //根留言
    roots,
    //回复桶
    repliesByParentId: Object.fromEntries(replyMap),
  }
})

const rootMessages = computed(() => threadBuckets.value.roots)
const repliesByParentId = computed(() => threadBuckets.value.repliesByParentId)
const totalCount = computed(() => messages.value.length)
const isReplyMode = computed(() => Boolean(replyTarget.value))

const handleSubmit = async () => {
  const valid = formRef.value ? await formRef.value.validate().catch(() => false) : false
  if (!valid) return

  if (Number(captchaAnswer.value) !== captcha.value.answer) {
    refreshCaptcha()
    ElMessage.error('验证码错误')
    return
  }

  const ok = await submitMessage(form, replyTarget.value?.id || '')
  if (!ok) {
    ElMessage.error(isReplyMode.value ? '回复提交失败' : '留言提交失败')
    return
  }

  resetForm()
  ElMessage.success(isReplyMode.value ? '回复提交成功' : '留言提交成功')
}
</script>

<template>
  <div class="message-view">
    <PageHero title="留言板" description="说点什么吧" image="/images/MESSAGE.webp" />

    <section class="message-shell page-content-reveal">
      <div class="message-main">
        <div ref="composerAnchorRef" class="composer-anchor" />

        <el-card class="message-card composer-card" shadow="never">
          <template #header>
            <div class="section-title">
              <span class="section-title__icon_promotion">
                <el-icon><Promotion /></el-icon>
              </span>
              <div>
                <h3>{{ isReplyMode ? `回复 ${replyTarget?.author}` : '发表留言' }}</h3>
                <p>{{ isReplyMode ? '注意回复的言行哦，不要发布违规内容' : '留个印记吧，站长都会看。' }}</p>
              </div>
            </div>
          </template>

          <el-form ref="formRef" :model="form" :rules="formRules" class="composer-form plain-form" @submit.prevent="handleSubmit">
            <div v-if="replyTarget" class="reply-banner">
              <span>回复 @{{ replyTarget.author }}</span>
              <el-button link class="reply-banner__cancel" @click="cancelReply">
                <el-icon><Close /></el-icon>
                <span>取消</span>
              </el-button>
            </div>

            <div class="composer-grid">
              <div class="composer-field">
                <div class="composer-field__label">昵称 <span>*</span></div>
                <el-form-item prop="author">
                  <el-input v-model="form.author" clearable placeholder="输入昵称" />
                </el-form-item>
              </div>

              <div class="composer-field">
                <div class="composer-field__label">邮箱 / QQ号</div>
                <div class="composer-field__pair">
                  <el-form-item prop="email" v-if="form.enableEmailNotice">
                    <el-input v-model="form.email" clearable placeholder="邮箱" />
                  </el-form-item>
                  <el-form-item prop="qq">
                    <el-input v-model="form.qq" clearable placeholder="QQ号" />
                  </el-form-item>
                </div>
              </div>

              <div class="composer-field composer-field--full composer-field--content">
                <div class="composer-field__label">内容 <span>*</span></div>
                <el-form-item prop="content">
                  <el-input v-model="form.content" type="textarea" :rows="6" resize="none" placeholder="说点什么吧..." />
                </el-form-item>
              </div>
            </div>

            <div class="composer-captcha">
              <span class="captcha-chip">{{ captcha.question }}</span>
              <el-input v-model="captchaAnswer" class="captcha-answer" clearable placeholder="计算结果" />
              <el-button class="captcha-refresh" circle plain @click="refreshCaptcha">
                <el-icon><RefreshRight /></el-icon>
              </el-button>
            </div>

            <div class="composer-flags">
             
              <el-checkbox v-model="form.enableEmailNotice"  label="回复邮箱通知" />
            </div>

            <div class="composer-actions">
              <el-button class="composer-submit" type="primary" native-type="submit" :loading="submitLoading">
                <el-icon><Promotion /></el-icon>
                <span>{{ submitLoading ? '提交中...' : isReplyMode ? '提交回复' : '提交留言' }}</span>
              </el-button>
              <el-button v-if="isReplyMode" plain @click="cancelReply">取消</el-button>
            </div>
          </el-form>
        </el-card>

        <el-card class="message-card thread-panel" shadow="never">
          <template #header>
            <div class="section-title">
              <span class="section-title__icon">
                <el-icon><ChatLineRound /></el-icon>
              </span>
              <div>
                <h3>全部留言 <span class="section-title__count">({{ totalCount }})</span></h3>
              </div>
            </div>
          </template>

          <section v-loading="isLoading" class="message-list">
            <div v-if="error" class="message-state">
              <el-alert :title="error" type="error" :closable="false" show-icon />
            </div>

            <div v-else-if="!messages.length" class="message-state">
              <el-empty description="还没有留言，来留下第一条吧。" :image-size="88" />
            </div>

            <div v-else class="message-thread-list">
              <MessageThreadItem
                v-for="item in rootMessages"
                :key="item.id"
                :item="item"
                :owner-avatar="aboutProfileCard.avatar"
                :replies-by-parent-id="repliesByParentId"
                :active-reply-id="replyTarget?.id || ''"
                @reply="beginReply"
              />
            </div>
          </section>
        </el-card>
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
  background: linear-gradient(180deg, #f7f7f7 0%, #ffffff 34%, #ffffff 100%);
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

.composer-anchor {
  position: relative;
  top: -88px;
  height: 0;
}

.message-card {
  border-radius: 22px;
  overflow: hidden;
}

.message-card :deep(.el-card) {
  border-color: rgba(17, 17, 17, 0.08);
}

.message-card :deep(.el-card__header),
.message-card :deep(.el-card__body) {
  background: rgba(255, 255, 255, 0.96);
}

.message-card :deep(.el-card__header) {
  padding: 1.55rem 1.8rem 0;
  border-bottom: none;
}

.message-card :deep(.el-card__body) {
  padding: 1.45rem 1.8rem 1.8rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.section-title__icon_promotion {
  width: 3rem;
  height: 3rem;
  font-size: 1.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom:2rem;
  padding-left: 1rem;
   flex-shrink: 0;
}

.section-title h2 {
  margin: 0;
  color: #111111;
  font-size: 1.55rem;
  font-weight: 700;
}

.section-title p {
  margin: 0.35rem 0 0;
  color: #6b7280;
  font-size: 0.92rem;
}

.section-title__count {
  color: #64748b;
  font-size: 1rem;
  font-weight: 500;
}

.composer-form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.composer-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.reply-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  background: #f5f5f5;
  color: #6b7280;
}

.reply-banner__cancel {
  color: #111111;
}

.composer-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.composer-field {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.composer-field--full {
  grid-column: 1 / -1;
}

.composer-field__label {
  color: #6b7280;
  font-size: 0.92rem;
}

.composer-field__label span {
  color: #ef4444;
}

.composer-field__pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.composer-field :deep(.el-input__wrapper),
.composer-field :deep(.el-textarea__inner),
.captcha-answer :deep(.el-input__wrapper) {
  border-radius: 14px;
  box-shadow: 0 0 0 1px rgba(17, 17, 17, 0.08) inset;
}

.composer-field :deep(.el-input__wrapper) {
  min-height: 46px;
}

.composer-field--content :deep(.el-textarea__inner) {
  min-height: 220px;
  padding: 1rem 1.05rem;
}

.composer-captcha {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.captcha-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 156px;
  min-height: 46px;
  padding: 0 1rem;
  border-radius: 14px;
  background: #f5f5f5;
  color: #111111;
  font-size: 1rem;
  font-weight: 600;
}

.captcha-answer {
  width: min(220px, 100%);
}

.captcha-answer :deep(.el-input__wrapper) {
  min-height: 46px;
}

.captcha-refresh {
  color: #111111;
  border-color: rgba(17, 17, 17, 0.08);
}

.composer-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.composer-flags :deep(.el-checkbox) {
  margin-right: 0;
}

.composer-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.composer-submit {
  min-height: 46px;
  padding: 0 1.35rem;
  border: none;
  border-radius: 14px;
  --el-button-bg-color: #111111;
  --el-button-hover-bg-color: #222222;
  --el-button-active-bg-color: #000000;
}

.thread-panel :deep(.el-card__body) {
  padding-top: 0.9rem;
}

.message-list {
  min-height: 180px;
}

.message-state {
  padding: 0.3rem 0;
}

.message-thread-list {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.message-thread-list > * + * {
  padding-top: 1.8rem;
  border-top: 1px solid rgba(17, 17, 17, 0.08);
}

.message-list :deep(.el-loading-spinner .path) {
  stroke: #111111;
}

.message-list :deep(.el-loading-spinner .el-loading-text) {
  color: #6b7280;
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

  .message-card :deep(.el-card__header) {
    padding: 1.3rem 1.2rem 0;
  }

  .message-card :deep(.el-card__body) {
    padding: 1.2rem;
  }

  .reply-banner,
  .composer-grid,
  .composer-field__pair,
  .composer-actions {
    grid-template-columns: 1fr;
  }

  .reply-banner,
  .composer-captcha,
  .composer-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .composer-grid {
    grid-template-columns: 1fr;
  }

  .captcha-answer {
    width: 100%;
  }
}
</style>
