"use client";

import Link from 'next/link';
import { Mail, Shield, Users, MessageCircle } from 'lucide-react';
import './Footer.css'; 

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div>
            <h3>yourscamproof</h3>
            <p>Платформа защиты от мошенничества. Помогаем распознавать схемы обмана и делиться случаями.</p>
          </div>

          <div>
            <h4><Shield size={18} /> Навигация</h4>
            <ul>
              <li><Link href="/">Главная</Link></li>
              <li><Link href="/database">База данных</Link></li>
            </ul>
          </div>

          {/* Moved "Сообщество" column to the right */}
          <div>
            <ul>
              <li><Link href="/glossary">Глоссарий</Link></li>
              <li><Link href="/tools">Инструменты</Link></li>
              <li><Link href="/resources">Полезные ресурсы</Link></li>
            </ul>
          </div>

          <div>
            <ul>
              <li><Link href="/forum">Форум</Link></li>
              <li><Link href="https://t.me/yourscamproof" target="_blank">Telegram</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 yourscamproof. Информация носит ознакомительный характер.</p>
          <div className="footer-social">
            <Link href="https://t.me/yourscamproof" target="_blank">
              <MessageCircle size={16} /> Telegram
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}