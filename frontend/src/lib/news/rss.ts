// RSS feed fetcher
import Parser from 'rss-parser';
import { NormalizedArticle, RawSource } from '@/lib/news/types';
import { normalizeArticle } from '@/lib/news/normalize';

// Initialize RSS parser with custom headers
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; ScamProof/1.0; +http://scamproof.ru)'
  }
});

// Russian news RSS feeds
const RSS_FEEDS = [
  { url: 'https://lenta.ru/rss', source: 'lenta' as RawSource },
  { url: 'https://ria.ru/export/rss2/index.xml', source: 'ria' as RawSource },
  { url: 'https://tass.ru/rss/v2.xml', source: 'tass' as RawSource },
  { url: 'https://news.mail.ru/rss', source: 'mailru' as RawSource }
];

/**
 * Fetch articles from RSS feeds
 */
export async function fetchFromRSS(maxResults = 50): Promise<NormalizedArticle[]> {
  let articles: NormalizedArticle[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const rss = await parser.parseURL(feed.url);
      const items = rss.items.slice(0, Math.ceil(maxResults / RSS_FEEDS.length)).map(item => 
        normalizeArticle({
          url: item.link || '',
          title: item.title || '',
          description: item.contentSnippet || item.description || '',
          content: item['content:encoded'] || item.content || '',
          published_at: item.pubDate || new Date().toISOString(),
          author: item.creator || item.author || null,
          image: item.enclosure?.url || null,
          language: 'ru',
          raw: item
        }, feed.source)
      );
      articles.push(...items);
    } catch (error) {
      console.error(`RSS error for ${feed.url}:`, error);
    }
  }

  return articles;
}