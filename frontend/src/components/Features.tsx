"use client";
import './Features.css';

export default function Features() {
  const features = [
    { 
      icon: '/glossariy.jpeg',
      title: 'Глоссарий', 
      description: 'Все термины мошенничества с пояснениями', 
      href: '/glossary' 
    },
    { 
      icon: '/tools.jpeg',
      title: 'Инструменты', 
      description: 'Проверка номеров, сайтов и других данных', 
      href: '/tools' 
    },
    { 
      icon: '/services.jpeg',
      title: 'Полезные сервисы и ресурсы', 
      description: 'Горячие линии и официальные организации', 
      href: '/resources' 
    },
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        {features.map((f, i) => (
          <a 
            key={f.title} 
            href={f.href} 
            className="feature-card"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="feature-icon">
              <img 
                src={f.icon} 
                alt={f.title} 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  objectFit: 'cover',
                  borderRadius: '8px'
                }} 
              />
            </div>
            <h3>{f.title}</h3>
            <p>{f.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}