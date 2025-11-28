'use client';

import { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  const [searchType, setSearchType] = useState('keyword');
  const [searchValue, setSearchValue] = useState('');

  const fraudTypes = [
    'Все категории',
    'Банковское мошенничество',
    'Фишинг',
    'Фальшивые звонки',
    'Онлайн-магазины',
    'Знакомства и соцсети',
    'Туризм',
    'Работа и вакансии',
  ];

  const features = [
    {
      icon: '🔍',
      title: 'Глоссарий',
      description: 'Поиск похожих случаев в нашей базе данных',
    },
    {
      icon: '📚',
      title: 'Инструменты',
      description: 'Учитесь распознавать признаки мошенничества',
    },
    {
      icon: '💬',
      title: 'Сервисы и ресурсы',
      description: 'Поделитесь своей историей',
    },
  ];

  return (
    <section className="hero-section">
      {/* Video Background */}
      <div className="video-background">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="video-element"
        >
          <source src="/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay"></div>
      </div>
      
      <div className="hero-grid" />
      <div className="hero-gradient" />

      <div className="hero-container">
        <div className="hero-text">
          <h1>
            <span className="text-gradient">Защита от</span>
            <br />
            <span className="text-gradient">мошенничества</span>
          </h1>
          <p>Распознавайте схемы обмана, делитесь опытом и учитесь на ошибках других</p>
        </div>

        <div className="hero-search">
          <div className="search-card">
            <div className="search-header">
              <AlertCircle size={20} />
              <span>Поиск по базе данных</span>
            </div>

            <div className="search-fields">
              <label htmlFor="searchType" className="visually-hidden">
                Тип поиска
              </label>
              <select
                id="searchType"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="keyword">По ключевым словам</option>
                <option value="type">По типу</option>
                <option value="channel">По каналу</option>
              </select>

              <input
                type="text"
                placeholder="Введите название компании, номер, или описание..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />

              <button>
                <Search size={18} /> Поиск
              </button>
            </div>

            <div className="fraud-types">
              {fraudTypes.map((type) => (
                <button key={type}>{type}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-features">
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}