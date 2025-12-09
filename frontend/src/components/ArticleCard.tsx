import React from 'react';
import { Article } from '@/types/articles';
import './ArticleCard.css';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <div className="article-card">
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
  );
};

export default ArticleCard;