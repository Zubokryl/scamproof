'use client';

import { useState, useEffect } from 'react';
import api from '@/api/api';
import './ToolsTab.css';

// SVG Icons
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

interface Tool {
  id: number;
  name: string;
  description: string;
  url: string;
  category: string;
}

const ToolsTab = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    category: ''
  });

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const res = await api.get('/tools');
      setTools(res.data);
    } catch (error) {
      console.error('Ошибка при загрузке инструментов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTool) {
        // Update existing tool
        const res = await api.put(`/tools/${editingTool.id}`, formData);
        setTools(tools.map(tool => tool.id === editingTool.id ? res.data : tool));
      } else {
        // Create new tool
        const res = await api.post('/tools', formData);
        setTools([...tools, res.data]);
      }
      
      // Reset form
      setFormData({ name: '', description: '', url: '', category: '' });
      setEditingTool(null);
      setIsFormVisible(false);
    } catch (error) {
      console.error('Ошибка при сохранении инструмента:', error);
    }
  };

  const handleCreate = () => {
    setEditingTool(null);
    setFormData({ name: '', description: '', url: '', category: '' });
    setIsFormVisible(true);
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      description: tool.description,
      url: tool.url,
      category: tool.category
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот инструмент?')) {
      try {
        await api.delete(`/tools/${id}`);
        setTools(tools.filter(tool => tool.id !== id));
      } catch (error) {
        console.error('Ошибка при удалении инструмента:', error);
      }
    }
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingTool(null);
    setFormData({ name: '', description: '', url: '', category: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="tools-tab-container">
      <div className="tools-header">
        <h2 className="tools-title">Инструменты</h2>
        <div className="tools-actions">
          <button
            onClick={handleCreate}
            className="tools-create-button"
          >
            <PlusIcon />
            Добавить инструмент
          </button>
        </div>
      </div>

      {isFormVisible && (
        <div className="tools-form-container">
          <h3 className="tools-form-title">
            {editingTool ? 'Редактировать инструмент' : 'Добавить новый инструмент'}
          </h3>
          <form onSubmit={handleSubmit} className="tools-form">
            <div className="tools-form-row">
              <div className="tools-form-group">
                <label className="tools-form-label">Название</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="tools-form-input"
                  placeholder="Введите название инструмента"
                  required
                />
              </div>
              <div className="tools-form-group">
                <label className="tools-form-label">Категория</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="tools-form-input"
                  placeholder="Введите категорию"
                  required
                />
              </div>
            </div>
            <div className="tools-form-group">
              <label className="tools-form-label">Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="tools-form-textarea"
                placeholder="Введите описание инструмента"
                rows={3}
                required
              />
            </div>
            <div className="tools-form-group">
              <label className="tools-form-label">Ссылка</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="tools-form-input"
                placeholder="https://example.com"
                required
              />
            </div>
            <div className="tools-form-actions">
              <button
                type="submit"
                className="tools-submit-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {editingTool ? 'Обновить' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="tools-cancel-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {tools.length === 0 ? (
        <div className="tools-empty-state">
          <div className="tools-empty-icon">
            <SettingsIcon />
          </div>
          <h3 className="tools-empty-text">Инструментов пока нет</h3>
          <p className="tools-empty-subtext">Добавьте первый инструмент, чтобы начать</p>
          <button
            onClick={handleCreate}
            className="tools-create-button"
          >
            <PlusIcon />
            Создать первый инструмент
          </button>
        </div>
      ) : (
        <div className="tools-grid">
          {tools.map((tool) => (
            <div key={tool.id} className="tools-card">
              <div className="tools-card-header">
                <h3 className="tools-card-title">{tool.name}</h3>
              </div>
              <p className="tools-card-description">
                {tool.description}
              </p>
              <div className="tools-card-category">
                <span className="tools-category-badge">
                  {tool.category}
                </span>
              </div>
              <div className="tools-card-actions">
                <a 
                  href={tool.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="tools-action-button tools-link-button"
                >
                  <ExternalLinkIcon />
                  Перейти
                </a>
                <button
                  onClick={() => handleEdit(tool)}
                  className="tools-action-button tools-edit-button"
                >
                  <PencilIcon />
                  Редактировать
                </button>
                <button
                  onClick={() => handleDelete(tool.id)}
                  className="tools-action-button tools-delete-button"
                >
                  <TrashIcon />
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToolsTab;