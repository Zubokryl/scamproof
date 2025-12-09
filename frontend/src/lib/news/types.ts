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
  category?: string;    // Category for the article (will be overwritten by addCategories)
  raw?: unknown;        // original data
}

// Define topic categories for fraud news
export type NewsCategory = 
  'образование' | 
  'социальные аферы' | 
  'финансовые схемы' | 
  'коммерческое мошенничество' | 
  'медицина' | 
  'отдых и туризм' | 
  'социальные сети' | 
  'недвижимость' | 
  'развлечения';