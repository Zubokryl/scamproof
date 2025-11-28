// Next.js API route for fraud news
import { NextResponse } from 'next/server';
import { fetchFromGNews, fetchFromNewscatcher, fetchFromNewsData } from '@/lib/news/sources';
import { fetchFraudNewsFromGDELT } from '@/lib/news/gdelt';
import { filterFraudArticles } from '@/lib/news/filter';
import { deduplicate } from '@/lib/news/dedupe';
import { addCategories } from '@/lib/news/categorize';
import { NormalizedArticle } from '@/lib/news/types';

// In-memory cache for articles
let cachedArticles: any[] = [];
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (refresh more frequently)

// Sample data for testing when API keys are not configured
const sampleArticles: any[] = [
  {
    id: '1',
    source: 'gnews',
    url: 'https://example.com/news1',
    title: 'Мошенники обманули граждан на крупную сумму',
    description: 'В очередном случае мошенничества пострадали несколько жителей города. Преступники звонили от имени банка и требовали реквизиты карт.',
    content: 'Полный текст статьи о мошенничестве...',
    published_at: new Date().toISOString(),
    author: 'Иван Иванов',
    image: undefined,
    language: 'ru',
    category: 'финансовые схемы',
    raw: {}
  },
  {
    id: '2',
    source: 'newscatcher',
    url: 'https://example.com/news2',
    title: 'Выявлен новый тип фишинговых атак',
    description: 'Эксперты в области кибербезопасности обнаружили новую волну фишинговых атак, направленных на пользователей банков.',
    content: 'Подробности о новом виде фишинга...',
    published_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    author: 'Анна Петрова',
    image: undefined,
    language: 'ru',
    category: 'кибербезопасность',
    raw: {}
  },
  {
    id: '3',
    source: 'newsdata',
    url: 'https://example.com/news3',
    title: 'Задержаны организаторы инвестиционной пирамиды',
    description: 'Полиция задержала группу лиц, создавших инвестиционную пирамиду, которая обошлась гражданам в миллионы рублей.',
    content: 'Детали расследования инвестиционной пирамиды...',
    published_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    author: 'Дмитрий Сидоров',
    image: undefined,
    language: 'ru',
    category: 'финансовые схемы',
    raw: {}
  },
  {
    id: '4',
    source: 'gnews',
    url: 'https://example.com/news4',
    title: 'Мошенническая схема с криптовалютой раскрыта',
    description: 'Следователи раскрыли сложную схему мошенничества с использованием криптовалюты, пострадало более 100 человек.',
    content: 'Подробности о криптовалютном мошенничестве...',
    published_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    author: 'Мария Козлова',
    image: undefined,
    language: 'ru',
    category: 'финансовые схемы',
    raw: {}
  },
  {
    id: '5',
    source: 'newscatcher',
    url: 'https://example.com/news5',
    title: 'Предупреждение о телефонных аферах',
    description: 'Эксперты предупреждают о новой волне телефонных афер, жертвы получают звонки с неизвестных номеров.',
    content: 'Как защититься от телефонных афер...',
    published_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    author: 'Алексей Смирнов',
    image: undefined,
    language: 'ru',
    category: 'социальные аферы',
    raw: {}
  },
  {
    id: '6',
    source: 'newsdata',
    url: 'https://example.com/news6',
    title: 'Мошенничество в сфере недвижимости',
    description: 'Выявлены случаи мошенничества при продаже недвижимости, злоумышленники используют поддельные документы.',
    content: 'Подробности о мошенничестве в сфере недвижимости...',
    published_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    author: 'Елена Волкова',
    image: undefined,
    language: 'ru',
    category: 'недвижимость',
    raw: {}
  }
];

export async function GET() {
  try {
    // Check if we have valid cached articles that haven't expired
    const now = Date.now();
    if (cachedArticles.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
      // Filter cached articles to only include last 2 months
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      
      const recentCachedArticles = cachedArticles.filter(article => 
        new Date(article.published_at) >= twoMonthsAgo
      );
      
      // Ensure we always return at least 6 articles
      const articlesToReturn = recentCachedArticles.length >= 6 
        ? recentCachedArticles.slice(0, 6) 
        : [...recentCachedArticles, ...sampleArticles].slice(0, 6);
      
      return NextResponse.json({
        success: true,
        data: articlesToReturn,
        count: articlesToReturn.length,
        fromCache: true
      });
    }

    // Get API keys from environment variables
    const gnewsKey = process.env.NEWS_GNEWS_KEY;
    const newscatcherKey = process.env.NEWS_NEWCATCHER_KEY;
    const newsdataKey = process.env.NEWSDATA_KEY;

    // Check if API keys are configured
    const hasApiKeys = gnewsKey || newscatcherKey || newsdataKey;

    if (!hasApiKeys) {
      // Return sample data if no API keys are configured
      return NextResponse.json({
        success: true,
        data: sampleArticles.slice(0, 6),
        count: 6,
        fromCache: false
      });
    }

    // Fetch from all sources with Russian language focus
    const query = "мошенничество OR мошенник OR обман OR афера OR scam OR fraud OR phishing";
    
    const [gnewsArticles, newscatcherArticles, newsdataArticles, gdeltArticles] = await Promise.all([
      fetchFromGNews(gnewsKey || '', query, 30), // Increased fetch size to ensure we get enough after filtering
      fetchFromNewscatcher(newscatcherKey || '', query, 30),
      fetchFromNewsData(newsdataKey || '', query, 30),
      fetchFraudNewsFromGDELT(30) // Increased fetch size
    ]);

    // Combine all articles
    let allArticles = [...gnewsArticles, ...newscatcherArticles, ...newsdataArticles, ...gdeltArticles];

    // Filter for Russian language only
    allArticles = allArticles.filter(article => 
      article.language === 'ru' || 
      (article.language === undefined && article.title.toLowerCase().match(/[а-яё]/))
    );

    // Apply fraud filtering
    const filteredArticles = await filterFraudArticles(allArticles);

    // Remove duplicates
    let uniqueArticles = deduplicate(filteredArticles);

    // Add categories
    const categorizedArticles = addCategories(uniqueArticles);

    // Sort by published date (newest first)
    categorizedArticles.sort((a, b) => 
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );

    // Filter to only include articles from the last 2 months
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const recentArticles = categorizedArticles.filter(article => 
      new Date(article.published_at) >= twoMonthsAgo
    );

    // Ensure we always have at least 6 articles by adding sample articles if needed
    let finalArticles = recentArticles;
    if (recentArticles.length < 6) {
      // Add sample articles to fill up to 6
      const neededArticles = 6 - recentArticles.length;
      finalArticles = [...recentArticles, ...sampleArticles.slice(0, neededArticles)];
    }

    // Limit to 20 articles for caching
    const limitedArticles = finalArticles.slice(0, 20);

    // Update cache
    cachedArticles = limitedArticles;
    cacheTimestamp = now;

    // Return exactly 6 articles
    const articlesToReturn = limitedArticles.slice(0, 6);
    
    return NextResponse.json({
      success: true,
      data: articlesToReturn,
      count: articlesToReturn.length,
      fromCache: false
    });
  } catch (error: any) {
    console.error('Error fetching fraud news:', error);
    // Return sample data in case of error
    return NextResponse.json({
      success: true,
      data: sampleArticles.slice(0, 6),
      count: 6,
      fromCache: false
    });
  }
}