'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/api/api';
import styles from './ArticlePage.module.css';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageCircle, Send, User, ChevronDown, Trash2 } from 'lucide-react';
import CommentItem from '@/components/CommentItem';
import { useArticle } from '@/hooks/useArticle';
import { useComments } from '@/hooks/useComments';
import { useLike } from '@/hooks/useLike';
import { prepareContent } from '@/utils/content';
import { pluralizeViews, pluralizeLikes, pluralizeComments } from '@/lib/pluralize';

// =============================================================================
// PROTECTIVE COMMENT: ARTICLE STYLING PRESERVATION
// =============================================================================
// 
// IMPORTANT: The styling for article pages (http://localhost:3000/article/id) 
// is considered finalized and excellent. Please preserve all existing styles 
// in ArticlePage.module.css and this component.
//
// DO NOT:
// - Modify existing CSS classes in ArticlePage.module.css
// - Change the structure of article content rendering
// - Alter the color scheme or typography
// - Restructure the comment section styling
// - Change responsive breakpoints or mobile styling
//
// The current design provides:
// - Excellent readability with proper contrast
// - Beautiful gradient text for titles
// - Well-spaced content sections
// - Attractive comment system with reactions
// - Proper mobile responsiveness
// - Consistent branding with the site's color scheme
//
// Any new features should be added without disrupting the existing styling.
// =============================================================================

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  category_id: number;
  pdf_url?: string;
  published_at?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  video_url?: string;
  views_count?: number;
  likes_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
  guest_has_liked?: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  author?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  landing_enabled?: boolean;
  articles_count?: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

interface User {
  id: number;
  name: string;
}

// Type guard to check if error has response property
const isErrorWithResponse = (error: unknown): error is { response?: { status?: number } } => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

