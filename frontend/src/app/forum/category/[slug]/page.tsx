'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/api';
import styles from './CategoryPage.module.css';

interface ForumTopic {
  id: number;
  title: string;
  slug: string;
  content: string;
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
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export default function CategoryForumPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchCategoryTopics();
    }
  }, [slug]);

  const fetchCategoryTopics = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching category topics for slug:', slug);
      
      // Fetch category info
      if (slug !== 'other') {
        const categoryResponse = await api.get(`/categories/${slug}`);
        console.log('Category response:', categoryResponse.data);
        setCategory(categoryResponse.data);
      } else {
        setCategory({
          id: 0,
          name: 'Другие темы',
          slug: 'other',
          description: 'Обсуждения, которые не подходят под другие категории',
          icon: '❓'
        });
      }
      
      // Fetch topics for this specific category (efficiently from backend)
      const topicsResponse = await api.get(`/forum/topics/category/${slug}`);
      console.log('Topics response:', topicsResponse.data);
      setTopics(topicsResponse.data);
    } catch (err) {
      console.error('Ошибка при загрузке тем категории:', err);
      setError('Не удалось загрузить темы категории');
    } finally {
      setLoading(false);
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
        <div className={styles.loading}>Загрузка тем категории...</div>
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
        <div className={styles.categoryInfo}>
          {category && (
            <>
              <div className={styles.categoryIcon}>{category.icon}</div>
              <div>
                <h1 className={styles.title}>{category.name}</h1>
                <p className={styles.description}>{category.description}</p>
              </div>
            </>
          )}
        </div>
        {user && (
          <Link href="/forum/create" className={styles.createButton}>
            Создать новую тему
          </Link>
        )}
      </div>

      <div className={styles.topicsList}>
        {topics.length > 0 ? (
          topics.map((topic) => (
            <div 
              key={topic.id} 
              className={`${styles.topicCard} ${topic.is_pinned ? styles.pinned : ''}`}
            >
              <div className={styles.topicContent}>
                <h2 className={styles.topicTitle}>
                  <Link href={`/forum/topic/${topic.slug}`} className={styles.topicLink}>
                    {topic.is_pinned && <span className={styles.pinnedBadge}>📌</span>}
                    {topic.title}
                  </Link>
                </h2>
                <p className={styles.topicExcerpt}>
                  {topic.content.substring(0, 150)}...
                </p>
                <div className={styles.topicMeta}>
                  <span className={styles.author}>Автор: {topic.author.name}</span>
                  <span className={styles.stats}>
                    <span className={styles.replies}>{topic.replies_count} ответов</span>
                    <span className={styles.likes}>{topic.likes_count} лайков</span>
                  </span>
                </div>
                <div className={styles.topicDate}>
                  {formatDate(topic.created_at)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noTopics}>
            <p>В этой категории пока нет тем. Будьте первым, кто начнет обсуждение!</p>
            {user && (
              <Link href="/forum/create" className={styles.createFirstButton}>
                Создать первую тему
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}