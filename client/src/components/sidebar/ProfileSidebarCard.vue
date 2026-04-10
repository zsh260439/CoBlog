<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { onClickOutside, useEventListener } from '@vueuse/core'
import { useTaxonomies } from '@/composables/useTaxonomies'
import type { ProfileSidebarCardProps } from '@/types/ui'

const props = withDefaults(defineProps<ProfileSidebarCardProps>(), {
  actionLabels: () => ['GitHub', '邮箱', 'RSS']
})

const router = useRouter()
const { categories, tags, loadTaxonomies } = useTaxonomies()
const showCategoryModal = ref(false)
const showTagModal = ref(false)
const modalRef = ref<HTMLElement | null>(null)

const articleCount = computed(() => props.articles.length)
const categoryItems = computed(() => categories.value)
const categoryCount = computed(() => categoryItems.value.length)
const tagItems = computed(() => tags.value)
const tagCount = computed(() => tagItems.value.length)
const avatarStyle = computed(() => {
  if (!props.imageUrl) {
    return undefined
  }

  return {
    backgroundImage: `url(${props.imageUrl})`
  }
})

const handleArticleClick = () => {
  router.push('/archive')
}

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

onClickOutside(modalRef, closeModals)

useEventListener(window, 'keydown', (event) => {
  if (event.key === 'Escape') {
    closeModals()
  }
})

onMounted(() => {
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
      <span v-for="label in actionLabels" :key="label">{{ label }}</span>
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
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
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
  padding: 0.42rem 0.6rem;
  border-radius: 4px;
  border: 1px solid var(--border-light);
  background: transparent;
  font-family: var(--font-mono);
  font-size: 0.66rem;
  color: var(--text-secondary);
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
</style>
