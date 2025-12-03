'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/api/api';
import styles from './ArticlePage.module.css';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageCircle, Send, User, ChevronDown } from 'lucide-react';
import EmojiPicker from '@/components/EmojiPicker';
import CommentItem from '@/components/CommentItem';
import { useArticle } from '@/hooks/useArticle';
import { useComments } from '@/hooks/useComments';
import { useLike } from '@/hooks/useLike';
import { prepareContent } from '@/utils/content';

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
  const { liked, setLiked, likesCount, setLikesCount, handleLike } = useLike(id, user);
  
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
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      // Handle CSRF errors specifically
      if (err.response?.status === 419) {
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
      } else if (err.response?.status === 401) {
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
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      alert('Не удалось удалить комментарий');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewComment(prev => prev + emoji);
  };

  // Function to handle comment reactions
  const handleCommentReaction = async (commentId: number, reactionType: string) => {
    try {
      // Send reaction to backend
      const response = await api.post(`/comments/${commentId}/react/${reactionType}`, {});
      
      // Update local state with new reaction data
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            // Create a copy of the reactions object
            const updatedReactions = comment.reactions ? { ...comment.reactions } : {};
            
            // Update the specific reaction type
            if (!updatedReactions[reactionType]) {
              updatedReactions[reactionType] = { count: 0, user_has_reacted: false };
            }
            
            // Toggle user reaction status
            const userHasReacted = updatedReactions[reactionType].user_has_reacted;
            updatedReactions[reactionType] = {
              count: userHasReacted ? updatedReactions[reactionType].count - 1 : updatedReactions[reactionType].count + 1,
              user_has_reacted: !userHasReacted
            };
            
            // If count becomes 0, remove the reaction type
            if (updatedReactions[reactionType].count === 0) {
              delete updatedReactions[reactionType];
            }
            
            return {
              ...comment,
              reactions: updatedReactions
            };
          }
          return comment;
        })
      );
    } catch (err) {
      console.error('Error adding reaction:', err);
      alert('Не удалось добавить реакцию');
    }
  };

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
      setLikesCount(article.likes_count || 0);
      // For authenticated users, check if they've already liked this article
      if (user && article.user_has_liked !== undefined) {
        setLiked(article.user_has_liked);
      }
      // For guests, check if they've already liked this article
      else if (!user && article.guest_has_liked !== undefined) {
        setLiked(article.guest_has_liked);
        // Also update localStorage to match backend state
        const storageKey = `article_like_${article.id}`;
        if (article.guest_has_liked) {
          localStorage.setItem(storageKey, '1');
        } else {
          localStorage.removeItem(storageKey);
        }
      }
      // If we don't have guest_has_liked data but have localStorage data, 
      // we'll rely on the localStorage for now but the next like action will verify with backend
      else if (!user) {
        const storageKey = `article_like_${article.id}`;
        if (localStorage.getItem(storageKey)) {
          setLiked(true);
        }
      }
    }
  }, [article, setLikesCount, user]);

  // Scroll to article if hash is present in URL
  useEffect(() => {
    if (window.location.hash) {
      setTimeout(() => {
        const element = document.querySelector(window.location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
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
    <div className={styles.container}>
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
              <span>{article.author.id === 1 ? 'admin' : article.author.name}</span>
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
                👁️ {article.views_count} просмотров
              </span>
            )}
            <span 
              className={`${styles.statItem} ${liked ? styles.likedStat : ''}`}
              onClick={() => handleLike()}
              style={{ cursor: 'pointer' }}
            >
              👍 {likesCount} лайков
            </span>
            {article.comments_count !== undefined && (
              <span className={styles.statItem}>
                💬 {article.comments_count} комментариев
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
        
        {/* Comments section */}
        <section className={styles.commentsSection}>
          <h2 className={styles.commentsTitle}>Комментарии</h2>
          
          {/* CRITICAL: COMMENT FORM AUTHENTICATION CHECK - DO NOT REMOVE!
              This conditional rendering ensures that only authenticated users can submit comments.
              Removing this check or allowing anonymous comments will cause all comments to appear
              as anonymous regardless of user authentication status.
              This was fixed in December 2025 - do not revert this change. */}
          {user ? (
            <form onSubmit={handleSubmitComment} className={styles.commentForm}>
              <div className={styles.formGroup}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Добавьте ваш комментарий..."
                  className={styles.textarea}
                  rows={4}
                />
              </div>
              <div className={styles.commentActions}>
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                <Button 
                  type="submit" 
                  disabled={!newComment.trim()} 
                  className={styles.submitButton}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Отправить
                </Button>
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
                {comments.map(comment => (
                  <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    onReact={handleCommentReaction}
                    onDelete={handleDeleteComment}
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
      </article>
    </div>
  );
};

export default ArticlePage;