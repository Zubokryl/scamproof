'use client';

import { Category, Article } from '@/lib/types';
import { Dispatch, SetStateAction, useState, useRef, useEffect } from 'react';
import api from '@/api/api';

interface ExtendedArticle extends Article {
  category_id?: number;
  image_url?: string;
  video_url?: string;
  content?: string;
}

interface ArticlesTabProps {
  categories: Category[];
  articles: ExtendedArticle[];
  setArticles: Dispatch<SetStateAction<ExtendedArticle[]>>;
  setCategories: Dispatch<SetStateAction<Category[]>>;
}

const ArticlesTab: React.FC<ArticlesTabProps> = ({ categories, articles, setArticles, setCategories }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ExtendedArticle | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    image: null as File | null,
    video: null as File | null
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCreate = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      content: '',
      category_id: '',
      image: null,
      video: null
    });
    setPreviewImage(null);
    setPreviewVideo(null);
    setIsFormVisible(true);
  };

  const handleEdit = (article: ExtendedArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content || '',
      category_id: article.category_id?.toString() || '',
      image: null,
      video: null
    });
    setPreviewImage(article.image_url || null);
    setPreviewVideo(article.video_url || null);
    setIsFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      try {
        await api.delete(`/articles/${id}`);
        setArticles(articles.filter(article => article.id !== id));
      } catch (error) {
        console.error('Ошибка при удалении статьи:', error);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, [type]: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'image') {
          setPreviewImage(e.target?.result as string);
        } else {
          setPreviewVideo(e.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Rich text editor functions
  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
  };

  const handleContentChange = () => {
    if (contentRef.current) {
      setFormData({ ...formData, content: contentRef.current.innerHTML });
    }
  };

  // Initialize content when editing
  useEffect(() => {
    if (contentRef.current && editingArticle) {
      contentRef.current.innerHTML = formData.content;
    }
  }, [editingArticle, formData.content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category_id', formData.category_id);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      if (formData.video) {
        formDataToSend.append('video', formData.video);
      }
      
      if (editingArticle) {
        // Update existing article
        const res = await api.post(`/articles/${editingArticle.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setArticles(articles.map(article => article.id === editingArticle.id ? res.data : article));
      } else {
        // Create new article
        const res = await api.post('/articles', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setArticles([...articles, res.data]);
      }
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        category_id: '',
        image: null,
        video: null
      });
      setPreviewImage(null);
      setPreviewVideo(null);
      setEditingArticle(null);
      setIsFormVisible(false);
    } catch (error) {
      console.error('Ошибка при сохранении статьи:', error);
    }
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingArticle(null);
    setFormData({
      title: '',
      content: '',
      category_id: '',
      image: null,
      video: null
    });
    setPreviewImage(null);
    setPreviewVideo(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">Статьи</h2>
          <p className="text-gray-400 text-sm mt-1">Управляйте контентом вашего сайта</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Добавить статью
        </button>
      </div>

      {isFormVisible && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6 animate-fadeIn">
          <h3 className="text-xl font-semibold text-white mb-6 pb-2 border-b border-slate-700">
            {editingArticle ? 'Редактировать статью' : 'Добавить новую статью'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="admin-form-label">Заголовок</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="admin-form-input w-full"
                placeholder="Введите заголовок статьи"
                required
              />
            </div>
            
            <div>
              <label className="admin-form-label">Категория</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                className="admin-form-input w-full"
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="admin-form-label">Содержание</label>
              
              {/* Rich text editor toolbar */}
              <div className="admin-toolbar">
                <button
                  type="button"
                  onClick={() => formatText('bold')}
                  className="admin-toolbar-button"
                  title="Жирный"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => formatText('italic')}
                  className="admin-toolbar-button"
                  title="Курсив"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => formatText('underline')}
                  className="admin-toolbar-button"
                  title="Подчеркнутый"
                >
                  <u>U</u>
                </button>
                <div className="admin-toolbar-divider"></div>
                <button
                  type="button"
                  onClick={() => formatText('justifyLeft')}
                  className="admin-toolbar-button"
                  title="По левому краю"
                >
                  ≡
                </button>
                <button
                  type="button"
                  onClick={() => formatText('justifyCenter')}
                  className="admin-toolbar-button"
                  title="По центру"
                >
                  ≡
                </button>
                <button
                  type="button"
                  onClick={() => formatText('justifyRight')}
                  className="admin-toolbar-button"
                  title="По правому краю"
                >
                  ≡
                </button>
                <div className="admin-toolbar-divider"></div>
                <button
                  type="button"
                  onClick={() => formatText('insertUnorderedList')}
                  className="admin-toolbar-button"
                  title="Маркированный список"
                >
                  •
                </button>
                <button
                  type="button"
                  onClick={() => formatText('insertOrderedList')}
                  className="admin-toolbar-button"
                  title="Нумерованный список"
                >
                  1.
                </button>
                <div className="admin-toolbar-divider"></div>
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('Введите URL:', 'https://');
                    if (url) formatText('createLink', url);
                  }}
                  className="admin-toolbar-button"
                  title="Вставить ссылку"
                >
                  🔗
                </button>
                <button
                  type="button"
                  onClick={() => formatText('insertHorizontalRule')}
                  className="admin-toolbar-button"
                  title="Вставить горизонтальную линию"
                >
                  ―
                </button>
              </div>
              
              {/* Content editor */}
              <div
                ref={contentRef}
                contentEditable
                onInput={handleContentChange}
                className="admin-editor w-full min-h-[300px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="admin-form-label">Изображение</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-400">Нажмите для загрузки изображения</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, 'image')} 
                      className="hidden" 
                    />
                  </label>
                </div>
                {previewImage && (
                  <div className="mt-3 relative group">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-40 object-cover rounded-lg border border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setFormData({...formData, image: null});
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <label className="admin-form-label">Видео</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-400">Нажмите для загрузки видео</p>
                    </div>
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={(e) => handleFileChange(e, 'video')} 
                      className="hidden" 
                    />
                  </label>
                </div>
                {previewVideo && (
                  <div className="mt-3 relative group">
                    <video 
                      src={previewVideo} 
                      controls 
                      className="w-full h-40 rounded-lg border border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewVideo(null);
                        setFormData({...formData, video: null});
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {editingArticle ? 'Обновить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left p-4 text-cyan-400 font-semibold">Заголовок</th>
                <th className="text-left p-4 text-cyan-400 font-semibold">Категория</th>
                <th className="text-left p-4 text-cyan-400 font-semibold">Медиа</th>
                <th className="text-left p-4 text-cyan-400 font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => {
                const category = categories.find(cat => cat.id === article.category_id);
                return (
                  <tr key={article.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white">{article.title}</div>
                      <div className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {article.content?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      {category ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-900/50 text-cyan-300">
                          {category.name}
                        </span>
                      ) : (
                        'Неизвестная категория'
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {article.image_url && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-900/50 text-blue-300">
                            📷 Изображение
                          </span>
                        )}
                        {article.video_url && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-900/50 text-purple-300">
                            🎬 Видео
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(article)}
                          className="admin-action-button edit flex items-center gap-1 text-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="admin-action-button delete flex items-center gap-1 text-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {articles.length === 0 && (
          <div className="text-center p-12">
            <div className="mx-auto w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-1">Статей пока нет</h3>
            <p className="text-gray-500">Добавьте первую статью, чтобы начать</p>
            <button
              onClick={handleCreate}
              className="mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Создать первую статью
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesTab;