// News source fetchers
import { NormalizedArticle, RawSource } from '@/lib/news/types';
import { normalizeArticle } from '@/lib/news/normalize';

// Domains to exclude (French and other non-Russian sources)
const EXCLUDED_DOMAINS = [
  'franceinfo.fr',
  'lemonde.fr',
  'lefigaro.fr',
  'liberation.fr',
  '20minutes.fr',
  'francetvinfo.fr',
  'europe1.fr',
  'rtl.fr',
  'bfm.fr',
  'france24.com',
  'rfi.fr',
  'france.tv'
];

// Helper function to check if a URL is from an excluded domain
function isExcludedDomain(url: string): boolean {
  if (!url) return false;
  
  // Convert URL to lowercase for case-insensitive matching
  const lowerUrl = url.toLowerCase();
  
  return EXCLUDED_DOMAINS.some(domain => {
    // Check for exact domain match or subdomain match
    return lowerUrl.includes(domain.toLowerCase()) || 
           lowerUrl.includes(`www.${domain.toLowerCase()}`) ||
           lowerUrl.includes(`://${domain.toLowerCase()}`) ||
           lowerUrl.includes(`://www.${domain.toLowerCase()}`);
  });
}

// GNews fetcher
export async function fetchFromGNews(apiKey: string, q: string, pageSize = 20): Promise<NormalizedArticle[]> {
  if (!apiKey) {
    console.warn('GNews API key not provided');
    return [];
  }

  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=ru&max=${pageSize}&token=${apiKey}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'ScamProof/1.0'
      }
    });
    const data = await response.json();
    
    // Filter for Russian language content and exclude French domains
    const russianArticles = (data.articles || []).filter((article: any) => 
      article.title && article.title.toLowerCase().match(/[а-яё]/) &&
      article.url && !isExcludedDomain(article.url)
    );
    
    return russianArticles.map((article: any) => 
      normalizeArticle({
        url: article.url,
        title: article.title,
        description: article.description,
        content: article.content,
        published_at: article.publishedAt,
        author: article.source?.name,
        image: article.image,
        language: 'ru',
        raw: article
      }, 'gnews')
    );
  } catch (error) {
    console.error('Error fetching from GNews:', error);
    return [];
  }
}

// Newscatcher fetcher
export async function fetchFromNewscatcher(apiKey: string, q: string, pageSize = 20): Promise<NormalizedArticle[]> {
  if (!apiKey) {
    console.warn('Newscatcher API key not provided');
    return [];
  }

  try {
    const url = `https://api.newscatcherapi.com/v2/search`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'ScamProof/1.0'
      },
      body: JSON.stringify({
        q,
        lang: 'ru',
        page_size: pageSize,
        sort_by: 'relevancy'
      })
    });
    
    const data = await response.json();
    
    // Filter for Russian language content and exclude French domains
    const russianArticles = (data.articles || []).filter((article: any) => 
      article.title && article.title.toLowerCase().match(/[а-яё]/) &&
      (article.language === 'ru' || !article.language) &&
      article.link && !isExcludedDomain(article.link)
    );
    
    return russianArticles.map((article: any) => 
      normalizeArticle({
        url: article.link,
        title: article.title,
        description: article.excerpt,
        content: article.summary,
        published_at: article.published_date,
        author: article.authors?.[0],
        image: article.media,
        language: article.language || 'ru',
        raw: article
      }, 'newscatcher')
    );
  } catch (error) {
    console.error('Error fetching from Newscatcher:', error);
    return [];
  }
}

// NewsData fetcher with improved Russian news filtering
export async function fetchFromNewsData(apiKey: string, q: string, pageSize = 20): Promise<NormalizedArticle[]> {
  if (!apiKey) {
    console.warn('NewsData API key not provided');
    return [];
  }

  try {
    // Improved query for Russian fraud news
    const queryParams = new URLSearchParams({
      apikey: apiKey,
      country: 'ru', // Russia
      language: 'ru', // Russian language
      q: q, // Search query
      size: pageSize.toString()
    });
    
    const url = `https://newsdata.io/api/1/news?${queryParams.toString()}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ScamProof/1.0'
      }
    });
    const data = await response.json();
    
    // Check if data.results exists and is an array
    if (!data.results || !Array.isArray(data.results)) {
      console.warn('NewsData returned unexpected data structure:', data);
      return [];
    }
    
    // Filter for Russian language content and exclude French domains
    const russianArticles = data.results.filter((article: any) => 
      article.title && article.title.toLowerCase().match(/[а-яё]/) &&
      article.language === 'ru' &&
      article.link && !isExcludedDomain(article.link)
    );
    
    return russianArticles.map((article: any) => 
      normalizeArticle({
        url: article.link,
        title: article.title,
        description: article.description,
        content: article.content,
        published_at: article.pubDate,
        author: article.creator?.[0],
        image: article.image_url,
        language: article.language,
        raw: article
      }, 'newsdata')
    );
  } catch (error) {
    console.error('Error fetching from NewsData:', error);
    return [];
  }
}