import { request } from '@/http-utils'
import type {
  ArticleCategory,
  ArticleTag,
  CreateArticleCategoryPayload,
  CreateArticleTagPayload,
} from '@/types/article'

// 获取分类列表
export const getCategoryList = () => {
  return request<ArticleCategory[]>('/taxonomies/categories', 'GET')
}

// 新增分类
export const createCategory = (payload: CreateArticleCategoryPayload) => {
  return request<ArticleCategory>('/taxonomies/categories', 'POST', payload)
}

// 获取标签列表
export const getTagList = () => {
  return request<ArticleTag[]>('/taxonomies/tags', 'GET')
}

// 新增标签
export const createTag = (payload: CreateArticleTagPayload) => {
  return request<ArticleTag>('/taxonomies/tags', 'POST', payload)
}
//删除分类
export const deleteCategory = (slug:string)=>{
 return request<{ deletedCount: number }>('/taxonomies/categories/' + slug, 'DELETE')
}
//删除标签
export const deleteTag = (slug:string)=>{
 return request<{ deletedCount: number }>('/taxonomies/tags/' + slug, 'DELETE')
}
//更新分类
export const updateCategory = (slug:string,payload:CreateArticleCategoryPayload)=>{
 return request<ArticleCategory>('/taxonomies/categories/' + slug, 'PATCH',payload)
}
//更新标签
export const updateTag = (slug:string,payload:CreateArticleTagPayload)=>{
 return request<ArticleTag>('/taxonomies/tags/' + slug, 'PATCH',payload)
}
