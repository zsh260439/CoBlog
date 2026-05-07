<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { onClickOutside, useEventListener } from '@vueuse/core'
import { useTaxonomies } from '@/composables/useTaxonomies'
import type { ProfileSidebarCardProps } from '@/types/ui'
import { Message } from '@element-plus/icons-vue'

const props = withDefaults(defineProps<ProfileSidebarCardProps>(), {
})

const router = useRouter()
const { categories, tags, loadTaxonomies } = useTaxonomies()
const showCategoryModal = ref(false)
const showTagModal = ref(false)
const modalRef = ref<HTMLElement | null>(null)

// 卡片顶部的统计值都从文章和分类标签数据里即时计算。
const articleCount = computed(() => props.articles.length)
const categoryItems = computed(() => categories.value)
const categoryCount = computed(() => categoryItems.value.length)
const tagItems = computed(() => tags.value)
const tagCount = computed(() => tagItems.value.length)

// 有头像地址时生成背景图样式，没有则走占位表现。
const avatarStyle = computed(() => {
  if (!props.imageUrl) {
    return undefined
  }

  return {
    backgroundImage: `url(${props.imageUrl})`
  }
})

// “文章”统计点击后直接跳到归档页，作为内容总入口。
const handleArticleClick = () => {
  router.push('/archive')
}

// 分类和标签弹窗互斥打开，避免两个浮层同时出现。
const openCategories = () => {
  showTagModal.value = false
  showCategoryModal.value = true
}

const closeCategories = () => {
  showCategoryModal.value = false
}

const openTags = () => {
  showCategoryModal.value = false
  showTagModal.value = true
}

const closeTags = () => {
  showTagModal.value = false
}

const closeModals = () => {
  closeCategories()
  closeTags()
}

// 处理跳转点击事件，根据平台跳转不同的链接。
const handleJumpClick = (platform: string) => {
  if (platform === 'github') {
    window.open('https://github.com/260439', '_blank')
  } else if (platform === 'qq') {
    window.open('mailto:2604391962@qq.com', '_blank')
  }
}

// 点击弹窗外部或按下 Escape 时统一关闭浮层。
onClickOutside(modalRef, closeModals)

useEventListener(window, 'keydown', (event) => {
  if (event.key === 'Escape') {
    closeModals()
  }
})

onMounted(() => {
  // 组件挂载后再拉取分类和标签，保证侧栏统计是最新数据。
  void loadTaxonomies()
})
</script>

<template>
  <el-card class="profile-card" shadow="never">
    <div class="profile-card__avatar" :style="avatarStyle"></div>
    <h3>{{ ownerName }}</h3>
    <p class="profile-card__role">{{ ownerRole }}</p>
    <p class="profile-card__location">{{ ownerLocation }}</p>

    <div class="profile-card__stats">
      <button class="profile-card__stat profile-card__stat--button" type="button" @click="handleArticleClick">
        <strong>{{ articleCount }}</strong>
        <span>文章</span>
      </button>

      <button class="profile-card__stat profile-card__stat--button" type="button" @click="openCategories">
        <strong>{{ categoryCount }}</strong>
        <span>分类</span>
      </button>

      <button class="profile-card__stat profile-card__stat--button" type="button" @click="openTags">
        <strong>{{ tagCount }}</strong>
        <span>标签</span>
      </button>
    </div>

    <div class="profile-card__actions">
        <span @click="handleJumpClick('github')">
          <svg class="about-jump__link-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          <p>GitHub</p>
        </span>
        <span @click="handleJumpClick('qq')">
          <el-icon style="font-size: 1rem;">
            <Message />
          </el-icon>
          <p>QQ邮箱</p>
        </span>
    </div>

    <Teleport to="body">
      <transition name="category-modal-fade">
        <div v-if="showCategoryModal" class="category-modal__overlay" @click="closeCategories">
          <div ref="modalRef" class="category-modal" @click.stop>
            <div class="category-modal__header">
              <h4>所有分类</h4>
              <button type="button" class="category-modal__close" @click="closeCategories">×</button>
            </div>

            <router-link
              v-for="item in categoryItems"
              :key="item.slug"
              :to="{ name: 'category', params: { slug: item.slug } }"
              class="category-modal__item"
              @click="closeCategories"
            >
              <span>{{ item.label }}</span>
              <span>{{ item.count }} 篇</span>
            </router-link>
          </div>
        </div>
      </transition>

      <transition name="category-modal-fade">
        <div v-if="showTagModal" class="category-modal__overlay" @click="closeTags">
          <div ref="modalRef" class="category-modal" @click.stop>
            <div class="category-modal__header">
              <h4>所有标签</h4>
              <button type="button" class="category-modal__close" @click="closeTags">×</button>
            </div>

            <router-link
              v-for="item in tagItems"
              :key="item.label"
              :to="{ name: 'tag', params: { tag: item.label } }"
              class="category-modal__item"
              @click="closeTags"
            >
              <span>#{{ item.label }}</span>
              <span>{{ item.count }} 篇</span>
            </router-link>
          </div>
        </div>
      </transition>
    </Teleport>
  </el-card>
</template>

<style scoped>
.profile-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(17, 17, 17, 0.05);
  text-align: center;
}

.profile-card :deep(.el-card__body) {
  padding: 1.15rem;
}

.profile-card__avatar {
  width: 78px;
  height: 78px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.28);
}

.profile-card h3 {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 500;
}

.profile-card__role,
.profile-card__location {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
}

.profile-card__role {
  margin: 0.45rem 0 0;
}

.profile-card__location {
  margin-top: 0.6rem;
}

.profile-card__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  margin-top: 1.1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
}

.profile-card__stat {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.profile-card__stat--button {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0.25rem 0;
}

.profile-card__stat strong {
  font-size: 0.96rem;
  font-weight: 500;
  color: var(--text-primary);
}

.profile-card__stat span {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--text-muted);
}

.profile-card__actions {
  display: flex;
  justify-content: center;
  gap: 0.55rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.profile-card__actions span {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  padding: 0 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  background: transparent;
  font-family: var(--font-mono);
  font-size: 0.66rem;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 10px;
}

:global(.category-modal__overlay) {
  position: fixed;
  inset: 0;
  z-index: 140;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(22, 28, 39, 0.56);
  backdrop-filter: blur(6px);
}

:global(.category-modal) {
  width: min(100%, 420px);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
  overflow: hidden;
}

:global(.category-modal__header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1rem 0.8rem;
  border-bottom: 1px solid var(--border-light);
}

:global(.category-modal__header h4) {
  margin: 0;
  font-size: 1.28rem;
  font-weight: 500;
  color: var(--text-primary);
}

:global(.category-modal__close) {
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
}

:global(.category-modal__item) {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.95rem 1rem;
  border-top: 1px solid var(--border-light);
  color: var(--text-secondary);
  text-decoration: none;
}

:global(.category-modal__item:hover) {
  background: #f8fafc;
  color: var(--text-primary);
}

.category-modal-fade-enter-active,
.category-modal-fade-leave-active {
  transition: opacity 0.18s ease;
}

.category-modal-fade-enter-from,
.category-modal-fade-leave-to {
  opacity: 0;
}
.about-jump__link-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}
</style>
