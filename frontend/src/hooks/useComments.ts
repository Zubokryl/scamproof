import { useState, useEffect } from 'react';
import api from '@/api/api';

// CRITICAL: COMMENT INTERFACE DEFINITION - DO NOT MODIFY!
// The user.id field must be typed as number | null to properly distinguish
// between authenticated users (number) and anonymous users (null).
// Changing this type will break the user detection logic in CommentItem.
// This was fixed in December 2025 - do not revert this change.
interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number | null;
    name: string;
  } | null;
  likes_count?: number;
  user_has_liked?: boolean;
  reactions?: {
    [key: string]: {
      count: number;
      user_has_reacted: boolean;
    };
  };
}

interface PaginatedResponse {
  data: Comment[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const useComments = (articleId: string | string[] | undefined) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);

  const fetchComments = async (page: number = 1) => {
    console.log("Fetching comments for article ID:", articleId, "Page:", page);
    
    if (!articleId) {
      console.log("No article ID provided");
      setLoading(false);
      return;
    }
    
    // Ensure articleId is a string
    const id = Array.isArray(articleId) ? articleId[0] : articleId;
    
    if (!id) {
      console.log("Invalid article ID");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Making request to: /api/articles/${id}/comments?page=${page}`);
      const response = await api.get(`/articles/${id}/comments`, {
        params: { page, per_page: 20 }
      });
      
      console.log("Comments response:", response.data);
      
      // Handle both paginated and non-paginated responses
      if (response.data.meta) {
        const paginatedData = response.data as PaginatedResponse;
        if (page === 1) {
          setComments(paginatedData.data);
        } else {
          setComments(prev => [...prev, ...paginatedData.data]);
        }
        setCurrentPage(paginatedData.meta.current_page);
        setLastPage(paginatedData.meta.last_page);
        setTotalComments(paginatedData.meta.total);
      } else {
        setComments(response.data.data || response.data);
        setCurrentPage(1);
        setLastPage(1);
        setTotalComments(response.data.data?.length || response.data.length || 0);
      }
      
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: `/api/articles/${id}/comments?page=${page}`
      });
      
      // Limit retries for 419 errors to prevent infinite loops
      if (err.response?.status === 419 && retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchComments(page);
        }, 1000);
      } else {
        setRetryCount(0); // Reset on other errors
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMoreComments = () => {
    if (currentPage < lastPage) {
      fetchComments(currentPage + 1);
    }
  };

  const submitComment = async (content: string) => {
    console.log("Submitting comment for article ID:", articleId);
    
    if (!articleId) {
      throw new Error('No article ID provided');
    }
    
    // Ensure articleId is a string
    const id = Array.isArray(articleId) ? articleId[0] : articleId;
    
    if (!id) {
      throw new Error('Invalid article ID');
    }
    
    try {
      console.log(`Making request to: /api/articles/${id}/comments`);
      const response = await api.post(`/articles/${id}/comments`, {
        content
      });
      console.log("Submit comment response:", response.data);
      setRetryCount(0); // Reset retry count on success
      
      // Add the new comment to the beginning of the list
      setComments(prev => [response.data.comment, ...prev]);
      setTotalComments(prev => prev + 1);
      
      return response.data.comment;
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: `/api/articles/${id}/comments`
      });
      
      // Don't reset retry count here - let it bubble up for proper handling
      throw err;
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      await api.delete(`/comments/${commentId}`);
      // Remove the comment from the local state
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
      setTotalComments(prev => Math.max(0, prev - 1));
      return true;
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, [articleId]);

  return { 
    comments, 
    loading, 
    setComments, 
    fetchComments, 
    submitComment, 
    deleteComment,
    currentPage,
    lastPage,
    totalComments,
    hasMore: currentPage < lastPage,
    loadMoreComments
  };
};