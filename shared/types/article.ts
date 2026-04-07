export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  coverImage: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateArticleDto = Omit<Article, 'id' | 'createdAt' | 'updatedAt'>;
