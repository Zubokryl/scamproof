import { useState, useEffect } from 'react';
import api from '@/api/api';

interface Article {
  id: number;
  title: string;
  content: string;
  slug?: string;
  pdf_url?: string;
  published_at: string;
  category_id?: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  author?: {
    id: number;
    name: string;
  };
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  thumbnail_url?: string;
  video_url?: string;
  user_has_liked?: boolean;
  guest_has_liked?: boolean;
}

export const useArticle = (id: string | string[] | undefined, user: any | null) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        // Ensure id is a string
        const articleId = Array.isArray(id) ? id[0] : id;
        
        // Validate that id is a valid string and is numeric
        if (!articleId || typeof articleId !== 'string' || articleId.trim() === '' || !/^\d+$/.test(articleId)) {
          setError('Invalid article ID');
          setLoading(false);
          return;
        }
        
        const { data } = await api.get(`/articles/${articleId}`);
        setArticle(data);
        setError(null);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Статья не найдена');
        } else {
          setError('Ошибка загрузки статьи');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  return { article, loading, error, setArticle };
};