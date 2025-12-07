'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/api';
import styles from './ForumPage.module.css';

interface ForumTopic {
  id: number;
  title: string;
  slug: string;
  replies_count: number;
  likes_count: number;
  is_pinned: boolean;
  created_at: string;
  author: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  articles_count: number;
  forum_topics_count: number;
}

export default function ForumPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentTopics, setRecentTopics] = useState<ForumTopic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Remove expandedCategory and categoryTopics since we're using separate pages

  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchRecentTopics()
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      console.log('Categories response:', response.data);
      setCategories(response.data);
      
      // Log specific category info
      const commerceCategory = response.data.find((cat: any) => cat.slug === 'commercial');
      if (commerceCategory) {
        console.log('Commerce category:', commerceCategory);
      }
    } catch (err) {
      console.error('Ошибка при загрузке категорий форума:', err);
      setError('Не удалось загрузить категории форума');
    }
  };

  const fetchRecentTopics = async () => {
    try {
      const response = await api.get('/forum/topics/latest');
      setRecentTopics(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке последних тем:', err);
    }
  };
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await api.get('/search', {
        params: { q: searchQuery.trim() }
      });
      
      // Filter to only forum topics
      const forumTopics = response.data.topics || [];
      setSearchResults(forumTopics);
    } catch (err) {
      console.error('Ошибка поиска:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка форума...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {user && (
          <Link href="/forum/create" className={styles.createButton}>
            Создать новую тему
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className={styles.searchSection}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по темам форума..."
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton} disabled={searchLoading}>
            {searchLoading ? 'Поиск...' : 'Найти'}
          </button>
        </form>
        
        {/* Search Results */}
        {searchQuery && (
          <div className={styles.searchResults}>
            <h3 className={styles.searchResultsTitle}>
              Результаты поиска для "{searchQuery}":
            </h3>
            {searchLoading ? (
              <div className={styles.searchLoading}>Поиск...</div>
            ) : searchResults.length > 0 ? (
              <div className={styles.searchResultsList}>
                {searchResults.map((topic) => (
                  <div key={topic.id} className={styles.searchResultItem}>
                    <Link href={`/forum/topic/${topic.slug}`} className={styles.searchResultLink}>
                      {topic.title}
                    </Link>
                    <div className={styles.searchResultMeta}>
                      <span>Категория: {topic.category?.name || 'Без категории'}</span>
                      <span>{formatDate(topic.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>Ничего не найдено</div>
            )}
          </div>
        )}
      </div>

      <div className={styles.content}>
        {/* Left Column - Categories */}
        <div className={styles.leftColumn}>
          <h2 className={styles.sectionTitle}>Категории форума</h2>
          <div className={styles.categoriesList}>
            {categories.map((category) => (
              <div key={category.id} className={styles.categoryItem}>
                <div 
                  className={styles.categoryHeader}
                >
                  <Link href={`/forum/category/${category.slug}`} className={styles.categoryLink}>
                    <div className={styles.categoryIcon}>{category.icon}</div>
                    <div className={styles.categoryInfo}>
                      <h3 className={styles.categoryName}>{category.name}</h3>
                      <p className={styles.categoryDescription}>{category.description}</p>
                    </div>
                  </Link>
                  <div className={styles.categoryStats}>
                    <span className={styles.topicsCount}>{category.forum_topics_count} тем</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* "Other" category */}
            <div className={styles.categoryItem}>
              <div 
                className={styles.categoryHeader}
              >
                <Link href="/forum/category/other" className={styles.categoryLink}>
                  <div className={styles.categoryIcon}>❓</div>
                  <div className={styles.categoryInfo}>
                    <h3 className={styles.categoryName}>Другие темы</h3>
                    <p className={styles.categoryDescription}>Обсуждения, которые не подходят под другие категории</p>
                  </div>
                </Link>
                <div className={styles.categoryStats}>
                  <span className={styles.topicsCount}>-</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Topics */}
        <div className={styles.rightColumn}>
          <div className={styles.recentTopicsSection}>
            <h2 className={styles.sectionTitle}>Последние темы</h2>
            <div className={styles.recentTopicsList}>
              {recentTopics.length > 0 ? (
                recentTopics.map((topic) => (
                  <div key={topic.id} className={styles.recentTopicItem}>
                    <Link href={`/forum/topic/${topic.slug}`} className={styles.recentTopicLink}>
                      {topic.is_pinned && <span className={styles.pinnedBadge}>📌</span>}
                      {topic.title}
                    </Link>
                    <div className={styles.recentTopicMeta}>
                      <span className={styles.recentTopicCategory}>
                        Категория: {topic.category?.name || 'Без категории'}
                      </span>
                      <span className={styles.recentTopicAuthor}>Автор: {topic.author.name}</span>
                      <span className={styles.recentTopicDate}>{formatDate(topic.created_at)}</span>
                      <span className={styles.recentTopicReplies}>{topic.replies_count} ответов</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noRecentTopics}>Пока нет тем</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}