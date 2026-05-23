export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  publishedAt: string;
  author?: string;
  tags?: string[];
  isPublished: boolean;
}

export interface ArticleListResponse {
  items: Article[];
  page: number;
  limit: number;
  total: number;
}
