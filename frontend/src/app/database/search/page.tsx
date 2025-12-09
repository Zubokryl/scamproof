'use client'

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchArticles } from '@/services/articles';
import { Article } from '@/types/articles';
import ArticleCard from '@/components/ArticleCard';
import './SearchResults.css';

export default function SearchResults() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const fetchSearchResults = useCallback(async () => {
    if (!query.trim()) {
      setArticles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const articlesData = await searchArticles(query);
      setArticles(articlesData);
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError('Не удалось выполнить поиск');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  // Don't render anything if query is empty
  if (!query.trim()) {
    return (
      <div className="search-results-page">
        <div className="search-results-header">
          <h1 className="search-results-title">Результаты поиска</h1>
          <p className="search-results-query">Введите поисковый запрос</p>
        </div>
        <div className="search-results-empty">
          <p>Пожалуйста, введите запрос для поиска статей</p>
        </div>
      </div>
    );
  }

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
                  <ArticleCard key={article.id} article={article} />
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