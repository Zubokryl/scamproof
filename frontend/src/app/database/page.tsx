'use client';

import Link from 'next/link';
import { Shield, Laptop, Users, CreditCard, Building, Heart, Gamepad2, BookOpen, Globe } from 'lucide-react';
import styles from './page.module.css';
import LayoutWithNavAndFooter from '../layout-with-nav-footer';

const categories = [
  {
    id: 'cybersecurity',
    name: 'Кибербезопасность',
    description: 'Фишинг, вирусы, взломы аккаунтов и другие интернет-угрозы',
    icon: <Laptop className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'social-scams',
    name: 'Социальные аферы',
    description: 'Мошенничество в социальных сетях и мессенджерах',
    icon: <Users className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-400'
  },
  {
    id: 'finance',
    name: 'Финансовые схемы',
    description: 'Кредитные, инвестиционные и банковские мошенничества',
    icon: <CreditCard className="w-8 h-8" />,
    color: 'from-green-500 to-emerald-400'
  },
  {
    id: 'commercial',
    name: 'Коммерческое мошенничество',
    description: 'Обман предпринимателей и бизнесменов',
    icon: <Building className="w-8 h-8" />,
    color: 'from-yellow-500 to-orange-400'
  },
  {
    id: 'education',
    name: 'Образование',
    description: 'Мошенничество в сфере образования и курсов',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'from-indigo-500 to-purple-400'
  },
  {
    id: 'health',
    name: 'Медицина',
    description: 'Фальшивые лекарства и медицинские услуги',
    icon: <Heart className="w-8 h-8" />,
    color: 'from-red-500 to-pink-400'
  },
  {
    id: 'travel',
    name: 'Отдых и туризм',
    description: 'Туристические аферы и обман путешественников',
    icon: <Globe className="w-8 h-8" />,
    color: 'from-teal-500 to-cyan-400'
  },
  {
    id: 'social-networks',
    name: 'Социальные сети',
    description: 'Аферы в соцсетях и мессенджерах',
    icon: <Users className="w-8 h-8" />,
    color: 'from-pink-500 to-rose-400'
  },
  {
    id: 'real-estate',
    name: 'Недвижимость',
    description: 'Мошенничество с недвижимостью и арендой',
    icon: <Building className="w-8 h-8" />,
    color: 'from-amber-500 to-yellow-400'
  },
  {
    id: 'entertainment',
    name: 'Развлечения',
    description: 'Аферы в сфере развлечений и лайфстайла',
    icon: <Gamepad2 className="w-8 h-8" />,
    color: 'from-violet-500 to-purple-400'
  }
];

export default function DatabasePage() {
  return (
    <LayoutWithNavAndFooter>
      <div className={styles.container}>
        <div className="container mx-auto px-4">
          <div className={styles.header}>
            <h1 className={styles.title}>
              База данных мошенничества
            </h1>
            <p className={styles.subtitle}>
              Защищайте себя и своих близких, изучая актуальные схемы обмана и способы их распознавания
            </p>
          </div>

          <div className={styles.categoriesGrid}>
            {categories.map((category) => (
              <Link 
                key={category.id}
                href={`/database/${category.id}`}
                className={styles.categoryCard}
              >
                <div className={styles.iconWrapper}>
                  {category.icon}
                </div>
                <h2 className={styles.categoryTitle}>
                  {category.name}
                </h2>
                <p className={styles.categoryDescription}>
                  {category.description}
                </p>
                <div className={styles.linkText}>
                  <span>Изучить категорию</span>
                  <svg 
                    className={styles.arrowIcon}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.ctaSection}>
            <div className={styles.ctaCard}>
              <Shield className={styles.ctaIcon} />
              <h2 className={styles.ctaTitle}>Не нашли нужную категорию?</h2>
              <p className={styles.ctaDescription}>
                Наша база данных постоянно пополняется новыми схемами мошенничества. 
                Если вы столкнулись с новым видом обмана, поделитесь информацией в нашем форуме.
              </p>
              <div className={styles.buttonGroup}>
                <Link 
                  href="/forum" 
                  className={styles.primaryButton}
                >
                  Перейти в форум
                </Link>
                <Link 
                  href="/contacts" 
                  className={styles.secondaryButton}
                >
                  Сообщить о новой схеме
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithNavAndFooter>
  );
}