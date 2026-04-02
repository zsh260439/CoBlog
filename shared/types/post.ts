export interface Post {
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

export type CreatePostDto = Omit<Post, 'id' | 'createdAt' | 'updatedAt'>;
