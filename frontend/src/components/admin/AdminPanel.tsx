'use client';

import { useState, useEffect } from 'react';
import { Article } from '@/lib/types';
import ArticlesTab from './ArticlesTab';
import CategoriesTab from './CategoriesTab';
import GlossaryTab from './GlossaryTab';
import ToolsTab from './ToolsTab';
import ServicesTab from './ServicesTab';
import api from '@/api/api';

// Define extended interfaces
interface ExtendedCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  articles_count?: number;
}

interface ExtendedArticle extends Article {
  category_id?: number;
  image_url?: string;
  video_url?: string;
  content?: string;
}

const AdminPanel = () => {
  const [categories, setCategories] = useState<ExtendedCategory[]>([]);
  const [articles, setArticles] = useState<ExtendedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'articles' | 'categories' | 'glossary' | 'tools' | 'services'>('articles');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Получаем категории
        const categoriesRes = await api.get<ExtendedCategory[]>('/categories');
        setCategories(categoriesRes.data);

        // Получаем статьи
        const articlesRes = await api.get<ExtendedArticle[]>('/articles');
        setArticles(articlesRes.data);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-white text-lg">Загрузка панели администратора...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 px-6 py-8 border-b border-white/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Панель администратора
                </h1>
                <p className="text-gray-400 mt-2">Управление контентом сайта</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-sm flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></div>
                  Администратор
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('articles')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === 'articles' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Статьи
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === 'categories' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M17 10a1 1 0 01-1 1h-6a1 1 0 110-2h6a1 1 0 011 1zM8 10a1 1 0 01-1 1H3a1 1 0 110-2h4a1 1 0 011 1z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M17 3a1 1 0 01-1 1h-6a1 1 0 110-2h6a1 1 0 011 1zM8 3a1 1 0 01-1 1H3a1 1 0 110-2h4a1 1 0 011 1z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M17 17a1 1 0 01-1 1h-6a1 1 0 110-2h6a1 1 0 011 1zM8 17a1 1 0 01-1 1H3a1 1 0 110-2h4a1 1 0 011 1z" clipRule="evenodd" />
                </svg>
                Категории
              </button>
              <button
                onClick={() => setActiveTab('glossary')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === 'glossary' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Глоссарий
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === 'tools' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Инструменты
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === 'services' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                Сервисы
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {activeTab === 'articles' ? (
              <ArticlesTab categories={categories} articles={articles} setArticles={setArticles} setCategories={setCategories} />
            ) : activeTab === 'categories' ? (
              <CategoriesTab categories={categories} setCategories={setCategories} />
            ) : activeTab === 'glossary' ? (
              <GlossaryTab />
            ) : activeTab === 'tools' ? (
              <ToolsTab />
            ) : (
              <ServicesTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;