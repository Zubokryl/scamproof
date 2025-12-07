'use client';

import { useParams } from 'next/navigation';
import CategoryLandingPage from '@/components/CategoryLandingPage';

const CategoryPage = () => {
  const { category: slug } = useParams();
  
  // Map the category slug to the correct format if needed
  // The slug from the URL might need transformation
  
  return <CategoryLandingPage />;
};

export default CategoryPage;