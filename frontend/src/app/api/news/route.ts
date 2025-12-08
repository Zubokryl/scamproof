import { NextResponse } from 'next/server';
import { fetchFromGNews, fetchFromNewscatcher, fetchFromNewsData } from '@/lib/news/sources';
import { filterFraudArticles } from '@/lib/news/filter';
import { deduplicate } from '@/lib/news/dedupe';
import { addCategories } from '@/lib/news/categorize';
import { NormalizedArticle } from '@/lib/news/types';
import { fetchFraudNewsFromGDELT } from '@/lib/news/gdelt';
import { fetchFromMediastack } from '@/lib/news/mediastack';
import { fetchFromSerpAPI } from '@/lib/news/serpapi';

// Cache configuration
let cachedArticles: NormalizedArticle[] = [];
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Trusted Russian news sources
const TRUSTED_RUSSIAN_SOURCES = [
  'ria.ru', 'tass.ru', 'rbc.ru', 'lenta.ru', 'kommersant.ru',
  'vedomosti.ru', 'rg.ru', 'gazeta.ru', 'aif.ru', 'mk.ru'
];

// Search queries optimized for fraud-related news
const SEARCH_QUERIES = [
  'мошенничество OR афера OR обман OR "развод на деньги"',
  'фишинг OR скам OR "финансовая пирамида"',
  'кибермошенничество OR "телефонное мошенничество"',
  'новый вид обмана OR "схема обмана"'
];

// Helper function to fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(url, { ...options, signal: controller.signal });
  clearTimeout(id);
  return response;
}

// Function to fetch from all sources
async function fetchAllNews() {
  const gnewsKey = process.env.NEWS_GNEWS_KEY;
  const newscatcherKey = process.env.NEWS_NEWCATCHER_KEY;
  const newsdataKey = process.env.NEWSDATA_KEY;
  const mediastackKey = process.env.NEWS_MEDIASTACK_KEY;
  const serpapiKey = process.env.NEWS_SERPAPI_KEY;
  
  console.log('Available API keys:', {
    gnews: !!gnewsKey,
    newscatcher: !!newscatcherKey,
    newsdata: !!newsdataKey,
    mediastack: !!mediastackKey,
    serpapi: !!serpapiKey
  });

  const fetchPromises = [];

  // Fetch from GNews with different queries
  if (gnewsKey) {
    for (const query of SEARCH_QUERIES) {
      fetchPromises.push(
        fetchFromGNews(gnewsKey, query, 10).catch(e => {
          console.error('GNews fetch error:', e);
          return [];
        })
      );
    }
  }

  // Fetch from Newscatcher
  if (newscatcherKey) {
    fetchPromises.push(
      fetchFromNewscatcher(newscatcherKey, 'мошенничество OR афера', 15).catch(e => {
        console.error('Newscatcher fetch error:', e);
        return [];
      })
    );
  }

  // Fetch from NewsData
  if (newsdataKey) {
    fetchPromises.push(
      fetchFromNewsData(newsdataKey, 'fraud OR scam OR мошенничество', 15).catch(e => {
        console.error('NewsData fetch error:', e);
        return [];
      })
    );
  }

  if (mediastackKey) {
    console.log('Mediastack key found, fetching news...');
    fetchPromises.push(
      fetchFromMediastack(mediastackKey, 'мошенничество', 15).catch(e => {
        console.error('Mediastack fetch error:', e);
        return [];
      })
    );
  } else {
    console.log('No Mediastack key found, skipping Mediastack news fetch');
  }

  if (serpapiKey) {
    console.log('SerpAPI key found, fetching news...');
    fetchPromises.push(
      fetchFromSerpAPI(serpapiKey, 'мошенничество').catch(e => {
        console.error('SerpAPI fetch error:', e);
        return [];
      })
    );
  } else {
    console.log('No SerpAPI key found, skipping SerpAPI news fetch');
  }

  // Always try to fetch from GDELT (doesn't require API key)
  fetchPromises.push(
    fetchFraudNewsFromGDELT(15).catch(e => {
      console.error('GDELT fetch error:', e);
      return [];
    })
  );

  // Execute all fetches in parallel
  const results = await Promise.all(fetchPromises);
  return results.flat();
}

export async function GET() {
  const now = Date.now();
  const isCacheValid = cachedArticles.length > 0 && (now - cacheTimestamp) < CACHE_DURATION;

  // Return cached data if still valid
  if (isCacheValid) {
    return NextResponse.json({
      success: true,
      data: cachedArticles,
      count: cachedArticles.length,
      fromCache: true,
      lastUpdated: new Date(cacheTimestamp).toISOString()
    });
  }

  try {
    console.log('Fetching fresh news data...');
    
    // Fetch from all sources
    let allArticles = await fetchAllNews();
    
    // Filter for Russian content and quality
    allArticles = allArticles.filter(article => {
      // Basic validation
      if (!article.title || !article.url) return false;
      
      // Check if content is in Russian
      const hasRussianText = 
        /[а-яё]/i.test(article.title) || 
        (article.description && /[а-яё]/i.test(article.description));
      
      // Check if from trusted source
      const isFromTrustedSource = TRUSTED_RUSSIAN_SOURCES.some(
        source => article.url?.includes(source)
      );
      
      return hasRussianText || isFromTrustedSource;
    });

    // Apply fraud filtering
    const filteredArticles = await filterFraudArticles(allArticles);

    // Deduplicate articles
    const uniqueArticles = deduplicate(filteredArticles);

    // Add categories
    const categorizedArticles = addCategories(uniqueArticles);

    // Sort by date (newest first)
    categorizedArticles.sort((a, b) => 
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );

    // Keep only recent articles (last 2 weeks)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const recentArticles = categorizedArticles.filter(article => 
      new Date(article.published_at) >= twoWeeksAgo
    );

    // Update cache
    cachedArticles = recentArticles;
    cacheTimestamp = now;

    console.log(`Fetched ${recentArticles.length} fresh articles`);

    return NextResponse.json({
      success: true,
      data: recentArticles,
      count: recentArticles.length,
      fromCache: false,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in news API:', error);
    
    // Return cached data if available, even if stale
    if (cachedArticles.length > 0) {
      return NextResponse.json({
        success: true,
        data: cachedArticles,
        count: cachedArticles.length,
        fromCache: true,
        lastUpdated: new Date(cacheTimestamp).toISOString(),
        error: 'Error fetching fresh news, showing cached data'
      });
    }
    
    // If no cached data, return empty array instead of sample data
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      fromCache: false,
      error: 'Error fetching news'
    });
  }
}