'use client';

import { Category } from '@/lib/types';
import { Dispatch, SetStateAction, useState } from 'react';
import api from '@/api/api';
import './CategoriesTab.css';
import { pluralizeArticles } from '@/lib/pluralize';

// SVG Icons
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
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

interface ExtendedCategory extends Category {
  description?: string;
  icon?: string;
  articles_count?: number;
}

interface CategoriesTabProps {
  categories: ExtendedCategory[];
  setCategories: Dispatch<SetStateAction<ExtendedCategory[]>>;
}

const CategoriesTab: React.FC<CategoriesTabProps> = ({ categories, setCategories }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExtendedCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: ''
  });

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: ''
    });
    setIsFormVisible(true);
  };

  const handleEdit = (category: ExtendedCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || ''
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию? Это удалит все статьи в этой категории.')) {
      try {
        await api.delete(`/categories/${id}`);
        setCategories(categories.filter(category => category.id !== id));
      } catch (error) {
        console.error('Ошибка при удалении категории:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Generate slug from name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '') || 'category-' + Date.now();
      
      const categoryData = {
        name: formData.name,
        slug: slug,
        description: formData.description,
        icon: formData.icon
      };
      
      if (editingCategory) {
        // Update existing category
        const res = await api.put(`/categories/${editingCategory.id}`, categoryData);
        setCategories(categories.map(category => category.id === editingCategory.id ? {...res.data, ...formData} : category));
      } else {
        // Create new category
        const res = await api.post('/categories', categoryData);
        setCategories([...categories, {...res.data, ...formData}]);
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        icon: ''
      });
      setEditingCategory(null);
      setIsFormVisible(false);
    } catch (error) {
      console.error('Ошибка при сохранении категории:', error);
    }
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: ''
    });
  };

  return (
    <div className="categories-tab-container">
      <div className="categories-header">
        <h2 className="categories-title">Управление категориями</h2>
        <div className="categories-actions">
          <button className="categories-create-button" onClick={handleCreate}>
            <PlusIcon />
            Создать категорию
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="categories-empty-state">
          <FolderIcon />
          <p className="categories-empty-text">Категории не найдены</p>
          <button className="categories-create-button" onClick={handleCreate}>
            <PlusIcon />
            Создать первую категорию
          </button>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="categories-card">
              <div className="categories-card-header">
                <div className="categories-card-icon">
                  <FolderIcon />
                </div>
                <h3 className="categories-card-title">{category.name}</h3>
              </div>
              <p className="categories-card-description">
                {category.description || 'Нет описания'}
              </p>
              <div className="categories-card-stats">
                <div className="categories-card-stat">
                  <div className="categories-stat-value">
                    {category.articles_count || 0}
                  </div>
                  <div className="categories-stat-label">{pluralizeArticles(category.articles_count || 0)}</div>
                </div>
              </div>
              <div className="categories-card-actions">
                <button 
                  className="categories-action-button categories-edit-button"
                  onClick={() => handleEdit(category)}
                >
                  <PencilIcon />
                  Редактировать
                </button>
                <button 
                  className="categories-action-button categories-delete-button"
                  onClick={() => handleDelete(category.id)}
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

export default CategoriesTab;