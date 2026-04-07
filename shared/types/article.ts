export interface Article {
  id: string; // 文章唯一标识
  title: string; // 文章标题
  content: string; // 文章正文内容
  excerpt: string; // 文章摘要
  category: string; // 文章分类名称
  tags: string[]; // 文章标签数组
  coverImage: string; // 文章封面图地址
  createdAt: string; // 文章创建时间
  updatedAt: string; // 文章更新时间
}

// 创建文章 DTO 结构
export type CreateArticleDto = Omit<Article, 'id' | 'createdAt' | 'updatedAt'>;
