import { useState, useEffect } from 'react';
import api from '@/api/api';

export const useLike = (id: string | string[] | undefined, user: any | null) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Initialize like state from localStorage for guests
  useEffect(() => {
    if (!id || user) return;
    
    // Ensure id is a string
    const articleId = Array.isArray(id) ? id[0] : id;
    
    if (!articleId) return;
    
    const storageKey = `article_like_${articleId}`;
    const hasLikedLocally = localStorage.getItem(storageKey);
    
    if (hasLikedLocally) {
      setLiked(true);
    }
  }, [id, user]);

  const handleLike = async () => {
    console.log("Handling like for article ID:", id);
    
    if (!id) return;

    // Ensure id is a string
    const articleId = Array.isArray(id) ? id[0] : id;
    
    if (!articleId) {
      console.log("Invalid article ID");
      return;
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
        
        // Save like to localStorage for guests
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

  // Expose a function to manually initialize the like state
  const initializeLikeState = (initialLikesCount: number, initialLikedState: boolean) => {
    setLikesCount(initialLikesCount);
    setLiked(initialLikedState);
  };

  return { liked, setLiked, likesCount, setLikesCount, handleLike, initializeLikeState };
};