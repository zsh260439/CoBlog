import { request } from '@/http-utils'
import type { Article } from '@/types/article'
import type { ArchiveGroup, ArticleFormData } from '@/types/article'
import { sanitizeArticleFormPayload } from '@/utils'

export const getArticleList = () => {
  return request<Article[]>('/articles', 'GET')
}

export const getArticleDetail = (slug: string) => {
  return request<Article>(`/articles/${slug}`, 'GET')
}

export const getArticleById = (id: string) => {
  return request<Article>(`/articles/id/${id}`, 'GET')
}

export const getArticlesByCategory = (slug: string) => {
  return request<Article[]>(`/articles/category/${slug}`, 'GET')
}

export const getArticlesByTag = (tag: string) => {
  return request<Article[]>(`/articles/tag/${encodeURIComponent(tag)}`, 'GET')
}

export const getArticlesByArchive = () => {
  return request<ArchiveGroup[]>('/articles/archive/list', 'GET')
}

export const createArticle = (payload: ArticleFormData) => {
  return request<Article>('/articles', 'POST', sanitizeArticleFormPayload(payload))
}

export const updateArticle = (id: string, payload: ArticleFormData) => {
  return request<Article>(`/articles/id/${id}`, 'PATCH', sanitizeArticleFormPayload(payload))
}

export const deleteArticle = (id: string) => {
  return request<Article>(`/articles/id/${id}`, 'DELETE')
}
