// News pipeline types

export type RawSource = 'gnews' | 'newscatcher' | 'newsdata' | 'mediastack' | 'serpapi' | 'gdelt' | 'own';

export interface NormalizedArticle {
  id: string;           // hash (url or source+id)
  source: RawSource;
  url: string;
  title: string;
  description?: string;
  content?: string;
  published_at: string; // ISO
  author?: string | null;
  image?: string | null;
  language?: string;
  category?: string;    // Category for the article
  raw?: unknown;            // original data
}

export interface FilterResult {
  match: boolean;
  reason?: string;
  confidence?: number;
}