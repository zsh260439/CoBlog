import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ArticleDraftState } from '@/types/admin'
const ARTICLE_DRAFT_STORAGE_KEY = 'admin:article-draft'

function loadArticleDraft() {
  const raw = sessionStorage.getItem(ARTICLE_DRAFT_STORAGE_KEY)
  return raw ? JSON.parse(raw) as ArticleDraftState : null
}

export const useArticleDraftStore = defineStore('article-draft', () => {
  const articleDraft = ref<ArticleDraftState | null>(loadArticleDraft())

  const saveArticleDraft = (draft: ArticleDraftState) => {
    articleDraft.value = { ...draft, tags: [...draft.tags] }
    sessionStorage.setItem(ARTICLE_DRAFT_STORAGE_KEY, JSON.stringify(articleDraft.value))
  }

  const getArticleDraft = () => articleDraft.value

  const clearArticleDraft = () => {
    articleDraft.value = null
    sessionStorage.removeItem(ARTICLE_DRAFT_STORAGE_KEY)
  }

  return {
    articleDraft,
    saveArticleDraft,
    getArticleDraft,
    clearArticleDraft,
  }
})
