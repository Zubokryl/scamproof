'use client';

import { useState, useEffect } from 'react';
import api from '@/api/api';
import './GlossaryTab.css';

// SVG Icons
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
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

interface GlossaryTerm {
  id: number;
  term: string;
  definition: string;
  category: string;
}

const GlossaryTab = () => {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [formData, setFormData] = useState({
    term: '',
    definition: '',
    category: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGlossaryTerms();
  }, []);

  const fetchGlossaryTerms = async () => {
    try {
      const res = await api.get('/glossary');
      setTerms(res.data);
    } catch (error) {
      console.error('Ошибка при загрузке терминов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTerm) {
        // Update existing term
        const res = await api.put(`/glossary/${editingTerm.id}`, formData);
        setTerms(terms.map(term => term.id === editingTerm.id ? res.data : term));
      } else {
        // Create new term
        const res = await api.post('/glossary', formData);
        setTerms([...terms, res.data]);
      }
      
      // Reset form
      setFormData({ term: '', definition: '', category: '' });
      setEditingTerm(null);
      setIsFormVisible(false);
    } catch (error) {
      console.error('Ошибка при сохранении термина:', error);
    }
  };

  const handleCreate = () => {
    setEditingTerm(null);
    setFormData({ term: '', definition: '', category: '' });
    setIsFormVisible(true);
  };

  const handleEdit = (term: GlossaryTerm) => {
    setEditingTerm(term);
    setFormData({
      term: term.term || '',
      definition: term.definition || '',
      category: term.category || ''
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот термин?')) {
      try {
        await api.delete(`/glossary/${id}`);
        setTerms(terms.filter(term => term.id !== id));
      } catch (error) {
        console.error('Ошибка при удалении термина:', error);
      }
    }
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingTerm(null);
    setFormData({ term: '', definition: '', category: '' });
  };

  // Filter terms based on search term
  const filteredTerms = terms.filter(term => 
    (term.term && term.term.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (term.definition && term.definition.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (term.category && term.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="glossary-tab-container">
      <div className="glossary-header">
        <h2 className="glossary-title">Управление глоссарием</h2>
        <div className="glossary-actions">
          <button className="glossary-create-button" onClick={handleCreate}>
            <PlusIcon />
            Добавить термин
          </button>
        </div>
      </div>

      <div className="glossary-search-container">
        <input
          type="text"
          placeholder="Поиск терминов..."
          className="glossary-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isFormVisible && (
        <div className="glossary-form-container">
          <h3 className="glossary-form-title">
            {editingTerm ? 'Редактировать термин' : 'Добавить новый термин'}
          </h3>
          <form onSubmit={handleSubmit} className="glossary-form">
            <div className="glossary-form-group">
              <label htmlFor="term" className="glossary-form-label">
                Термин *
              </label>
              <input
                type="text"
                id="term"
                className="glossary-form-input"
                value={formData.term}
                onChange={(e) => setFormData({...formData, term: e.target.value})}
                required
              />
            </div>
            
            <div className="glossary-form-group">
              <label htmlFor="definition" className="glossary-form-label">
                Определение *
              </label>
              <textarea
                id="definition"
                className="glossary-form-textarea"
                value={formData.definition}
                onChange={(e) => setFormData({...formData, definition: e.target.value})}
                required
                rows={4}
              />
            </div>
            
            <div className="glossary-form-group">
              <label htmlFor="category" className="glossary-form-label">
                Категория
              </label>
              <input
                type="text"
                id="category"
                className="glossary-form-input"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
            
            <div className="glossary-form-actions">
              <button type="button" className="glossary-cancel-button" onClick={handleCancel}>
                Отмена
              </button>
              <button type="submit" className="glossary-submit-button">
                {editingTerm ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!isFormVisible && (
        <>
          {filteredTerms.length === 0 ? (
            <div className="glossary-empty-state">
              <BookOpenIcon />
              <p className="glossary-empty-text">Термины не найдены</p>
              <button className="glossary-create-button" onClick={handleCreate}>
                <PlusIcon />
                Добавить первый термин
              </button>
            </div>
          ) : (
            <div className="glossary-list">
              {filteredTerms.map((item) => (
                <div key={item.id} className="glossary-item">
                  <h3 className="glossary-item-term">{item.term || 'Без названия'}</h3>
                  <p className="glossary-item-definition">{item.definition || 'Нет описания'}</p>
                  <div className="glossary-item-meta">
                    <span>Категория: {item.category || 'Без категории'}</span>
                    <div className="glossary-item-actions">
                      <button 
                        className="glossary-action-button glossary-edit-button"
                        onClick={() => handleEdit(item)}
                      >
                        <PencilIcon />
                        Редактировать
                      </button>
                      <button 
                        className="glossary-action-button glossary-delete-button"
                        onClick={() => handleDelete(item.id)}
                      >
                        <TrashIcon />
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GlossaryTab;