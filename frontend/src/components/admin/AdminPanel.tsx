'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/api/api';
import ArticlesTab from './ArticlesTab';
import CategoriesTab from './CategoriesTab';
import GlossaryTab from './GlossaryTab';
import ToolsTab from './ToolsTab';
import ServicesTab from './ServicesTab';
import CommentModerationTab from './CommentModerationTab';
import './AdminPanel.css';

// Define extended interfaces
interface ExtendedCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  articles_count?: number;
}

interface ExtendedArticle {
  id: number;
  title: string;
  content: string;
  slug: string;
  published_at?: string;
  pdf_url?: string;
  views_count?: number;
  
  // Additional fields from API response
  category: {
    id: number;
    name: string;
    slug: string;
  };
  
  // Fields used in the component
  category_id: number;
  image_url?: string;
  video_url?: string;
  status?: string;
  created_at?: string;
}

const AdminPanel = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<ExtendedCategory[]>([]);
  const [articles, setArticles] = useState<ExtendedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'articles' | 'categories' | 'glossary' | 'tools' | 'services' | 'comments'>('articles');

  // Check for edit parameter on component mount
  useEffect(() => {
    const editParam = searchParams.get('edit');
    if (editParam) {
      // If edit parameter exists, make sure we're on the articles tab
      setActiveTab('articles');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Получаем категории
        const categoriesRes = await api.get<any>('/categories');
        // Extract categories from paginated response if needed
        const categoriesData = categoriesRes.data.data || categoriesRes.data;
        setCategories(categoriesData);

        // Получаем статьи
        const articlesRes = await api.get<any>('/articles');
        // Extract articles from paginated response
        const articlesData = articlesRes.data.data || articlesRes.data;
        console.log('Articles loaded:', articlesData);
        
        // Log detailed article data
        console.log('Detailed article data:');
        if (Array.isArray(articlesData)) {
          articlesData.forEach((article, index) => {
            console.log(`Article ${index}:`, {
              id: article.id,
              title: article.title,
              content: article.content?.substring(0, 100) + '...',
              category: article.category,
              category_id: article.category_id
            });
          });
        }
        
        // CRITICAL: Remove the problematic mapping that was overwriting correct data
        // The backend already sends properly structured data with category information
        console.log('Setting articles directly without mapping');
        setArticles(articlesData);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="admin-panel-container">
        <div className="admin-panel-card">
          <div className="admin-loading-container">
            <div className="admin-loading-spinner"></div>
            <p className="admin-loading-text">Загрузка панели администратора...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel-container">
      <div className="admin-panel-card">
        {/* Header */}
        <div className="admin-panel-header">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="admin-panel-title">
                Панель администратора
              </h1>
              <p className="admin-panel-subtitle">Управление контентом сайта</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="admin-status-badge">
                <div className="admin-status-indicator"></div>
                Администратор
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs-container">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('articles')}
              className={`admin-tab-button ${activeTab === 'articles' ? 'active' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-tab-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              Статьи
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`admin-tab-button ${activeTab === 'categories' ? 'active' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-tab-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M17 10a1 1 0 01-1 1h-6a1 1 0 110-2h6a1 1 0 011 1zM8 10a1 1 0 01-1 1H3a1 1 0 110-2h4a1 1 0 011 1z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M17 3a1 1 0 01-1 1h-6a1 1 0 110-2h6a1 1 0 011 1zM8 3a1 1 0 01-1 1H3a1 1 0 110-2h4a1 1 0 011 1z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M17 17a1 1 0 01-1 1h-6a1 1 0 110-2h6a1 1 0 011 1zM8 17a1 1 0 01-1 1H3a1 1 0 110-2h4a1 1 0 011 1z" clipRule="evenodd" />
              </svg>
              Категории
            </button>
            <button
              onClick={() => setActiveTab('glossary')}
              className={`admin-tab-button ${activeTab === 'glossary' ? 'active' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-tab-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Глоссарий
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`admin-tab-button ${activeTab === 'tools' ? 'active' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-tab-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Инструменты
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`admin-tab-button ${activeTab === 'services' ? 'active' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-tab-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              Сервисы
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`admin-tab-button ${activeTab === 'comments' ? 'active' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-tab-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
              </svg>
              Комментарии
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="admin-content-area">
          {activeTab === 'articles' ? (
            <ArticlesTab 
              categories={categories} 
              articles={articles} 
              setArticles={setArticles} 
              setCategories={setCategories}
              editArticleId={searchParams.get('edit') ? parseInt(searchParams.get('edit') || '0', 10) : undefined}
            />
          ) : activeTab === 'categories' ? (
            <CategoriesTab categories={categories} setCategories={setCategories} />
          ) : activeTab === 'glossary' ? (
            <GlossaryTab />
          ) : activeTab === 'tools' ? (
            <ToolsTab />
          ) : activeTab === 'comments' ? (
            <CommentModerationTab />
          ) : (
            <ServicesTab />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;