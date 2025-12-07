'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/api/api';
import styles from './CategoriesPage.module.css';

interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  articles_count: number;
  forum_topics_count: number;
}

export default function ForumCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories/with-landings');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading categories...</div>
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
        <h1 className={styles.title}>Forum Categories</h1>
        <p className={styles.subtitle}>
          Browse topics by category or create a new discussion
        </p>
      </div>

      <div className={styles.categoriesGrid}>
        {categories.map((category) => (
          <div key={category.id} className={styles.categoryCard}>
            <div className={styles.categoryIcon}>{category.icon}</div>
            <h2 className={styles.categoryName}>
              <Link href={`/forum/category/${category.slug}`} className={styles.categoryLink}>
                {category.name}
              </Link>
            </h2>
            <p className={styles.categoryDescription}>{category.description}</p>
            <div className={styles.categoryStats}>
              <span className={styles.statItem}>
                {category.articles_count} articles
              </span>
              <span className={styles.statItem}>
                {category.forum_topics_count} topics
              </span>
            </div>
          </div>
        ))}
        
        {/* "Other" category */}
        <div className={styles.categoryCard}>
          <div className={styles.categoryIcon}>❓</div>
          <h2 className={styles.categoryName}>
            <Link href="/forum/category/other" className={styles.categoryLink}>
              Other Topics
            </Link>
          </h2>
          <p className={styles.categoryDescription}>
            Discussions that don't fit into other categories
          </p>
          <div className={styles.categoryStats}>
            <span className={styles.statItem}>
              Uncategorized discussions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}