'use client';

import { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Features from './Features';
import './Hero.css';

export default function Hero() {
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();

  const fraudTypes = [
    'Все категории',
    'Банковское мошенничество',
    'Фишинг',
    'Фальшивые звонки',
    'Онлайн-магазины',
    'Знакомства',
    'Туризм',
    'Работа и вакансии',
    'Коммерческие аферы',
    'Кибербезопасность',
    'Образование',
    'Здоровье',
    'Недвижимость',
    'Социальные сети',
    'Социальные аферы',
    'Развлечения'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      return;
    }
    
    // Navigate to search results page with query parameters
    router.push(`/database/search?q=${encodeURIComponent(searchValue)}&type=keyword`);
  };

  const handleFraudTypeClick = (type: string) => {
    // Navigate to the category page for the selected fraud type
    const categorySlug = type === 'Все категории' ? '' : encodeURIComponent(type.toLowerCase().replace(/\s+/g, '-'));
    
    if (type === 'Все категории') {
      router.push('/database');
    } else {
      // For simplicity, we'll navigate to the search page with the category as a filter
      router.push(`/database/search?q=${encodeURIComponent(type)}&type=category`);
    }
  };

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
          <h1 className="responsive-hero-title">
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

            <form onSubmit={handleSearch} className="search-fields">
              <input
                type="text"
                placeholder="Введите любое слово или фразу"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />

              <button type="submit">
                <Search size={18} /> Поиск
              </button>
            </form>

            <div className="fraud-types">
              {fraudTypes.map((type) => (
                <button 
                  key={type} 
                  onClick={() => handleFraudTypeClick(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
        </div>

        {/* Use the Features component here */}
        <Features />
      </div>
    </section>
  );
}