'use client'

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/api/api';
import './SearchResults.css';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  published_at: string;
  image_url: string;
  views_count: number;
}

export default function SearchResults() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setArticles([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        // The backend returns { articles: [...], categories: [...], topics: [...] }
        // We only need the articles for this page
        const articlesData = res.data.articles || [];
        setArticles(articlesData);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Не удалось выполнить поиск');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="search-results-page">
      <div className="search-results-header">
        <h1 className="search-results-title">Результаты поиска</h1>
        <p className="search-results-query">По запросу: <strong>"{query}"</strong></p>
      </div>

      {error && (
        <div className="search-results-error">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="search-results-loading">
          <div className="spinner"></div>
          <p>Поиск статей...</p>
        </div>
      ) : (
        <div className="search-results-content">
          {articles.length > 0 ? (
            <>
              <p className="search-results-count">{articles.length} найденных статей</p>
              <div className="search-results-grid">
                {articles.map(article => (
                  <div key={article.id} className="article-card">
                    <div className="article-card-content">
                      <h3 className="article-title">{article.title}</h3>
                      {article.excerpt && (
                        <p className="article-excerpt">{article.excerpt}</p>
                      )}
                      <div className="article-meta">
                        {article.category && (
                          <span className="article-category">{article.category.name}</span>
                        )}
                        {article.published_at && (
                          <span className="article-date">
                            {new Date(article.published_at).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                      </div>
                      <a href={`/article/${article.id}`} className="article-link">
                        Читать далее
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="search-results-empty">
              <p>По вашему запросу ничего не найдено</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}