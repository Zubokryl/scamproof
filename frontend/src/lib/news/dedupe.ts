// Deduplication utilities
import { NormalizedArticle } from '@/lib/news/types';

/**
 * Simple string similarity function using Levenshtein distance
 */
function stringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  if (shorter.length === 0) {
    return 0.0;
  }
  
  const longerLength = longer.length;
  let cost: number;
  const distances: number[] = new Array(shorter.length + 1);
  
  for (let i = 0; i < distances.length; i++) {
    distances[i] = i;
  }
  
  let lastDiagonalValue: number;
  let diagonalValue: number;
  
  for (let i = 0; i < longer.length; i++) {
    diagonalValue = i;
    cost = 1;
    
    for (let j = 0; j < shorter.length; j++) {
      if (longer.charAt(i) === shorter.charAt(j)) {
        cost = 0;
      } else {
        cost = 1;
      }
      
      lastDiagonalValue = diagonalValue;
      diagonalValue = distances[j];
      
      distances[j] = Math.min(
        Math.min(distances[j] + 1, distances[j + 1] + 1),
        lastDiagonalValue + cost
      );
    }
    distances[shorter.length] = diagonalValue + 1;
  }
  
  const similarity = (longerLength - distances[shorter.length]) / longerLength;
  return similarity;
}

/**
 * Remove duplicate articles based on URL
 */
export function dedupeByUrl(articles: NormalizedArticle[]): NormalizedArticle[] {
  const urlMap = new Map<string, NormalizedArticle>();
  
  for (const article of articles) {
    if (!urlMap.has(article.url)) {
      urlMap.set(article.url, article);
    } else {
      // If we already have this URL, keep the one with more recent published date
      const existing = urlMap.get(article.url)!;
      const existingDate = new Date(existing.published_at);
      const newDate = new Date(article.published_at);
      
      if (newDate > existingDate) {
        urlMap.set(article.url, article);
      }
    }
  }
  
  return Array.from(urlMap.values());
}

/**
 * Remove duplicate articles based on title similarity
 */
export function dedupeByTitle(articles: NormalizedArticle[], threshold = 0.85): NormalizedArticle[] {
  const result: NormalizedArticle[] = [];
  
  for (const article of articles) {
    let isDuplicate = false;
    
    for (const existing of result) {
      const similarity = stringSimilarity(
        article.title.toLowerCase(),
        existing.title.toLowerCase()
      );
      
      if (similarity > threshold) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      result.push(article);
    }
  }
  
  return result;
}

/**
 * Comprehensive deduplication
 */
export function deduplicate(articles: NormalizedArticle[]): NormalizedArticle[] {
  // First dedupe by URL
  let deduped = dedupeByUrl(articles);
  
  // Then dedupe by title similarity
  deduped = dedupeByTitle(deduped);
  
  return deduped;
}