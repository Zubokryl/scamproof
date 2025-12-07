// Fraud detection filter
import { NormalizedArticle, FilterResult } from '@/lib/news/types';

// Keywords for fraud detection in Russian and English
const FRAUD_KEYWORDS = [
  // Russian
  'мошеннич', 'мошенник', 'мошенничеств', 'мошенничество', 'мошенническ',
  'фишинг', 'фишингов', 'скам', 'скамер', 'обманул', 'обмануть',
  'инвестиционный обман', 'пирамид', 'финансов', 'кредитн', 'долгов',
  'крипт', 'биткоин', 'блокчейн', 'nft', 'defi', 'decentralized finance',
  'банковск', 'перевод', 'счет', 'карт', 'сниффер', 'cloner',
  
  // English
  'scam', 'fraud', 'phishing', 'ponzi', 'investment fraud',
  'crypto scam', 'card skimmer', 'cloner', 'financial fraud',
  'credit card', 'bank transfer', 'loan scam', 'debt relief',
  'bitcoin', 'cryptocurrency', 'nft scam', 'defi scam'
];

// Regular expressions for fraud patterns
const FRAUD_PATTERNS = [
  /(финансов(ое|ая)? мошенничество|фишинг|интернет-?мошен|крипто.*скам)/i,
  /(investment fraud|loan scam|credit card .*skimmer|bitcoin.*scam)/i
];

/**
 * Check if text contains fraud keywords
 */
function containsFraudKeyword(text: string): boolean {
  if (!text) return false;
  const normalizedText = text.toLowerCase();
  
  return FRAUD_KEYWORDS.some(keyword => 
    normalizedText.includes(keyword.toLowerCase())
  );
}

/**
 * Check if text matches fraud patterns
 */
function matchesFraudPattern(text: string): boolean {
  if (!text) return false;
  return FRAUD_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Determine if an article is likely about fraud
 */
export async function isLikelyFraud(article: NormalizedArticle): Promise<FilterResult> {
  // Combine title, description, and content for checking
  const fullText = `${article.title} ${article.description || ''} ${article.content || ''}`;
  
  // Fast rules check
  if (containsFraudKeyword(fullText) || matchesFraudPattern(fullText)) {
    return { match: true, reason: 'keyword', confidence: 0.8 };
  }
  
  // Language check - prefer Russian articles for this project
  if (article.language && article.language !== 'ru') {
    // For non-Russian articles, we might want to be more strict
    // or translate them (not implemented here)
    return { match: false, reason: 'language_mismatch' };
  }
  
  // TODO: Optional ML classifier could be added here
  // For now, we'll rely on keyword matching
  
  return { match: false, reason: 'no_match' };
}

/**
 * Filter a list of articles to only include likely fraud-related ones
 */
export async function filterFraudArticles(articles: NormalizedArticle[]): Promise<NormalizedArticle[]> {
  const results: NormalizedArticle[] = [];
  
  for (const article of articles) {
    const check = await isLikelyFraud(article);
    if (check.match) {
      // Create a new object with the filter reason added to raw data
      const rawWithReason = article.raw ? { ...article.raw as any, filter_reason: check.reason } : { filter_reason: check.reason };
      results.push({ ...article, raw: rawWithReason });
    }
  }
  
  return results;
}
