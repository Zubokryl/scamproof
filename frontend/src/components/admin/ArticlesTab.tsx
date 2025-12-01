'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import api from '@/api/api';
import { Category } from '@/lib/types';
import './ArticlesTab.css'; // локальные стили
import QuillEditor from './QuillEditor';

interface ExtendedArticle {
  id: number;
  title: string;
  content: string;
  slug: string;
  published_at?: string;
  pdf_url?: string;
  views_count?: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  category_id: number;
  image_url?: string;
  video_url?: string;
  status?: string;
  created_at?: string;
}

interface ArticlesTabProps {
  categories: Category[];
  articles: ExtendedArticle[];
  setArticles: React.Dispatch<React.SetStateAction<ExtendedArticle[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

// Иконки
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="articles-empty-icon" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 002 2H6a2 2 0 002-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const ArticlesTab: React.FC<ArticlesTabProps> = ({ categories, articles, setArticles }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ExtendedArticle | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    thumbnail: null as File | null,
    video: null as File | null
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const articlesPerPage = 10;
  const safeArticles = Array.isArray(articles) ? articles : [];
  const filteredArticles = safeArticles.filter(article =>
    (article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (article.content?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);

  const handleCreate = () => {
    setEditingArticle(null);
    setFormData({ title: '', content: '', category_id: '', thumbnail: null, video: null });
    setPreviewImage(null);
    setPreviewVideo(null);
    setIsFormVisible(true);
  };

  const handleEdit = (article: ExtendedArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title || '',
      content: article.content || '',
      category_id: article.category_id?.toString() || '',
      thumbnail: null,
      video: null
    });
    setPreviewImage(article.image_url || null);
    setPreviewVideo(article.video_url || null);
    setIsFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту статью?')) return;
    try {
      await api.delete(`/articles/${id}`);
      setArticles(prev => prev.filter(article => article.id !== id));
    } catch (err: unknown) {
      console.error('Ошибка при удалении статьи:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, [type]: file }));

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string;
      if (type === 'thumbnail') {
        setPreviewImage(result);
      } else {
        setPreviewVideo(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('category_id', formData.category_id);

      if (formData.thumbnail) data.append('thumbnail', formData.thumbnail);
      if (formData.video) data.append('video', formData.video);

      let res;
      if (editingArticle) {
        data.append('_method', 'PUT');
        res = await api.post(`/articles/${editingArticle.id}`, data);
      } else {
        res = await api.post('/articles', data);
      }

      setArticles(prev => editingArticle ? prev.map(a => a.id === editingArticle.id ? res.data : a) : [res.data, ...prev]);

      setFormData({ title: '', content: '', category_id: '', thumbnail: null, video: null });
      setPreviewImage(null);
      setPreviewVideo(null);
      setEditingArticle(null);
      setIsFormVisible(false);

      alert(editingArticle ? 'Статья обновлена!' : 'Статья создана!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || 'Ошибка сохранения статьи');
      } else {
        alert('Ошибка сохранения статьи');
      }
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingArticle(null);
    setFormData({ title: '', content: '', category_id: '', thumbnail: null, video: null });
    setPreviewImage(null);
    setPreviewVideo(null);
  };

  return (
    <div className="articles-tab-container">
      <div className="articles-header">
        <h2 className="articles-title">Управление статьями</h2>
        <div className="articles-actions">
          <button className="articles-create-button" onClick={handleCreate}>
            <PlusIcon />
            Создать статью
          </button>
        </div>
      </div>

      {isFormVisible && (
        <div className="articles-form-container">
          <h3 className="articles-form-title">{editingArticle ? 'Редактировать статью' : 'Создать новую статью'}</h3>
          <form className="articles-form" onSubmit={handleSubmit}>
            <div className="articles-form-group">
              <label className="articles-form-label">Заголовок</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="articles-form-input"
                placeholder="Введите заголовок статьи"
                required
              />
              <div className="form-hint">Обязательное поле. Будет использовано для формирования URL.</div>
            </div>

            <div className="articles-form-group">
              <label className="articles-form-label">Категория</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="articles-form-select"
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="form-hint">Обязательное поле. Выберите подходящую категорию.</div>
            </div>

            <div className="articles-form-group">
              <label className="articles-form-label">Содержание</label>
              
              <QuillEditor
                value={formData.content}
                onChange={(value: string) => setFormData(prev => ({ ...prev, content: value }))}
              />

              <div className="form-hint">Обязательное поле. Поддерживает расширенное форматирование.</div>
            </div>
            
            <div className="articles-form-row">
              <div className="articles-form-group">
                <label className="articles-form-label">Превью изображения</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'thumbnail')}
                  className="articles-form-file"
                />
                {previewImage && (
                  <div className="articles-preview-container">
                    <Image 
                      src={previewImage} 
                      alt="Превью" 
                      className="articles-preview-image" 
                      width={200}
                      height={200}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setFormData({ ...formData, thumbnail: null });
                      }}
                      className="articles-remove-preview"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              
              <div className="articles-form-group">
                <label className="articles-form-label">Видео</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'video')}
                  className="articles-form-file"
                />
                {previewVideo && (
                  <div className="articles-preview-container">
                    <video src={previewVideo} controls className="articles-preview-video" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewVideo(null);
                        setFormData({ ...formData, video: null });
                      }}
                      className="articles-remove-preview"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="articles-form-actions">
              <button 
                type="submit" 
                className="articles-submit-button"
              >
                {editingArticle ? 'Обновить статью' : 'Создать статью'}
              </button>
              <button 
                type="button" 
                onClick={handleCancel} 
                className="articles-cancel-button"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="articles-search-container">
        <input
          type="text"
          placeholder="Поиск статей..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="articles-search-input"
        />
      </div>

      {filteredArticles.length === 0 ? (
        <div className="articles-empty-state">
          <FileTextIcon />
          <p className="articles-empty-text">Статьи не найдены</p>
          <button className="articles-create-button" onClick={handleCreate}>
            <PlusIcon />
            Создать первую статью
          </button>
        </div>
      ) : (
        <>
          <div className="articles-table-container">
            <table className="articles-table">
              <thead className="articles-table-header">
                <tr>
                  <th>Заголовок</th>
                  <th>Категория</th>
                  <th>Дата создания</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {currentArticles.map((article, index) => (
                  <tr key={article.id || `article-${index}`} className="articles-table-row">
                    <td className="articles-table-cell">
                      <div className="article-title-cell">
                        {article.title || 'Без названия'}
                        <div className="article-content-preview">
                          {article.content ? article.content.substring(0, 100) + '...' : 'Нет содержания'}
                        </div>
                      </div>
                    </td>
                    <td className="articles-table-cell">
                      {article.category?.name || 'Без категории'}
                    </td>
                    <td className="articles-table-cell">
                      {article.created_at 
                        ? new Date(article.created_at).toLocaleDateString('ru-RU')
                        : article.published_at 
                          ? new Date(article.published_at).toLocaleDateString('ru-RU')
                          : 'N/A'}
                    </td>
                    <td className="articles-table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        article.published_at 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {article.published_at ? 'Опубликовано' : 'Черновик'}
                      </span>
                    </td>
                    <td className="articles-table-cell articles-actions-cell">
                      <button 
                        className="articles-action-button articles-edit-button"
                        onClick={() => {
                          article.id && handleEdit(article);
                        }}
                        disabled={!article.id}
                      >
                        <EditIcon />
                        Редактировать
                      </button>
                      <button 
                        className="articles-action-button articles-delete-button"
                        onClick={() => article.id && handleDelete(article.id)}
                      >
                        <TrashIcon />
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="articles-pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`articles-pagination-button ${
                    currentPage === i + 1 ? 'active' : ''
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ArticlesTab;