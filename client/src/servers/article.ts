// 文章相关接口
import { request } from '@/http-utils'
import type { Article } from '@/types'
import type { ArchiveGroup } from '@/types/article'
/**
 * 获取文章列表
 */
export const getArticleList = () => {
  return request<Article[]>('/articles', 'GET')
}
/**
 * 获取文章详情
 */
export const getArticleDetail = (slug: string) => {
  return request<Article>(`/articles/${slug}`, 'GET')
}
/**
 * 获取分类下的文章列表
 */
export const getArticlesByCategory = (slug: string) => {
  return request<Article[]>(`/articles/category/${slug}`, 'GET')
}
/**
 * 获取归档下的文章列表
 */
export const getArticlesByArchive = () => {
  return request<ArchiveGroup[]>('/articles/archive/list', 'GET')
}
