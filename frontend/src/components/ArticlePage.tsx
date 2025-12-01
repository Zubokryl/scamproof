'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/api/api';
import styles from './ArticlePage.module.css';

interface Article {
  id: number;
  title: string;
  content: string;
  slug?: string;
  pdf_url?: string;
  published_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  author?: {
    name: string;
  };
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  landing_enabled?: boolean;
  articles_count?: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

const ArticlePage = () => {
  const params = useParams();
  const id = params.id || params.slug; // Support both id and slug parameters
  
  const [article, setArticle] = useState<Article | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to sanitize and prepare content
  const prepareContent = (content: string): string => {
    if (!content) return '';
    
    // Decode HTML entities if needed
    const textArea = document.createElement('textarea');
    textArea.innerHTML = content;
    const decodedContent = textArea.value;
    
    return decodedContent;
  };
  
  // Helper function to parse dates more robustly
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    // Handle ISO format with microseconds (replace microseconds with milliseconds)
    if (dateString.includes('.')) {
      // Replace microseconds (6 digits after decimal) with milliseconds (3 digits)
      const normalizedDateString = dateString.replace(/(\.\d{3})\d*/, '$1');
      
      const date = new Date(normalizedDateString);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Try different date parsing approaches
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // If the above fails, try parsing as a timestamp
    const timestamp = Date.parse(dateString);
    if (!isNaN(timestamp)) {
      const dateFromTimestamp = new Date(timestamp);
      return dateFromTimestamp;
    }
    
    return null;
  };
  
  // Helper function to format date for display
  const formatDate = (dateString: string): string => {
    const date = parseDate(dateString);
    if (!date) return 'Дата не указана';
    
    return date.toLocaleDateString('ru-RU');
  };

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        // Fetch article data
        const articleResponse = await api.get(`/articles/${id}`);
        
        // Extract article data (now single-wrapped after backend change)
        const articleData = articleResponse.data;
        setArticle(articleData);
        
        // Fetch category data if not already included in the article
        if (articleData.category) {
          setCategory(articleData.category);
        } else if (articleData.category_id) {
          const categoryResponse = await api.get(`/categories/${articleData.category_id}`);
          const categoryData = categoryResponse.data;
          setCategory(categoryData);
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Не удалось загрузить статью');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id, params.id, params.slug]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Загрузка статьи...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h1 className={styles.errorTitle}>Ошибка</h1>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className={styles.notFoundContainer}>
        <h1 className={styles.notFoundTitle}>Статья не найдена</h1>
        <p className={styles.notFoundMessage}>Запрашиваемая статья не существует или была удалена.</p>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <article className={styles.article}>
        <header className={styles.header}>
          <h1 className={styles.title}>{article.title}</h1>
          <div className={styles.meta}>
            {(category || article.category) && (
              <Link href={`/database/${(category || article.category)?.slug}`} className={styles.category}>
                Категория: {(category || article.category)?.name}
              </Link>
            )}
            <span className={styles.author}>
              Автор: admin
            </span>
          </div>
        </header>
        
        <div 
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: prepareContent(article.content || '') }}
        />
          
        <footer className={styles.footer}>
          <div className={styles.stats}>
            {article.views_count !== undefined && (
              <span className={styles.statItem}>
                👁️ {article.views_count} просмотров
              </span>
            )}
            {article.likes_count !== undefined && (
              <span className={styles.statItem}>
                👍 {article.likes_count} лайков
              </span>
            )}
            {article.comments_count !== undefined && (
              <span className={styles.statItem}>
                💬 {article.comments_count} комментариев
              </span>
            )}
          </div>
        </footer>
      </article>
    </div>
  );
};

export default ArticlePage;