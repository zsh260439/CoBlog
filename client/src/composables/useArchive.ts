import { ref } from 'vue'
import { getArticlesByArchive } from '@/servers/article'
import type { Article } from '@/types'
import type { ArchiveGroup } from '@/types/article'

export function useArchive() {
  const archiveGroups = ref<ArchiveGroup[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadArchiveGroups = async () => {
    isLoading.value = true
    error.value = null

    try {
      const result = await getArticlesByArchive()
      archiveGroups.value = result.data
    } catch (err) {
      console.error(err)
      archiveGroups.value = []
      error.value = '归档加载失败'
    } finally {
      isLoading.value = false
    }
  }

  const formatArchiveDate = (date: string) => {
    const parsed = new Date(date)
    const month = `${parsed.getMonth() + 1}`.padStart(2, '0')
    const day = `${parsed.getDate()}`.padStart(2, '0')

    return `${month}-${day}`
  }

  return {
    archiveGroups,
    isLoading,
    error,
    loadArchiveGroups,
    formatArchiveDate,
  }
}