const ArticlePage = () => {
  const params = useParams();
  console.log("ArticlePage params:", params);
  
  const router = useRouter();
  const { user } = useAuth();
  // Use ID parameter for routing
  const id = params.id;
  console.log("Article ID from params:", id);
  
  const { article, loading, error, setArticle } = useArticle(id, user);
  const { 
    comments, 
    loading: commentsLoading, 
    setComments, 
    fetchComments, 
    submitComment, 
    deleteComment,
    hasMore,
    loadMoreComments
  } = useComments(id);
  const { liked, setLiked, likesCount, setLikesCount, handleLike, initializeLikeState } = useLike(id, user);
  
  const [category, setCategory] = useState<Category | null>(null);
  const [newComment, setNewComment] = useState('');

  // Function to handle article deletion
  const handleDelete = async () => {
    if (!article) return;
    
    if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      try {
        await api.delete(`/articles/${article.id}`);
        alert('Статья успешно удалена');
        router.push('/database'); // Redirect to articles page
      } catch (err) {
        console.error('Error deleting article:', err);
        alert('Не удалось удалить статью');
      }
    }
  };

  // Function to submit a new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;
    
    // Check if user is authenticated
    if (!user) {
      alert('Пожалуйста, войдите в систему, чтобы оставить комментарий.');
      return;
    }
    
    try {
      console.log("Submitting comment:", newComment);
      const newCommentData = await submitComment(newComment);
      console.log("Comment submitted successfully:", newCommentData);
      
      // Update article comments count
      if (article) {
        setArticle({
          ...article,
          comments_count: (article.comments_count || 0) + 1
        });
      }
      
      setNewComment('');
    } catch (err: unknown) {
      console.error('Error submitting comment:', err);
      
      
      // Handle CSRF errors specifically
      if (isErrorWithResponse(err) && err.response?.status === 419) {
        console.log("CSRF error detected, attempting to refresh token...");
        // Try to reinitialize CSRF and retry once
        try {
          // Force reinitialization of CSRF token
          const apiModule = await import('@/api/api');
          if (apiModule.resetCSRF) {
            apiModule.resetCSRF();
          }
          if (apiModule.initSanctum) {
            await apiModule.initSanctum();
          }
          // Retry the comment submission
          console.log("Retrying comment submission...");
          const newCommentData = await submitComment(newComment);
          
          // Update article comments count
          if (article) {
            setArticle({
              ...article,
              comments_count: (article.comments_count || 0) + 1
            });
          }
          
          setNewComment('');
        } catch (retryErr) {
          console.error('Retry failed:', retryErr);
          alert('Не удалось добавить комментарий. Пожалуйста, обновите страницу и попробуйте снова.');
        }
      } else if (isErrorWithResponse(err) && err.response?.status === 401) {
        alert('Пожалуйста, войдите в систему, чтобы оставить комментарий.');
      } else {
        alert('Не удалось добавить комментарий');
      }
    }
  };

  // Function to delete a comment
  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      // Update comments count
      if (article) {
        setArticle({
          ...article,
          comments_count: Math.max(0, (article.comments_count || 0) - 1)
        });
      }
    } catch (err: unknown) {
      console.error('Error deleting comment:', err);
      
      
      if (isErrorWithResponse(err) && err.response?.status === 401) {
        alert('Пожалуйста, войдите в систему, чтобы удалить комментарий.');
      } else if (isErrorWithResponse(err) && err.response?.status === 403) {
        alert('У вас нет прав для удаления этого комментария.');
      } else {
        alert('Не удалось удалить комментарий');
      }
    }
  };



  // Comment reactions removed

  // Fetch category when article is loaded
  useEffect(() => {
    if (article && article.category) {
      setCategory(article.category);
    } else if (article && article.category_id) {
      const fetchCategory = async () => {
        try {
          const categoryResponse = await api.get(`/categories/${article.category_id}`);
          const categoryData = categoryResponse.data;
          setCategory(categoryData);
        } catch (err) {
          console.error('Error fetching category:', err);
        }
      };
      fetchCategory();
    }
  }, [article]);

  // Load like state from localStorage for guests AND check with backend
  useEffect(() => {
    if (id && !user) {
      const storageKey = `article_like_${id}`;
      // Check if we have a localStorage record
      if (localStorage.getItem(storageKey)) {
        setLiked(true);
      }
    }
  }, [id, user, setLiked]);

  // Set likes count and user liked state when article loads
  useEffect(() => {
    if (article) {
      // Initialize the like state using the helper function
      initializeLikeState(
        article.likes_count || 0,
        user ? (article.user_has_liked || false) : false
      );
      
      // For guests, also check localStorage
      if (!user) {
        const storageKey = `article_like_${article.id}`;
        const hasLikedLocally = localStorage.getItem(storageKey);
        if (hasLikedLocally) {
          // Set the liked state to true if found in localStorage
          setLiked(true);
        }
      }
    }
  }, [article, user, setLiked, initializeLikeState]);

  // Scroll to article if hash is present in URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash) {
      // Try immediately first
      const element = document.querySelector(window.location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      
      // If not found, try again after a delay (in case comments are still loading)
      const scrollToElement = () => {
        const element = document.querySelector(window.location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
        return false;
      };
      
      // Try immediately
      if (scrollToElement()) return;
      
      // Try after 100ms
      const timeout1 = setTimeout(scrollToElement, 100);
      
      // Try after 500ms (in case of slower network)
      const timeout2 = setTimeout(scrollToElement, 500);
      
      // Try after 1000ms (final attempt)
      const timeout3 = setTimeout(scrollToElement, 1000);
      
      // Clean up timeouts
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
      };
    }
  }, [comments]); // Depend only on comments to trigger when they load

  // Apply article page background to body
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.dataset.articlePage = 'true';
    return () => {
      delete document.body.dataset.articlePage;
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Загрузка статьи...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h1 className={styles.errorTitle}>Ошибка</h1>
        <p className={styles.errorMessage}>{error}</p>
        {error.includes('серверу') && (
          <div className={styles.errorDetails}>
            <p>Для запуска backend сервера:</p>
            <ol>
              <li>Откройте терминал</li>
              <li>Перейдите в директорию backend: <code>cd backend</code></li>
              <li>Запустите сервер: <code>php artisan serve</code></li>
            </ol>
          </div>
        )}
      </div>
    );
  }

  if (!article) {
    return (
      <div className={styles.notFoundContainer}>
        <h1 className={styles.notFoundTitle}>Статья не найдена</h1>
        <p className={styles.notFoundMessage}>Запрашиваемая статья не существует или была удалена.</p>
      </div>
    );
  }
  
  return (
    <>
      <article className={styles.article}>
        {/* Article header */}
        <header className={styles.header}>
          <div className={styles.meta}>
            {category && (
              <Link href={`/database/${category.slug}`} className={styles.category}>
                {category.name}
              </Link>
            )}
            {article.published_at && (
              <time className={styles.date}>
                {new Date(article.published_at).toLocaleDateString('ru-RU')}
              </time>
            )}
          </div>
          
          <h1 className={styles.title}>{article.title}</h1>
          
          {article.author && (
            <div className={styles.author}>
              <User className={styles.authorIcon} />
              {/* CRITICAL: ADMIN DISPLAY NAME - DO NOT MODIFY!
                  Admin users should be displayed as "admin" instead of their username
                  This was requested in December 2025 - do not revert this change. */}
              <span>{article.author?.id === 1 ? 'admin' : article.author?.name}</span>
            </div>
          )}
        </header>
        
        {/* Article content */}
        <div 
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: prepareContent(article.content || '') }}
        />
        
        {/* Article media */}
        {(article.thumbnail_url || article.video_url) && (
          <div className={styles.media}>
            {article.thumbnail_url && (
              <img 
                src={article.thumbnail_url} 
                alt={article.title}
                className={styles.thumbnail}
              />
            )}
            
            {article.video_url && (
              <div className={styles.videoContainer}>
                <video 
                  src={article.video_url} 
                  controls 
                  className={styles.video}
                />
                {/* Add spacing below video as per memory requirement */}
                <div style={{ height: '2rem' }}></div>
              </div>
            )}
          </div>
        )}
        
        {/* Article footer with stats and actions */}
        <footer className={styles.footer}>
          <div className={styles.stats}>
            {article.views_count !== undefined && (
              <span className={styles.statItem}>
                👁️ {pluralizeViews(article.views_count)}
              </span>
            )}
            <span 
              className={`${styles.statItem} ${liked ? styles.likedStat : ''}`}
              onClick={() => handleLike()}
              style={{ cursor: 'pointer' }}
            >
              👍 {pluralizeLikes(likesCount)}
            </span>
            {article.comments_count !== undefined && (
              <span className={styles.statItem}>
                💬 {pluralizeComments(article.comments_count)}
              </span>
            )}
          </div>
          
          {/* Like button - remove this separate button since we now have like functionality on the stat item */}
          <div className={styles.interactions} style={{ display: 'none' }}>
            <Button 
              onClick={() => handleLike()}
              variant={liked ? "default" : "outline"}
              className={styles.likeButton}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              {liked ? 'Лайкнута' : 'Лайк'}
            </Button>
          </div>
        </footer>
      </article>
      
      <section className={styles.commentsSection}>
        <h2 className={styles.commentsTitle}>Комментарии</h2>
        
        {/* CRITICAL: COMMENT FORM AUTHENTICATION CHECK - DO NOT REMOVE!
            This conditional rendering ensures that only authenticated users can submit comments.
            Removing this check or allowing anonymous comments will cause all comments to appear
            as anonymous regardless of user authentication status.
            This was fixed in December 2025 - do not revert this change. */}
        {user ? (
          <form onSubmit={handleSubmitComment} className={styles.commentForm}>
            <div className={styles.commentFormInner}>
              <div className={styles.formGroup}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Добавьте ваш комментарий..."
                  className={styles.textarea}
                  rows={3}
                />
              </div>
              <div className={styles.commentActions}>
                <div className={styles.commentActionsLeft}>
                  {/* Emoji picker removed */}
                </div>
                <Button 
                  type="submit" 
                  disabled={!newComment.trim()} 
                  className={styles.submitButton}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Отправить
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className={styles.loginPrompt}>
            <p>Пожалуйста, <Link href="/login">войдите</Link> или <Link href="/register">зарегистрируйтесь</Link>, чтобы оставить комментарий.</p>
          </div>
        )}

        {/* Comments list */}
        <div className={styles.commentsList}>
          {commentsLoading && comments.length === 0 ? (
            <div className={styles.loadingComments}>
              <div className={styles.spinner}></div>
              <p>Загрузка комментариев...</p>
            </div>
          ) : comments.length > 0 ? (
            <>
              {comments.map((comment, index) => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  onDelete={handleDeleteComment}
                  index={index}
                />
              ))}
              {hasMore && (
                <div className={styles.loadMoreContainer}>
                  <Button 
                    onClick={loadMoreComments} 
                    variant="outline" 
                    className={styles.loadMoreButton}
                    disabled={commentsLoading}
                  >
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Загрузить еще
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className={styles.noComments}>Пока нет комментариев. Будьте первым!</p>
          )}
        </div>
      </section>
    </>
  );
};

export default ArticlePage;