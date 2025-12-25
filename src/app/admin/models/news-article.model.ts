export interface NewsArticle {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedDate: Date;
  createdDate: Date;
  updatedDate: Date;
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  featuredImage?: string;
  views?: number;
}

export interface NewsArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  featuredImage?: string;
}