"use client";
export default function Features() {
  const features = [
    { title: 'Глоссарий', description: 'Все термины мошенничества с пояснениями', href: '/glossary' },
    { title: 'Инструменты', description: 'Проверка номеров, сайтов и других данных', href: '/tools' },
    { title: 'Полезные сервисы и ресурсы', description: 'Горячие линии и официальные организации', href: '/resources' },
  ];

  return (
    <section className="features-section">
      <div className="container grid-3">
        {features.map((f) => (
          <a key={f.title} href={f.href} className="feature-card">
            <h3>{f.title}</h3>
            <p>{f.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
