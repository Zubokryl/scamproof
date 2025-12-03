// IMPORTANT: This is the dynamic route for categories.
// DO NOT modify or remove this file as it's critical for category navigation.
// All category pages should use this dynamic route: /database/[category]
// This ensures that all categories work correctly without creating static files.

'use client';

import CategoryLandingPage from '@/components/CategoryLandingPage';
import { useParams } from 'next/navigation';

const DatabaseCategoryPage = () => {
  const params = useParams();
  const slug = Array.isArray(params.category) ? params.category[0] : params.category;

  return <CategoryLandingPage slug={slug} />;
};

export default DatabaseCategoryPage;