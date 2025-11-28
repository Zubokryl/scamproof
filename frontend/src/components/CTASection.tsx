"use client";

import Link from "next/link";
import { CheckCircle, Zap } from "lucide-react";
import "./CTASection.css"; // подключаем CSS

export default function CTASection() {
  const benefits = [
    "Остаетесь анонимны",
    "Ваша история может спасти других",
    "Получаете советы от опытных",
    "Помогаете развивать базу данных",
  ];

  return (
    <section className="cta-section">
      <div className="cta-container">
        <div className="cta-box">
          <div className="cta-overlay-gradient" />
          <div className="cta-overlay-grid" />

          <div className="cta-content">
            <h2 className="cta-title">
              Поделитесь своей историей
            </h2>
            <p className="cta-description">
              Ваш опыт может помочь тысячам людей избежать ловушек мошенников. Расскажите подробнее о случившемся и помогите сообществу.
            </p>

            <div className="cta-buttons">
              <Link href="/share" className="btn-primary">
                <Zap size={18} /> Поделиться историей
              </Link>
              <Link href="/forum" className="btn-secondary">
                Перейти на форум →
              </Link>
            </div>

            <div className="cta-benefits">
              {benefits.map((b, i) => (
                <div key={i} className="benefit-item">
                  <CheckCircle size={20} className="benefit-icon" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

