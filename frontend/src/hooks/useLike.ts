import { useState } from 'react';
import api from '@/api/api';

export const useLike = (id: string | string[] | undefined, user: any | null) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const handleLike = async () => {
    console.log("Handling like for article ID:", id);
    
    if (!id) return;

    // Ensure id is a string
    const articleId = Array.isArray(id) ? id[0] : id;
    
    if (!articleId) {
      console.log("Invalid article ID");
      return;
    }

    // For guests, we still want to prevent multiple rapid clicks
    // but we'll always send the request to the backend to verify
    if (!user) {
      const storageKey = `article_like_${articleId}`;

      // If we have a localStorage record, show a temporary alert
      // but still send the request to backend to verify actual state
      if (localStorage.getItem(storageKey)) {
        // We'll still send the request but inform the user
        console.log("Already liked according to localStorage, but checking backend...");
      }
    }

    try {
      console.log(`Making request to: /api/articles/${articleId}/like`);
      const response = await api.post(`/articles/${articleId}/like`);
      console.log("Like response:", response.data);
      const newLikedState = response.data.liked;
      
      setLiked(newLikedState);
      
      // Update likes count
      if (newLikedState) {
        setLikesCount(prev => prev + 1);
        
        // Сохраняем лайк в localStorage
        if (!user) {
          localStorage.setItem(`article_like_${articleId}`, '1');
        }
      } else {
        setLikesCount(prev => Math.max(0, prev - 1));
        
        if (!user) {
          localStorage.removeItem(`article_like_${articleId}`);
        }
      }
    } catch (err: any) {
      console.error('Error toggling like:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: `/api/articles/${articleId}/like`
      });
      
      // Only show alert for non-CSRF errors to prevent spam
      if (err.response?.status !== 419) {
        alert('Не удалось поставить лайк');
      }
    }
  };

  return { liked, setLiked, likesCount, setLikesCount, handleLike };
};