// News pipeline types

export type RawSource = 'gnews' | 'newscatcher' | 'newsdata' | 'own';

export interface NormalizedArticle {
  id: string;           // hash (url or source+id)
  source: RawSource;
  url: string;
  title: string;
  description?: string;
  content?: string;
  published_at: string; // ISO
  author?: string;
  image?: string;
  language?: string;
  category?: string;    // Category for the article
  raw?: any;            // original data
}

export interface FilterResult {
  match: boolean;
  reason?: string;
  confidence?: number;
}