"use client";
import { useState, useEffect } from 'react';
import { NormalizedArticle } from '@/lib/news/types';
import './LatestNews.css';

// Extend the NormalizedArticle type to include category
interface CategorizedArticle extends NormalizedArticle {
  category: string;
}

export default function LatestNews() {
  const [articles, setArticles] = useState<CategorizedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestFraudNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/news');
        const result = await response.json();
        
        if (result.success) {
          // Ensure we always have exactly 6 articles
          const articlesToDisplay = result.data.slice(0, 6);
          setArticles(articlesToDisplay);
        } else {
          setError('Не удалось загрузить последние новости');
        }
      } catch (err) {
        setError('Не удалось загрузить последние новости');
        console.error('Error fetching fraud news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestFraudNews();
  }, []);

  if (loading) {
    return (
      <section className="latest-news-section">
        <div className="container">
          <h2>Последние новости</h2>
          <p>Загрузка новостей...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="latest-news-section">
        <div className="container">
          <h2>Последние новости</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Повторить попытку
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="latest-news-section">
      <div className="container">
        <h2>Последние новости</h2>
        {articles.length > 0 ? (
          <div className="news-grid">
            {articles.map((article) => (
              <div key={article.id} className="news-card">
                <div className="news-card-content">
                  <div className="news-header">
                    <span className="news-source">{article.source}</span>
                    <span className="news-category">{article.category}</span>
                  </div>
                  <h3 className="news-title">{article.title}</h3>
                  {article.description && (
                    <p className="news-excerpt">
                      {article.description.substring(0, 150)}...
                    </p>
                  )}
                  <div className="news-meta">
                    <span className="news-date">
                      {new Date(article.published_at).toLocaleDateString('ru-RU')}
                    </span>
                    {article.author && (
                      <span className="news-author">Источник: {article.author}</span>
                    )}
                  </div>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="news-link"
                  >
                    Читать далее
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Новости пока отсутствуют.</p>
        )}
      </div>
    </section>
  );
}