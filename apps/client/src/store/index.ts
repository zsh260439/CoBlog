import { ref } from 'vue'
import type { ArticleDraftState } from '@/types/admin'

const ARTICLE_DRAFT_STORAGE_KEY = 'admin:article-draft'

function loadDraftFromSession(): ArticleDraftState | null {
  try {
    const raw = sessionStorage.getItem(ARTICLE_DRAFT_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as ArticleDraftState
    // 只要有数据就返回，不需要检查字段是否为空
    if (!parsed) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

const articleDraft = ref<ArticleDraftState | null>(loadDraftFromSession())

export function useAppStore() {
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
}
