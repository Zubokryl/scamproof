// Article normalization utilities
import { NormalizedArticle, RawSource } from '@/lib/news/types';

/**
 * Simple hash function for generating unique IDs in browser environment
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Normalize an article from any source to our standard format
 */
export function normalizeArticle(article: any, source: RawSource): NormalizedArticle {
  const url = article.url || article.link || '';
  const title = (article.title || '').trim();
  
  // Generate a unique ID based on URL or source+title
  const id = simpleHash(url || (source + '|' + title));

  return {
    id,
    source,
    url,
    title,
    description: article.description || article.excerpt || article.summary || '',
    content: article.content || '',
    published_at: new Date(
      article.published_at || 
      article.publishedAt || 
      article.published_date ||
      article.pubDate || 
      Date.now()
    ).toISOString(),
    author: article.author || article.authors?.[0] || null,
    image: article.image || article.image_url || article.media || null,
    language: article.language || 'ru',
    raw: article
  };
}

/**
 * Normalize a list of articles
 */
export function normalizeArticles(articles: any[], source: RawSource): NormalizedArticle[] {
  return articles.map(article => normalizeArticle(article, source));
}