"use client";

import Link from "next/link";
import { CheckCircle, Zap, ArrowRight } from "lucide-react";
import "./CTASection.css"; // подключаем CSS

export default function CTASection() {
  const benefits = [
    "Остаетесь анонимны",
    "Ваша история может помочь другим",
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
              Ваш опыт может помочь другим людям избежать ловушек мошенников.
            </p>

            <div className="cta-buttons">
              {/* Removed the "Поделиться историей" button */}
              <Link href="/forum" className="btn-secondary btn-wide pulse">
                Перейти на форум
                <ArrowRight size={18} className="btn-arrow" />
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