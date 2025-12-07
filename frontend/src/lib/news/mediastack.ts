import { NormalizedArticle, RawSource } from '@/lib/news/types';

interface MediastackEntry {
  title: string;
  description?: string;
  url: string;
  source?: string;
  published_at: string;
  image?: string;
  language?: string;
}

interface MediastackResponse {
  data?: MediastackEntry[];
}

export async function fetchFromMediastack(key: string, query: string, limit: number = 20): Promise<NormalizedArticle[]> {
  const url = `http://api.mediastack.com/v1/news?access_key=${key}&languages=ru&keywords=${encodeURIComponent(query)}&limit=${limit}`;

  const res = await fetch(url);
  const data: MediastackResponse = await res.json();

  if (!data || !data.data) {
    console.warn('Mediastack returned no data');
    return [];
  }

  return data.data.map((item) => ({
    id: `${item.url}-${item.published_at}`,
    source: 'mediastack' as RawSource,
    url: item.url,
    title: item.title,
    description: item.description || '',
    content: item.description || '',
    published_at: new Date(item.published_at).toISOString(),
    author: null,
    image: item.image || null,
    language: item.language || 'ru',
    raw: item
  }));
}
