// 文章相关接口
import { request } from '@/http-utils'
import type { Article } from '@/types/article'
import type { ArchiveGroup, ArticleFormData } from '@/types/article'
import {
  normalizeArchiveGroups,
  normalizeArticle,
  normalizeArticles,
  sanitizeArticleFormPayload,
} from '@/utils'

/**
 * 获取文章列表
 */
export const getArticleList = async () => {
  const result = await request<Article[]>('/articles', 'GET')
  return {
    ...result,
    data: normalizeArticles(result.data ?? [])
  }
}
/**
 * 获取文章详情
 */
export const getArticleDetail = async (slug: string) => {
  const result = await request<Article>(`/articles/${slug}`, 'GET')
  return {
    ...result,
    data: normalizeArticle((result.data ?? {}) as Article & Record<string, unknown>)
  }
}

// 根据 id 获取文章详情
export const getArticleById = async (id: string) => {
  const result = await request<Article>(`/articles/id/${id}`, 'GET')
  return {
    ...result,
    data: normalizeArticle((result.data ?? {}) as Article & Record<string, unknown>)
  }
}
/**
 * 获取分类下的文章列表
 */
export const getArticlesByCategory = async (slug: string) => {
  const result = await request<Article[]>(`/articles/category/${slug}`, 'GET')
  return {
    ...result,
    data: normalizeArticles(result.data ?? [])
  }
}

/**
 * 获取标签下的文章列表
 */
export const getArticlesByTag = async (tag: string) => {
  const result = await request<Article[]>(`/articles/tag/${encodeURIComponent(tag)}`, 'GET')
  return {
    ...result,
    data: normalizeArticles(result.data ?? [])
  }
}
/**
 * 获取归档下的文章列表
 */
export const getArticlesByArchive = async () => {
  const result = await request<ArchiveGroup[]>('/articles/archive/list', 'GET')
  return {
    ...result,
    data: normalizeArchiveGroups(result.data ?? [])
  }
}

/**
 * 创建文章
 */
export const createArticle = async (payload: ArticleFormData) => {
  const result = await request<Article>('/articles', 'POST', sanitizeArticleFormPayload(payload))
  return {
    ...result,
    data: normalizeArticle((result.data ?? {}) as Article & Record<string, unknown>)
  }
}

// 更新文章
export const updateArticle = async (id: string, payload: ArticleFormData) => {
  const result = await request<Article>(`/articles/id/${id}`, 'PATCH', sanitizeArticleFormPayload(payload))
  return {
    ...result,
    data: normalizeArticle((result.data ?? {}) as Article & Record<string, unknown>)
  }
}

// 删除文章
export const deleteArticle = async (id: string) => {
  return request<Article>(`/articles/id/${id}`, 'DELETE')
}
