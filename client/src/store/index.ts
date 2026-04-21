import { reactive } from 'vue'
import type { AdminStoreState, ArticleDraftState } from '@/types/admin'

const ARTICLE_DRAFT_STORAGE_KEY = 'admin:article-draft'

const createEmptyState = (): AdminStoreState => ({
  articleDraft: null,
})

// 从 sessionStorage 读取草稿，保证刷新页面后仍能恢复当前会话中的内容。
function loadDraftFromSession(): ArticleDraftState | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.sessionStorage.getItem(ARTICLE_DRAFT_STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<ArticleDraftState>

    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    return {
      title: typeof parsed.title === 'string' ? parsed.title : '',
      slug: typeof parsed.slug === 'string' ? parsed.slug : '',
      excerpt: typeof parsed.excerpt === 'string' ? parsed.excerpt : '',
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      category: typeof parsed.category === 'string' ? parsed.category : '',
      categorySlug: typeof parsed.categorySlug === 'string' ? parsed.categorySlug : '',
      tags: Array.isArray(parsed.tags) ? parsed.tags.filter((item): item is string => typeof item === 'string') : [],
      coverImage: typeof parsed.coverImage === 'string' ? parsed.coverImage : '',
      content: typeof parsed.content === 'string' ? parsed.content : '',
      draftMode: typeof parsed.draftMode === 'boolean' ? parsed.draftMode : false,
    }
  } catch {
    return null
  }
}

function persistDraftToSession(draft: ArticleDraftState | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (!draft) {
    window.sessionStorage.removeItem(ARTICLE_DRAFT_STORAGE_KEY)
    return
  }

  window.sessionStorage.setItem(ARTICLE_DRAFT_STORAGE_KEY, JSON.stringify(draft))
}

const state = reactive<AdminStoreState>({
  ...createEmptyState(),
  articleDraft: loadDraftFromSession(),
})

function cloneDraft(draft: ArticleDraftState): ArticleDraftState {
  return {
    ...draft,
    tags: [...draft.tags],
  }
}

export function useAppStore() {
  const saveArticleDraft = (draft: ArticleDraftState) => {
    state.articleDraft = cloneDraft(draft)
    persistDraftToSession(state.articleDraft)
  }

  const getArticleDraft = () => {
    return state.articleDraft ? cloneDraft(state.articleDraft) : null
  }

  const clearArticleDraft = () => {
    state.articleDraft = null
    persistDraftToSession(null)
  }

  return {
    state,
    saveArticleDraft,
    getArticleDraft,
    clearArticleDraft,
  }
}
