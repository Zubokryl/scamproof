'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/api';
import styles from './CreateTopic.module.css';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function CreateTopicPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      console.log('Categories response:', response.data);
      setCategories(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке категорий:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('Submitting topic with categoryId:', categoryId, 'type:', typeof categoryId);

    try {
      const requestData = {
        title,
        content,
        ...(categoryId && { category_id: categoryId }),
      };
      
      console.log('Request data:', requestData);
      
      const response = await api.post('/forum/topics', requestData);

      // Redirect to the newly created topic
      // The response structure might be response.data or response.data.data
      const topicData = response.data.data || response.data;
      if (topicData && topicData.slug) {
        router.push(`/forum/topic/${topicData.slug}`);
      } else {
        // Fallback to forum page if slug is not available
        router.push('/forum');
      }
    } catch (err: any) {
      console.error('Ошибка при создании темы:', err);
      setError(err.response?.data?.message || 'Не удалось создать тему');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Создать новую тему</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Заголовок темы
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            placeholder="Введите понятный заголовок для вашей темы"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            Категория (необязательно)
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'other') {
                setCategoryId('');
              } else {
                setCategoryId(value ? parseInt(value, 10) : '');
              }
            }}
            className={styles.input}
          >
            <option value="">Выберите категорию (необязательно)</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
            <option value="other">Другое</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="content" className={styles.label}>
            Содержание
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.textarea}
            placeholder="Поделитесь своими мыслями, вопросами или опытом..."
            rows={10}
            required
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.cancelButton}
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Создание...' : 'Создать тему'}
          </button>
        </div>
      </form>
    </div>
  );
}
