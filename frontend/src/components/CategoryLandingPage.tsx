// frontend/src/components/CategoryLandingPage.tsx
'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/api/api';
import styles from './CategoryLandingPage.module.css';
import { pluralizeArticles } from '@/lib/pluralize';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  published_at: string;
  image_url: string;
  views_count: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  articles_count: number;
  icon: string;
}

interface ArticlesResponse {
  category: Category;
  articles: {
    data: Article[];
    current_page: number;
    last_page: number;
    total: number;
  };
  articles_count: number;
}

export default function CategoryLandingPage({ slug }: { slug?: string }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // If no slug is passed as prop, get it from URL params
  const params = useParams();
  const urlSlug = params.slug as string;
  const categorySlug = slug || urlSlug;

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!categorySlug) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch category details and articles - using the correct endpoint
        const response = await api.get<ArticlesResponse>(`/categories/${categorySlug}/articles`);
        const categoryData = response.data.category;
        const articlesData = response.data.articles.data;
        
        setCategory(categoryData);
        setArticles(articlesData);
      } catch (err: any) {
        console.error('Error fetching category data:', err);
        setError(`Категория не найдена: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categorySlug]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Загрузка категории...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h1 className={styles.errorTitle}>Ошибка</h1>
          <p className={styles.errorMessage}>{error || 'Категория не найдена'}</p>
          <a href="/database" className={styles.backButton}>
            Вернуться к категориям
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          {/* Back to categories link */}
          <div className={styles.backLinkContainer}>
            <a href="/database" className={styles.backLink}>
              ← Все категории
            </a>
          </div>
          {/* Removed emoji icon container */}
          <div>
            <h1 className={styles.title}>{category.name}</h1>
            <p className={styles.description}>{category.description}</p>
            <div className={styles.stats}>
              <span>{pluralizeArticles(category.articles_count)} в категории</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {articles.length > 0 ? (
          <>
            <div className={styles.articlesGrid}>
              {articles.map(article => (
                <div key={article.id} className={styles.articleCard}>
                  <a href={`/article/${article.id}`} className={styles.articleLink}>
                    <div className={styles.articleCardContent}>
                      <h3 className={styles.articleTitle}>{article.title}</h3>
                      {article.excerpt && (
                        <p className={styles.articleExcerpt}>{article.excerpt}</p>
                      )}
                      <div className={styles.articleMeta}>
                        {article.published_at && (
                          <span className={styles.metaText}>
                            {new Date(article.published_at).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            {/* Removed emoji icon */}
            <h2 className={styles.emptyTitle}>Статей пока нет</h2>
            <p className={styles.emptyDescription}>
              В этой категории пока нет опубликованных статей. Проверьте позже!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
