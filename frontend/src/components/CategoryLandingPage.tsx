'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, MessageCircle, ThumbsUp, Eye } from 'lucide-react';
import api from "@/api/api";
import styles from './CategoryLandingPage.module.css';
import LayoutWithNavAndFooter from '@/app/layout-with-nav-footer';

interface Article {
  id: number;
  title: string;
  content: string;
  published_at: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  author: {
    name: string;
  };
}

interface CategoryData {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  articles_count: number;
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
}

const CategoryLandingPage = () => {
  const { category: slug } = useParams();
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastArticleRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Memoized function to fetch category and articles data from the real backend API
  const fetchCategoryData = useCallback(async (pageNum = 1) => {
  try {
    if (pageNum === 1) setLoading(true);

    // Check if slug exists and is valid
    if (!slug) {
      // Instead of showing error, we'll just show empty state
      setLoading(false);
      return;
    }

    const response = await api.get(`/categories/${slug}/articles`, {
      params: {
        page: pageNum,
        per_page: 9,
      },
    });

    const result = response.data;

    // Check if we received valid data
    if (!result) {
      setError("Не удалось загрузить данные категории");
      setLoading(false);
      return;
    }

    // Handle case where category exists but has no articles yet
    if (result.category && (!result.articles || result.articles.data?.length === 0)) {
      setCategory(result.category?.data || result.category);
      setArticles([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    if (pageNum === 1) {
      setCategory(result.category?.data || result.category);
      setArticles(result.articles?.data || result.articles || []);
    } else {
      setArticles(prev => [
        ...prev,
        ...(result.articles?.data || result.articles || [])
      ]);
    }

    setHasMore(!!result.articles?.next_page_url);

  } catch (err: any) {
    console.error(err);
    // Check if it's a 404 error (category not found)
    if (err.response && err.response.status === 404) {
      setError("Категория не найдена");
    } else {
      setError("Не удалось загрузить данные категории");
    }
  } finally {
    if (pageNum === 1) setLoading(false);
  }
}, [slug]);


  // Initial data fetch
  useEffect(() => {
    if (slug) {
      fetchCategoryData(1);
    } else {
      // Instead of showing error, we'll just show empty state
      setLoading(false);
    }
  }, [slug]);

  // Fetch additional pages when page number changes
  useEffect(() => {
    if (slug && page > 1) {
      fetchCategoryData(page);
    }
  }, [slug, page]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (loading || !hasMore) return;

    const currentObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (lastArticleRef.current) {
      observer.current = currentObserver;
      observer.current.observe(lastArticleRef.current);
    }

    return () => {
      if (observer.current && lastArticleRef.current) {
        observer.current.unobserve(lastArticleRef.current);
      }
    };
  }, [loading, hasMore]);

  if (error) {
    return (
      <LayoutWithNavAndFooter>
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h1 className={styles.errorTitle}>Ошибка загрузки категории</h1>
            <p className={styles.errorMessage}>{error}</p>
            <div className={styles.buttonContainer}>
              <a 
                href="/database" 
                className={styles.backButton}
              >
                Перейти к базе данных
              </a>
            </div>
          </div>
        </div>
      </LayoutWithNavAndFooter>
    );
  }

  if (loading && !category) {
    return (
      <LayoutWithNavAndFooter>
        <div className={styles.loadingScreen}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Загрузка категории...</p>
          </div>
        </div>
      </LayoutWithNavAndFooter>
    );
  }

  return (
    <LayoutWithNavAndFooter>
      <div className={styles.container}>
        {/* Category Header */}
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.header}
          >
            <div className={styles.headerContent}>
              <span className={styles.icon}>{category?.icon || '🛡️'}</span>
              <h1 className={styles.title}>
                {category?.name || 'Категория'}
              </h1>
            </div>
            <p className={styles.description}>
              {category?.description || 'Описание категории'}
            </p>
            <div className={styles.stats}>
              <span>{category?.articles_count || 0} статей</span>
              <span>•</span>
              <span>Обновляется ежедневно</span>
            </div>
          </motion.div>

          {/* Articles Grid or Empty State */}
          {articles.length === 0 && !loading ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📄</div>
              <h2 className={styles.emptyTitle}>Статей пока нет</h2>
              <p className={styles.emptyDescription}>
                В этой категории пока нет опубликованных статей. 
                Новые материалы появятся в ближайшее время.
              </p>
            </div>
          ) : (
            <div className={styles.articlesGrid}>
              {articles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={styles.articleCard}
                >
                  <h2 className={styles.articleTitle}>{article.title}</h2>
                  <p className={styles.articleContent}>{article.content}</p>
                  
                  <div className={styles.metaInfo}>
                    <div className={styles.counters}>
                      <div className={styles.counterItem}>
                        <Eye size={14} />
                        <span>{article.views_count}</span>
                      </div>
                      <div className={styles.counterItem}>
                        <ThumbsUp size={14} />
                        <span>{article.likes_count}</span>
                      </div>
                      <div className={styles.counterItem}>
                        <MessageCircle size={14} />
                        <span>{article.comments_count}</span>
                      </div>
                    </div>
                    <div className={styles.counterItem}>
                      <Clock size={14} />
                      <span>{new Date(article.published_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {/* Loading indicator for more articles */}
          {loading && page !== 1 && (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
            </div>
          )}

          {/* Ref element for infinite scroll */}
          <div ref={lastArticleRef} className="h-1 w-full"></div>

          {!hasMore && articles.length > 0 && (
            <div className={styles.endMessage}>
              <p>Вы достигли конца статей</p>
            </div>
          )}
        </div>
      </div>
    </LayoutWithNavAndFooter>
  );
};


export default CategoryLandingPage;