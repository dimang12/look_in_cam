export interface NewsArticle {
  id?: string;
  title: string;
  content: string;
  author: string;
  publishedDate: Date;
  createdDate: Date;
  updatedDate: Date;
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  featuredImage?: string;
  views?: number;
  summary?: string;
  political_perspective?: string;
  cambodia_impact?: string;
}

export interface NewsArticleFormData {
  title: string;
  content: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  featuredImage?: string;
  summary?: string;
  political_perspective?: string;
  cambodia_impact?: string;
}