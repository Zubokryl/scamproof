'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/api';
import styles from './CreateTopic.module.css';

export default function CreateTopicPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock categories - in a real app, you would fetch these from the API
  const categories = [
    { id: 1, name: 'Здоровье', slug: 'health' },
    { id: 2, name: 'Финансы', slug: 'finance' },
    { id: 3, name: 'Технологии', slug: 'technology' },
    { id: 4, name: 'Образование', slug: 'education' },
    { id: 5, name: 'Другое', slug: 'other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !categoryId) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    if (!user) {
      setError('Вы должны быть авторизованы для создания темы');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/forum/topics', {
        title,
        content,
        category_id: parseInt(categoryId)
      });
      
      // Redirect to the newly created topic
      router.push(`/forum/topic/${response.data.slug}`);
    } catch (err: any) {
      console.error('Error creating topic:', err);
      setError(err.response?.data?.message || 'Ошибка при создании темы');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Вы должны <a href="/login" className={styles.link}>войти</a> или <a href="/register" className={styles.link}>зарегистрироваться</a> для создания темы.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Создать новую тему</h1>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
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
            placeholder="Введите заголовок темы"
            maxLength={100}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            Категория
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={styles.select}
            required
          >
            <option value="">Выберите категорию</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="content" className={styles.label}>
            Содержание темы
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.textarea}
            placeholder="Введите содержание темы"
            rows={10}
            required
          />
        </div>
        
        <div className={styles.buttonGroup}>
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