'use client';

import { useState, useEffect, useRef } from "react";
import { useAuth } from '@/context/AuthContext';
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import "./Navigation.css";

function AuthButton({ isMobile = false }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (user) {
    return (
      <button onClick={handleLogout} className={isMobile ? "nav-mobile-logout" : "nav-logout"}>
        Выход
      </button>
    );
  } else {
    return (
      <Link href="/login" className={isMobile ? "nav-mobile-login" : "nav-login"}>
        Вход
      </Link>
    );
  }
}



function UserAvatar() {
  const { user } = useAuth();

  if (!user) return null;

  // Redirect admins to admin panel, regular users to profile
  const profileHref = user.role === 'admin' ? '/admin' : '/profile';

  return (
    <div className="user-avatar-container">
      <Link href={profileHref} className="flex items-center">
        <Avatar className="w-9 h-9 sm:w-9 sm:h-9 cursor-pointer flex items-center justify-center">
          <AvatarFallback className="w-full h-full bg-primary text-white text-sm font-bold rounded-full flex items-center justify-center">
            {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
    </div>
  );
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  // Lock scroll when mobile menu is open (body/html + preserve scroll position)
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (isOpen) {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';

      const preventTouch = (e: TouchEvent) => {
        e.preventDefault();
      };
      window.addEventListener('touchmove', preventTouch, { passive: false });

      return () => {
        window.removeEventListener('touchmove', preventTouch as any);
        html.style.overflow = '';
        body.style.overflow = '';
        body.style.position = '';
        const top = body.style.top;
        body.style.top = '';
        body.style.width = '';
        const y = top ? parseInt(top, 10) : 0;
        window.scrollTo(0, -y);
      };
    } else {
      html.style.overflow = '';
      body.style.overflow = '';
      body.style.position = '';
      const top = body.style.top;
      body.style.top = '';
      body.style.width = '';
      if (top) {
        const y = parseInt(top, 10) || 0;
        window.scrollTo(0, -y);
      }
    }
  }, [isOpen]);

  // Закрытие дропдауна при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    // Добавляем слушатель при монтировании
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav className="nav">
      <div className="nav-inner">
        {/* ЛОГО */}
        <Link href="/" className="nav-logo">
          <span className="logo-wrapper">
            <span className="logo-bg"></span>
            <Image
              src="/logo.jpg"
              width={50}
              height={50}
              alt="YourScamProof Logo"
              className="nav-logo-img"
            />
            <span className="nav-logo-text">YourScamProof</span>
          </span>
        </Link>

        {/* ДЕСКТОПНОЕ МЕНЮ */}
        <div className="menu-wrapper">
          <ul className="header-menu">
            {/* СХЕМЫ — с подменю только на десктопе */}
            <li className="dropdown-menu solutions-dropdown" ref={dropdownRef}>
              <div className="header-link-wrapper">
                <Link href="/database" className="header-link">
                  Схемы
                  <span className="header-link__bottom"></span>
                </Link>
                <button
                  className="header-link-dropdown-btn"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  ▼
                </button>
              </div>

              <ul className={`submenu two-columns ${isDropdownOpen ? 'open' : ''}`}>
                <li>
                  <Link href="/database/education" className="submenu-link" title="Мошенничество в образовательной сфере">
                    <div className="image">
                      <img src="/education.svg" alt="Образование" width={32} height={32} />
                    </div>
                    <span>Образование</span>
                  </Link>
                </li>

                <li>
                  <Link href="/database/cybersecurity" className="submenu-link" title="Интернет-мошенничество, фишинг, взломы">
                    <div className="image">
                      <img src="/cybersecurity.svg" alt="Кибербезопасность" width={32} height={32} />
                    </div>
                    <span>Кибербезопасность</span>
                  </Link>
                </li>

                <li>
                  <Link href="/database/social-scams" className="submenu-link" title="Аферы в соцсетях">
                    <div className="image">
                      <img src="/social-scams.svg" alt="Социальные аферы" width={32} height={32} />
                    </div>
                    <span>Социальные аферы</span>
                  </Link>
                </li>

                <li>
                  <Link href="/database/finance" className="submenu-link" title="Финансовые мошенничества">
                    <div className="image">
                      <img src="/finance.svg" alt="Финансовые схемы" width={32} height={32} />
                    </div>
                    <span>Финансовые схемы</span>
                  </Link>
                </li>

                <li>
                  <Link href="/database/commercial" className="submenu-link" title="Коммерческие аферы">
                    <div className="image">
                      <img src="/commercial.svg" alt="Коммерческое мошенничество" width={32} height={32} />
                    </div>
                    <span>Коммерческое мошенничество</span>
                  </Link>
                </li>

                <li>
                  <Link href="/database/health" className="submenu-link" title="Медицинские аферы">
                    <div className="image">
                      <img src="/health.svg" alt="Медицина" width={32} height={32} />
                    </div>
                    <span>Медицина</span>
                  </Link>
                </li>

                <li>
                  <Link href="/database/travel" className="submenu-link" title="Мошенничество в туризме">
                    <div className="image">
                      <img src="/travel.svg" alt="Отдых и туризм" width={32} height={32} />
                    </div>
                    <span>Отдых и туризм</span>
                  </Link>
                </li>

                <li>
                  <Link href="/database/social-networks" className="submenu-link" title="Аферы в соцсетях и мессенджерах">
                    <div className="image">
                      <img src="/social-networks.svg" alt="Социальные сети" width={32} height={32} />
                    </div>
                    <span>Социальные сети</span>
                  </Link>
                </li>

                <li>
                  <Link href="/database/real-estate" className="submenu-link" title="Недвижимость">
                    <div className="image">
                      <img src="/real-estate.svg" alt="Недвижимость" width={32} height={32} />
                    </div>
                    <span>Недвижимость</span>
                  </Link>
                </li>

                <li>
                  <Link href="/database/entertainment" className="submenu-link" title="Развлечения и лайфстайл">
                    <div className="image">
                      <img src="/entertainment.svg" alt="Развлечения" width={32} height={32} />
                    </div>
                    <span>Развлечения</span>
                  </Link>
                </li>
              </ul>
            </li>

            {/* ФОРУМ */}
            <li>
              <Link href="/forum" className="header-link">
                Форум
                <span className="header-link__bottom"></span>
              </Link>
            </li>

            {/* ТЕЛЕГРАМ */}
            <li>
              <a
                href="https://t.me/yourscamproof"
                target="_blank"
                rel="noopener noreferrer"
                className="header-link telegram-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9.999 15.2L9.8 18.4C10.1 18.4 10.2 18.3 10.4 18.1L12.2 16.6L15.3 18.9C15.9 19.2 16.3 19 16.5 18.3L19.9 5.1C20.2 4.3 19.7 3.9 19.1 4.1L3.3 10C2.5 10.3 2.5 10.8 3.1 11L7.1 12.3L16.2 7.1C16.6 6.9 17 7.1 16.7 7.3L9.999 15.2Z"
                    fill="currentColor"
                  />
                </svg>
                Telegram
                <span className="header-link__bottom"></span>
              </a>
            </li>
          </ul>
        </div>

        {/* Десктопные элементы аутентификации */}
        <div className="nav-actions">
          <UserAvatar />
          <AuthButton />
        </div>

        <button
  className={`nav-burger ${isOpen ? 'open close-icon-active' : ''}`}
  onClick={() => setIsOpen(!isOpen)}
