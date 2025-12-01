'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, MessageCircle, ThumbsUp, Eye } from 'lucide-react';
import api from "@/api/api";
import styles from './CategoryLandingPage.module.css';
import LayoutWithNavAndFooter from '@/app/layout-with-nav-footer';
import Link from 'next/link';

interface Article {
  id: number;
  category_id: number;
  title: string;
  content: string;
  slug: string;
  thumbnail?: string;
  video_url?: string;
  pdf_url?: string;
  published_at: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  author: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  created_at: string;
  updated_at: string;
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
  console.log('CategoryLandingPage component mounting');
  
  const params = useParams();
  const slug = params.category;
  console.log('Category params:', params);
  console.log('Category slug:', slug);
  
  // Additional debug: try to get slug from window location for static routes
  const [resolvedSlug, setResolvedSlug] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('useEffect for slug resolution running');
    // For static routes, we might need to extract slug from the URL
    if (typeof window !== 'undefined') {
      // More robust URL parsing
      const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
      console.log('Path parts:', pathParts);
      const databaseIndex = pathParts.indexOf('database');
      if (databaseIndex !== -1 && pathParts[databaseIndex + 1]) {
        const urlSlug = pathParts[databaseIndex + 1];
        console.log('URL-based slug:', urlSlug);
        setResolvedSlug(urlSlug);
      }
    }
    
    // If we have a slug from useParams, use that
    if (slug) {
      console.log('Using slug from useParams:', slug);
      setResolvedSlug(slug as string);
    }
  }, [slug]);
  
  console.log('Resolved slug:', resolvedSlug);
  
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastArticleRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Debug log for component re-rendering
  console.log('Component re-rendering with state:', {
    resolvedSlug,
    articlesLength: articles.length,
    loading,
    category,
    error
  });

  // Memoized function to fetch category and articles data from the real backend API
  const fetchCategoryData = useCallback(async (pageNum = 1) => {
  try {
    console.log('fetchCategoryData called with pageNum:', pageNum);
    
    if (pageNum === 1) setLoading(true);

    // Check if slug exists and is valid
    const effectiveSlug = resolvedSlug;
    console.log('Using slug for API call:', effectiveSlug);
    
    if (!effectiveSlug) {
      console.log('No slug available, skipping API call');
      // Instead of showing error, we'll just show empty state
      setLoading(false);
      return;
    }

    // Validate slug format (basic validation)
    if (typeof effectiveSlug !== 'string' || effectiveSlug.trim() === '') {
      console.log('Invalid slug format:', effectiveSlug);
      setError("Некорректный формат категории");
      setLoading(false);
      return;
    }

    console.log('Making API call to:', `/categories/${effectiveSlug}/articles`);
    const response = await api.get(`/categories/${effectiveSlug}/articles`, {
      params: {
        page: pageNum,
        per_page: 9,
      },
    });

    const result = response.data;
    console.log('API Response:', result);

    // Check if we received valid data
    if (!result) {
      setError("Не удалось загрузить данные категории");
      setLoading(false);
      return;
    }

    // Handle case where category exists but has no articles yet
    if (result.category && (!result.articles || !result.articles.data || result.articles.data.length === 0)) {
      console.log('No articles found for category');
      // Fixed: correctly set category data without trying to access .data property
      setCategory(result.category);
      setArticles([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    if (pageNum === 1) {
      // Fixed: correctly set category data without trying to access .data property
      setCategory(result.category);
      // Fixed: correctly extract articles data from paginator
      const articlesData = result.articles?.data || [];
      console.log('Setting articles:', articlesData);
      setArticles(articlesData);
    } else {
      // Fixed: correctly extract articles data from paginator
      const articlesData = result.articles?.data || [];
      console.log('Adding more articles:', articlesData);
      setArticles(prev => [
        ...prev,
        ...articlesData
      ]);
    }

    setHasMore(!!result.articles?.next_page_url);

  } catch (err: any) {
    console.error('API call failed:', err);
    // Log more detailed error information
    if (err.response) {
      console.error('Error response:', err.response);
      console.error('Error status:', err.response.status);
      console.error('Error data:', err.response.data);
    }
    
    // Check if it's a 404 error (category not found)
    if (err.response && err.response.status === 404) {
      setError("Категория не найдена");
    } else if (err.response && err.response.status === 500) {
      setError("Ошибка сервера. Попробуйте позже.");
    } else {
      setError("Не удалось загрузить данные категории");
    }
  } finally {
    if (pageNum === 1) setLoading(false);
  }
}, [resolvedSlug]);


  // Initial data fetch
  useEffect(() => {
    console.log('Initial useEffect running with resolvedSlug:', resolvedSlug);
    if (resolvedSlug) {
      fetchCategoryData(1);
    } else {
      // Only set loading to false if we're sure there's no slug
      // Wait a bit to see if slug resolution happens
      const timer = setTimeout(() => {
        if (!resolvedSlug) {
          console.log('No slug found after timeout, setting loading to false');
          setLoading(false);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [resolvedSlug]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('Articles state updated:', articles);
    console.log('Articles length:', articles.length);
    console.log('Loading state:', loading);
    console.log('Category state:', category);
  }, [articles, loading, category]);
  
  // Additional debug for state updates
  const prevArticlesLength = useRef(articles.length);
  useEffect(() => {
    if (prevArticlesLength.current !== articles.length) {
      console.log('Articles length changed from', prevArticlesLength.current, 'to', articles.length);
      prevArticlesLength.current = articles.length;
    }
  }, [articles.length]);
  
  // Debug log for articles state changes
  const prevArticles = useRef(articles);
  useEffect(() => {
    if (prevArticles.current !== articles) {
      console.log('Articles array changed:', articles);
      prevArticles.current = articles;
    }
  }, [articles]);
  
  // Fetch additional pages when page number changes
  useEffect(() => {
    if (resolvedSlug && page > 1) {
      fetchCategoryData(page);
    }
  }, [resolvedSlug, page]);

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
          <div>
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
                    <Link href={`/article/${article.id}`} className={styles.articleLink}>
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
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}
          </div>

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