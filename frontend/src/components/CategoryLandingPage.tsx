'use client';

import { useState, useEffect } from 'react';
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
  thumbnail_url?: string;
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

interface CategoryLandingPageProps {
  slug?: string;
}

const CategoryLandingPage = ({ slug }: CategoryLandingPageProps) => {
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to strip HTML tags and get plain text
  const stripHtmlTags = (html: string): string => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Function to fetch category and articles data
  const fetchCategoryData = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);

      if (!slug) {
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

      if (!result) {
        setError("Не удалось загрузить данные категории");
        setLoading(false);
        return;
      }

      if (pageNum === 1) {
        setCategory(result.category);
        // Handle paginated response - articles are in result.articles.data
        const articlesData = result.articles?.data || [];
        setArticles(articlesData);
      } else {
        // Handle paginated response - articles are in result.articles.data
        const articlesData = result.articles?.data || [];
        setArticles(prev => [
          ...prev,
          ...articlesData
        ]);
      }

      // Handle pagination metadata
      setHasMore(!!result.articles?.next_page_url);

    } catch (err: any) {
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
  };

  // Initial data fetch
  useEffect(() => {
    if (slug) {
      // Reset state when slug changes
      setCategory(null);
      setArticles([]);
      setPage(1);
      setHasMore(true);
      setError(null);
      fetchCategoryData(1);
    } else {
      setLoading(false);
    }
  }, [slug]);

  // Fetch additional pages when page number changes
  useEffect(() => {
    if (slug && page > 1) {
      fetchCategoryData(page);
    }
  }, [page, slug]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

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

  if (loading && !category && articles.length === 0) {
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
              <p className={styles.description}>
                {category?.description || 'Описание категории'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Articles Grid */}
        <div className="container mx-auto px-4 py-8">
          {articles.length === 0 && !loading ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📰</div>
              <h3 className={styles.emptyTitle}>Статей пока нет</h3>
              <p className={styles.emptyText}>В этой категории пока нет опубликованных статей.</p>
            </div>
          ) : (
            <>
              <div className={styles.articlesGrid}>
                {articles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={styles.articleCard}
                  >
                    <Link href={`/article/${article.id}`} className={styles.articleLink}>
                      <div className={styles.articleImageWrapper}>
                        {article.thumbnail_url ? (
                          <img 
                            src={article.thumbnail_url} 
                            alt={article.title}
                            className={styles.articleImage}
                            loading="lazy"
                          />
                        ) : (
                          <div className={styles.placeholderImage}>
                            <span className={styles.placeholderIcon}>📄</span>
                          </div>
                        )}
                        {article.video_url && (
                          <div className={styles.videoIndicator}>
                            <span className={styles.videoIcon}>▶️</span>
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.articleContent}>
                        <h2 className={styles.articleTitle}>
                          {article.title}
                        </h2>
                        
                        <p className={styles.articleExcerpt}>
                          {stripHtmlTags(article.content).substring(0, 120)}
                          {stripHtmlTags(article.content).length > 120 ? '...' : ''}
                        </p>
                        
                        <div className={styles.articleMeta}>
                          <div className={styles.metaItem}>
                            <Clock className={styles.metaIcon} size={14} />
                            <span className={styles.metaText}>
                              {new Date(article.published_at).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                          
                          <div className={styles.metaItem}>
                            <ThumbsUp className={styles.metaIcon} size={14} />
                            <span className={styles.metaText}>
                              {article.likes_count}
                            </span>
                          </div>
                          
                          <div className={styles.metaItem}>
                            <MessageCircle className={styles.metaIcon} size={14} />
                            <span className={styles.metaText}>
                              {article.comments_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Loading indicator for pagination */}
              {loading && page > 1 && (
                <div className={styles.paginationLoader}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Загрузка еще статей...</p>
                </div>
              )}

              {/* Load more button */}
              {hasMore && !loading && (
                <div className={styles.loadMoreContainer}>
                  <button 
                    onClick={loadMore}
                    className={styles.loadMoreButton}
                  >
                    Загрузить еще
                  </button>
                </div>
              )}

              {/* End of results indicator */}
              {!hasMore && articles.length > 0 && (
                <div className={styles.endOfResults}>
                  <p>🎉 Вы достигли конца списка</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </LayoutWithNavAndFooter>
  );
};

export default CategoryLandingPage;