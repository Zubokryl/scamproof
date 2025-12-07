'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function NovaiaTemaRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main forum page which shows latest topics
    router.replace('/forum');
  }, [router]);

  return (
    <div className={styles.container}>
      <p className={styles.message}>Перенаправление на последние темы форума...</p>
    </div>
  );
}