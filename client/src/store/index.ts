import { reactive } from 'vue'
import type { AdminStoreState, ArticleDraftState } from '@/types/admin'

const state = reactive<AdminStoreState>({
  articleDraft: null,
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
  }

  const getArticleDraft = () => {
    return state.articleDraft ? cloneDraft(state.articleDraft) : null
  }

  const clearArticleDraft = () => {
    state.articleDraft = null
  }

  return {
    state,
    saveArticleDraft,
    getArticleDraft,
    clearArticleDraft,
  }
}
