import { NormalizedArticle } from '@/lib/news/types';

interface SerpAPIResult {
  title: string;
  snippet?: string;
  link: string;
  source?: string;
  date?: string;
}

interface SerpAPIResponse {
  news_results?: SerpAPIResult[];
}

export async function fetchFromSerpAPI(key: string, query: string): Promise<NormalizedArticle[]> {
  console.log(`Fetching from SerpAPI with key: ${key.substring(0, 5)}... and query: ${query}`);
  
  const url = `https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(query)}&hl=ru&api_key=${key}`;

  try {
    const res = await fetch(url);
    console.log(`SerpAPI response status: ${res.status}`);
    
    if (!res.ok) {
      console.error(`SerpAPI request failed with status ${res.status}`);
      return [];
    }
    
    const data: SerpAPIResponse = await res.json();
    console.log(`SerpAPI returned ${data.news_results?.length || 0} results`);

    if (!data || !data.news_results) {
      console.warn('SerpAPI returned no results');
      return [];
    }

    return data.news_results.map((n) => ({
      id: `${n.link}-${n.date || ''}`,
      source: 'serpapi',
      url: n.link,
      title: n.title,
      description: n.snippet || '',
      content: n.snippet || '',
      published_at: new Date(n.date || Date.now()).toISOString(),
      author: null,
      image: null,
      language: 'ru',
      raw: n
    }));
  } catch (error) {
    console.error('Error fetching from SerpAPI:', error);
    return [];
  }
}