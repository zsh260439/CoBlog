// 文章相关接口
import { request } from '@/http-utils'
import type { Article } from '@/types'
export const getPostList = () => {
    return request<Article[]>('/posts', 'GET')
}

