'use client';

import ArticlePage from '@/components/ArticlePage';
import LayoutWithNavAndFooter from '@/app/layout-with-nav-footer';
import { useEffect } from 'react';

const ArticleSlugPage = () => {
  return (
    <LayoutWithNavAndFooter>
      <ArticlePage />
    </LayoutWithNavAndFooter>
  );
};

export default ArticleSlugPage;