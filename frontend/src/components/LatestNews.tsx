"use client";
import { useState, useEffect } from 'react';
import { NormalizedArticle } from '@/lib/news/types';
import './LatestNews.css';

// Update interval to check for new data (every 30 minutes)
const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

export default function LatestNews() {
  const [articles, setArticles] = useState<NormalizedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchLatestFraudNews = async () => {
    try {
      setLoading(true);
      console.log('Fetching latest fraud news...');
      const response = await fetch('/api/news');
      const result = await response.json();
      console.log('News API response:', result);
      
      if (result.success) {
        // Ensure we always have exactly 6 articles
        const articlesToDisplay = result.data.slice(0, 6);
        setArticles(articlesToDisplay);
        setLastUpdated(result.lastUpdated || new Date().toISOString());
        setError(null);
        console.log(`Displaying ${articlesToDisplay.length} articles`);
      } else {
        throw new Error(result.error || 'Failed to load news');
      }
    } catch (err) {
      setError('Не удалось загрузить последние новости');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestFraudNews();
    
    // Set up interval to check for updates
    const interval = setInterval(() => {
      fetchLatestFraudNews();
    }, CHECK_INTERVAL);
    
    return () => clearInterval(interval);
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
          <p className="error-message">{error}</p>
          <button 
            className="retry-button"
            onClick={fetchLatestFraudNews}
          >
            Попробовать снова
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
          <>
            <div className="news-grid">
              {articles.map((article) => (
                <div key={article.id} className="news-card">
                  <div className="news-card-content">
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
            {lastUpdated && (
              <div className="last-updated">
                Обновлено: {new Date(lastUpdated).toLocaleString('ru-RU')}
              </div>
            )}
          </>
        ) : (
          <p>Новости пока отсутствуют.</p>
        )}
      </div>
    </section>
  );
}