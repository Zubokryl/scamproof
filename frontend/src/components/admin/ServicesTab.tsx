'use client';

import { useState, useEffect } from 'react';
import api from '@/api/api';
import './ServicesTab.css';

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

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
  </svg>
);

const CloudIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);

interface Service {
  id: number;
  name: string;
  description: string;
  phone: string;
  website: string;
  category: string;
}

const ServicesTab = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    website: '',
    category: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (error) {
      console.error('Ошибка при загрузке сервисов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingService) {
        // Update existing service
        const res = await api.put(`/services/${editingService.id}`, formData);
        setServices(services.map(service => service.id === editingService.id ? res.data : service));
      } else {
        // Create new service
        const res = await api.post('/services', formData);
        setServices([...services, res.data]);
      }
      
      // Reset form
      setFormData({ name: '', description: '', phone: '', website: '', category: '' });
      setEditingService(null);
      setIsFormVisible(false);
    } catch (error) {
      console.error('Ошибка при сохранении сервиса:', error);
    }
  };

  const handleCreate = () => {
    setEditingService(null);
    setFormData({ name: '', description: '', phone: '', website: '', category: '' });
    setIsFormVisible(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      phone: service.phone,
      website: service.website,
      category: service.category
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот сервис?')) {
      try {
        await api.delete(`/services/${id}`);
        setServices(services.filter(service => service.id !== id));
      } catch (error) {
        console.error('Ошибка при удалении сервиса:', error);
      }
    }
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingService(null);
    setFormData({ name: '', description: '', phone: '', website: '', category: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="services-tab-container">
      <div className="services-header">
        <h2 className="services-title">Полезные сервисы</h2>
        <div className="services-actions">
          <button
            onClick={handleCreate}
            className="services-create-button"
          >
            <PlusIcon />
            Добавить сервис
          </button>
        </div>
      </div>

      {isFormVisible && (
        <div className="services-form-container">
          <h3 className="services-form-title">
            {editingService ? 'Редактировать сервис' : 'Добавить новый сервис'}
          </h3>
          <form onSubmit={handleSubmit} className="services-form">
            <div className="services-form-row">
              <div className="services-form-group">
                <label className="services-form-label">Название</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="services-form-input"
                  placeholder="Введите название сервиса"
                  required
                />
              </div>
              <div className="services-form-group">
                <label className="services-form-label">Категория</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="services-form-input"
                  placeholder="Введите категорию"
                  required
                />
              </div>
            </div>
            <div className="services-form-group">
              <label className="services-form-label">Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="services-form-textarea"
                placeholder="Введите описание сервиса"
                rows={3}
                required
              />
            </div>
            <div className="services-form-row">
              <div className="services-form-group">
                <label className="services-form-label">Телефон</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="services-form-input"
                  placeholder="+7 (XXX) XXX-XX-XX"
                />
              </div>
              <div className="services-form-group">
                <label className="services-form-label">Веб-сайт</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="services-form-input"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="services-form-actions">
              <button
                type="submit"
                className="services-submit-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {editingService ? 'Обновить' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="services-cancel-button"
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

      {services.length === 0 ? (
        <div className="services-empty-state">
          <div className="services-empty-icon">
            <CloudIcon />
          </div>
          <h3 className="services-empty-text">Сервисов пока нет</h3>
          <p className="services-empty-subtext">Добавьте первый сервис, чтобы начать</p>
          <button
            onClick={handleCreate}
            className="services-create-button"
          >
            <PlusIcon />
            Создать первый сервис
          </button>
        </div>
      ) : (
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="services-card">
              <div className="services-card-header">
                <h3 className="services-card-title">{service.name}</h3>
                <span className="services-card-badge services-badge-free">
                  {service.category}
                </span>
              </div>
              <p className="services-card-description">
                {service.description}
              </p>
              <div className="services-card-contacts">
                {service.phone && (
                  <div className="services-contact-item">
                    <PhoneIcon />
                    <span>{service.phone}</span>
                  </div>
                )}
                {service.website && (
                  <div className="services-contact-item">
                    <ExternalLinkIcon />
                    <a 
                      href={service.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="services-contact-link"
                    >
                      Перейти на сайт
                    </a>
                  </div>
                )}
              </div>
              <div className="services-card-actions">
                <button
                  onClick={() => handleEdit(service)}
                  className="services-action-button services-edit-button"
                >
                  <PencilIcon />
                  Редактировать
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="services-action-button services-delete-button"
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

export default ServicesTab;