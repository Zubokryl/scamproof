export interface ArticleCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  category: ArticleCategory;
  published_at: string;
  image_url: string;
  views_count: number;
}