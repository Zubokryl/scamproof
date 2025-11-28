"use client";

import Link from 'next/link';
import { Mail, Heart, Shield, BookOpen, Users, MessageCircle } from 'lucide-react';
import './Footer.css'; 

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div>
            <h3>ScamProof</h3>
            <p>Платформа защиты от мошенничества. Помогаем распознавать и документировать схемы обмана.</p>
          </div>

          <div>
            <h4><Shield size={18} /> Навигация</h4>
            <ul>
              <li><Link href="/database">База данных</Link></li>
              <li><Link href="/education">Образование</Link></li>
              <li><Link href="/glossary">Глоссарий</Link></li>
              <li><Link href="/tools">Инструменты</Link></li>
            </ul>
          </div>

          <div>
            <h4><Users size={18} /> Сообщество</h4>
            <ul>
              <li><Link href="/forum">Форум</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/resources">Справочные материалы</Link></li>
              <li><Link href="/contacts">Контакты</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4><Mail size={18} /> Поддержка</h4>
            <a href="mailto:info@scamproof.com">
              <Mail size={16} /> info@scamproof.com
            </a>
            <p>🚨 Экстренная ситуация? Свяжитесь с локальными органами или службой 112</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 ScamProof. Информация носит ознакомительный характер. Мы не предоставляем юридические консультации.</p>
          <div className="footer-social">
            <Link href="https://t.me/scamproof" target="_blank">
              <MessageCircle size={16} /> Telegram
            </Link>
            <Link href="https://twitter.com/scamproof" target="_blank">
              <BookOpen size={16} /> Twitter
            </Link>
          </div>
        </div>

        <div className="footer-made">
          <Heart /> Made with passion for digital safety
        </div>
      </div>
    </footer>
  );
}