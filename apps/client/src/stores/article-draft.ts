import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ArticleDraftState } from '@/types/admin'
const ARTICLE_DRAFT_STORAGE_KEY = 'admin:article-draft'

function loadArticleDraft(storageKey = ARTICLE_DRAFT_STORAGE_KEY) {
  const raw = sessionStorage.getItem(storageKey)
  return raw ? JSON.parse(raw) as ArticleDraftState : null
}

export const useArticleDraftStore = defineStore('article-draft', () => {
  // 默认槽位（新建文章）保留响应式状态；编辑模式按 key 分槽，直接读写 sessionStorage
  const articleDraft = ref<ArticleDraftState | null>(loadArticleDraft())

  const resolveKey = (key?: string) => key ? `${ARTICLE_DRAFT_STORAGE_KEY}:${key}` : ARTICLE_DRAFT_STORAGE_KEY

  const saveArticleDraft = (draft: ArticleDraftState, key?: string) => {
    const payload: ArticleDraftState = { ...draft, tags: [...draft.tags] }
    if (!key) {
      articleDraft.value = payload
    }
    sessionStorage.setItem(resolveKey(key), JSON.stringify(payload))
  }

  const getArticleDraft = (key?: string) => {
    if (!key) return articleDraft.value
    return loadArticleDraft(resolveKey(key))
  }

  const clearArticleDraft = (key?: string) => {
    if (!key) {
      articleDraft.value = null
    }
    sessionStorage.removeItem(resolveKey(key))
  }

  return {
    articleDraft,
    saveArticleDraft,
    getArticleDraft,
    clearArticleDraft,
  }
})
