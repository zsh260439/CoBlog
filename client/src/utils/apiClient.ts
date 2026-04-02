import type { Article, ArticleFormData, ApiResponse } from '@/types'

const API_BASE = '/api'

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json()
  return {
    data: response.ok ? data : null,
    message: data.message || (response.ok ? 'Success' : 'Error'),
    success: response.ok
  }
}

export const api = {
  async getPosts(): Promise<ApiResponse<Article[]>> {
    const response = await fetch(`${API_BASE}/posts`)
    return handleResponse<Article[]>(response)
  },

  async getPost(id: string): Promise<ApiResponse<Article>> {
    const response = await fetch(`${API_BASE}/posts/${id}`)
    return handleResponse<Article>(response)
  },

  async createPost(post: ArticleFormData): Promise<ApiResponse<Article>> {
    const response = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    })
    return handleResponse<Article>(response)
  },

  async updatePost(id: string, post: Partial<ArticleFormData>): Promise<ApiResponse<Article>> {
    const response = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    })
    return handleResponse<Article>(response)
  },

  async deletePost(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE'
    })
    return handleResponse<void>(response)
  },

  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    })
    return handleResponse<{ url: string }>(response)
  }
}
