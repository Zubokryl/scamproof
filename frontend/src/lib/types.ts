export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Article {
  id: number;
  title: string;
  content?: string;
  category: string;
  slug?: string;
  published_at?: string;
  pdf_url?: string;
  views_count?: number;
  thumbnail_url?: string;
}

export interface FormData {
  title: string;
  content: string;
  categoryId: string;
  slug: string;
  published_at: string;
  pdf_url: string;
  thumbnailFile?: File | null;
  videoFile?: File | null;
}