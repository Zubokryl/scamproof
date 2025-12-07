// News pipeline service
import { NormalizedArticle } from '@/lib/news/types';
import { fetchFromGNews, fetchFromNewscatcher, fetchFromNewsData } from '@/lib/news/sources';
import { filterFraudArticles } from '@/lib/news/filter';
import { deduplicate } from '@/lib/news/dedupe';

// In-memory cache for articles
let cachedArticles: NormalizedArticle[] = [];
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch articles from all configured sources
 */
async function fetchAllSources(): Promise<NormalizedArticle[]> {
  // In a browser environment, we can't access process.env directly
  // We'll need to pass API keys through function parameters or use a different approach
  const apiKeyGNews = (window as any).env?.NEWS_GNEWS_KEY || '';
  const apiKeyNewscatcher = (window as any).env?.NEWS_NEWCATCHER_KEY || '';
  const apiKeyNewsData = (window as any).env?.NEWSDATA_KEY || '';
  
  // Query terms for fraud-related news
  const query = 'мошенничество OR мошенник OR фишинг OR scam OR fraud OR crypto scam';
  
  // Fetch from all sources in parallel
  const [gnewsArticles, newscatcherArticles, newsdataArticles] = await Promise.all([
    fetchFromGNews(apiKeyGNews, query, 20),
    fetchFromNewscatcher(apiKeyNewscatcher, query, 20),
    fetchFromNewsData(apiKeyNewsData, query, 20)
  ]);
  
  // Combine all articles
  const allArticles = [
    ...gnewsArticles,
    ...newscatcherArticles,
    ...newsdataArticles
  ];
  
  return allArticles;
}

/**
 * Process articles through the full pipeline
 */
async function processArticles(articles: NormalizedArticle[]): Promise<NormalizedArticle[]> {
  // 1. Normalize articles (already done in fetchers)
  
  // 2. Filter for fraud-related content
  const filteredArticles = await filterFraudArticles(articles);
  
  // 3. Deduplicate
  const dedupedArticles = deduplicate(filteredArticles);
  
  // 4. Sort by published date (newest first)
  dedupedArticles.sort((a, b) => 
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
  
  // 5. Limit to 20 most recent articles
  return dedupedArticles.slice(0, 20);
}

/**
 * Get fresh fraud-related news articles
 */
export async function getFraudNews(): Promise<NormalizedArticle[]> {
  const now = Date.now();
  
  // Check if we have valid cached data
  if (cachedArticles.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedArticles;
  }
  
  try {
    // Fetch fresh articles from all sources
    const rawArticles = await fetchAllSources();
    
    // Process through the pipeline
    const processedArticles = await processArticles(rawArticles);
    
    // Update cache
    cachedArticles = processedArticles;
    cacheTimestamp = now;
    
    return processedArticles;
  } catch (error) {
    console.error('Error in news pipeline:', error);
    
    // Return cached data if available, even if stale
    if (cachedArticles.length > 0) {
      console.warn('Returning stale cached data due to error');
      return cachedArticles;
    }
    
    // Return empty array if no data available
    return [];
  }
}

/**
 * Clear the cache (useful for testing or manual refresh)
 */
export function clearCache(): void {
  cachedArticles = [];
  cacheTimestamp = 0;
}