>
  <X size={60} />
  <Menu size={60} />
</button>


        {/* === МОБИЛЬНОЕ МЕНЮ === */}
<div
  className={`mobile-menu-backdrop ${isOpen ? "open" : ""}`}
  onClick={() => setIsOpen(false)}
>
  <div
    className={`nav-mobile ${isOpen ? "open" : ""}`}
    onClick={(e) => e.stopPropagation()}
  >

    <div className="nav-mobile-content">

      {/* 🔵 1. ЛОГОТИП (клик — на главную) */}
      <div className="mobile-logo-container">
        <Link
          href="/"
          className="nav-logo"
          onClick={() => setIsOpen(false)}
        >
          <span className="logo-wrapper">
            <span className="logo-bg"></span>
            <Image
              src="/logo.jpg"
              width={50}
              height={50}
              alt="YourScamProof Logo"
              className="nav-logo-img"
            />
            <span className="nav-logo-text">YourScamProof</span>
          </span>
        </Link>
      </div>

      {/* 🔵 2. Аватар пользователя (если залогинен) */}
      <div className="mobile-avatar-container">
        <UserAvatar />
      </div>

      {/* 🔵 3. Основные ссылки */}
      <div className="mobile-links">
        <Link
          href="/database"
          className="nav-mobile-link"
          onClick={() => setIsOpen(false)}
        >
          Схемы
        </Link>

        <Link
          href="/forum"
          className="nav-mobile-link"
          onClick={() => setIsOpen(false)}
        >
          Форум
        </Link>

        <a
          href="https://t.me/yourscamproof"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-mobile-link"
          onClick={() => setIsOpen(false)}
        >
          Telegram
        </a>
      </div>

      {/* 🔵 4. Кнопка входа / выхода */}
      <div className="nav-mobile-auth-section">
        <AuthButton isMobile />
      </div>
    </div>
  </div>
</div>

      </div>
    </nav>
  );
}