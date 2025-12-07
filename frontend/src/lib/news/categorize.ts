// Topic categorization for fraud news articles
import { NormalizedArticle } from '@/lib/news/types';

// Define topic categories
export type NewsCategory = 
  'образование' | 
  'социальные аферы' | 
  'финансовые схемы' | 
  'коммерческое мошенничество' | 
  'медицина' | 
  'отдых и туризм' | 
  'социальные сети' | 
  'недвижимость' | 
  'развлечения';

// Keywords for each category
const CATEGORY_KEYWORDS: Record<NewsCategory, string[]> = {
  'образование': ['образование', 'курсы', 'обучение', 'диплом', 'сертификат', 'университет', 'вуз'],
  'социальные аферы': ['социальная', 'пенсия', 'льгота', 'пособие', 'материнский капитал', 'субсидия'],
  'финансовые схемы': ['финанс', 'инвестиц', 'биржа', 'акци', 'облигац', 'ценные бумаги', 'валют', 'биржевой'],
  'коммерческое мошенничество': ['коммерч', 'бизнес', 'предпринимат', 'магазин', 'продавец', 'поставщик'],
  'медицина': ['медицина', 'врач', 'лекарство', 'аптека', 'больница', 'клиника', 'операци', 'лечени'],
  'отдых и туризм': ['тур', 'путешестви', 'отель', 'курорт', 'отпуск', 'виза', 'авиа', 'поездка'],
  'социальные сети': ['соцсети', 'facebook', 'instagram', 'vk', 'вконтакте', 'одноклассники', 'telegram', 'whatsapp'],
  'недвижимость': ['недвижимость', 'квартир', 'дом', 'земл', 'ипотек', 'риэлтор', 'продажа', 'покупка'],
  'развлечения': ['развлечен', 'игр', 'лотере', 'казино', 'ставк', 'букмекер', 'реклама']
};

/**
 * Categorize an article based on its content
 */
export function categorizeArticle(article: NormalizedArticle): NewsCategory | null {
  const fullText = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  
  // Check each category for matching keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => fullText.includes(keyword.toLowerCase()))) {
      return category as NewsCategory;
    }
  }
  
  // If no specific category matched, return null
  return null;
}

/**
 * Add category information to articles
 */
export function addCategories(articles: NormalizedArticle[]): (NormalizedArticle & { category: NewsCategory | null })[] {
  return articles.map(article => ({
    ...article,
    category: categorizeArticle(article)
  }));
}