// frontend/src/app/database/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/api/api';
import styles from './page.module.css';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  articles_count: number;
  icon: string;
}

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

export default function DatabasePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesRes = await api.get('/categories');
        const categoriesData = categoriesRes.data.data || categoriesRes.data;
        setCategories(categoriesData);

        // Fetch recent articles
        const articlesRes = await api.get('/articles?limit=6');
        const articlesData = articlesRes.data.data || articlesRes.data;
        setArticles(articlesData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(`Не удалось загрузить данные: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (searchQuery) {
    // We can't import SearchResults directly as it would create a circular dependency
    // Instead, we'll render the search results inline
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Результаты поиска</h1>
          <p className={styles.subtitle}>По запросу: <strong>"{searchQuery}"</strong></p>
        </div>
        <div className={styles.searchResultsContent}>
          <p>Для просмотра результатов поиска перейдите на <a href={`/database/search?q=${encodeURIComponent(searchQuery)}`}>страницу поиска</a>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>База данных мошеннических схем</h1>
        <p className={styles.subtitle}>
          Исследуйте каталоги мошеннических схем, отсортированные по категориям, с подробными статьями и рекомендациями по защите
        </p>
      </div>

      {error && (
        <div className={styles.databaseError}>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка категорий...</p>
        </div>
      ) : (
        <>
          <section className={styles.categoriesSection}>
            {categories.length > 0 ? (
              <div className={styles.categoriesGrid}>
                {categories.map(category => (
                  <div key={category.id} className={styles.categoryCard}>
                    <div className={styles.categoryCardContent}>
                      {/* Removed icon display */}
                      <div className={styles.categoryHeader}>
                        <h3 className={styles.categoryTitle}>{category.name}</h3>
                      </div>
                      <p className={styles.categoryDescription}>{category.description}</p>
                      <div className={styles.categoryMeta}>
                        <span className={styles.categoryCount}>{category.articles_count} статей</span>
                      </div>
                      <a href={`/database/${category.slug}`} className={styles.categoryLink}>
                        Перейти в категорию
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Категории не найдены</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}