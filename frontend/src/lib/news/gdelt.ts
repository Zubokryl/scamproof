// GDELT API fetcher
import { NormalizedArticle, RawSource } from '@/lib/news/types';
import { normalizeArticle } from '@/lib/news/normalize';

// Fraud-related keywords for filtering
const FRAUD_KEYWORDS = [
  'мошенничество', 'мошенник', 'обман', 'аферист', 'фрод',
  'fraud', 'scam', 'phishing', 'кража данных', 'финансовые махинации'
];

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

/**
 * Fetch articles from GDELT API
 */
export async function fetchFromGDELT(query: string, maxResults = 20): Promise<NormalizedArticle[]> {
  try {
    // GDELT API endpoint for document search
    const gdeltQuery = encodeURIComponent(query);
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${gdeltQuery}&mode=ArtList&format=json&maxrecords=${maxResults}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ScamProof/1.0'
      }
    });
    const data = await response.json();
    
    if (!data.articles || !Array.isArray(data.articles)) {
      console.warn('No articles found in GDELT response');
      return [];
    }
    
    // Filter articles for fraud-related content
    const fraudArticles = data.articles.filter((article: any) => {
      const fullText = `${article.title || ''} ${article.seendoc || ''}`.toLowerCase();
      return FRAUD_KEYWORDS.some(keyword => fullText.includes(keyword.toLowerCase()));
    });
    
    // Normalize articles - using 'gnews' as source to avoid showing 'gdelt' on frontend
    const normalizedArticles = fraudArticles.map((article: any) => 
      normalizeArticle({
        url: article.url,
        title: article.title,
        description: article.seendoc ? article.seendoc.substring(0, 300) : '',
        content: article.seendoc || '',
        published_at: article.date || new Date().toISOString(),
        author: article.domain || null,
        image: null,
        language: 'ru', // GDELT often has Russian content
        raw: article
      }, 'gnews') // Using 'gnews' as source to avoid showing 'gdelt' on frontend
    );
    
    // Filter for Russian language content only and exclude French domains
    return normalizedArticles.filter((article: NormalizedArticle) => 
      (article.language === 'ru' || 
      (article.language === undefined && article.title.toLowerCase().match(/[а-яё]/))) &&
      article.url && !isExcludedDomain(article.url)
    );
  } catch (error) {
    console.error('Error fetching from GDELT:', error);
    return [];
  }
}

/**
 * Fetch fraud-related news specifically from GDELT
 */
export async function fetchFraudNewsFromGDELT(maxResults = 20): Promise<NormalizedArticle[]> {
  // Combinatorial fraud query focused on Russia
  const fraudQuery = 'Russia AND (мошенничество OR мошенник OR обман OR афера OR scam OR fraud OR phishing)';
  
  return await fetchFromGDELT(fraudQuery, maxResults);
}