'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/api/api';
import styles from './ArticlePage.module.css';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageCircle, Send, User } from 'lucide-react';
import EmojiPicker from '@/components/EmojiPicker';

interface Article {
  id: number;
  title: string;
  content: string;
  slug?: string;
  pdf_url?: string;
  published_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  author?: {
    name: string;
  };
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  thumbnail_url?: string;
  video_url?: string;
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

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
  likes_count?: number;
  user_has_liked?: boolean;
}

interface User {
  id: number;
  name: string;
}

const ArticlePage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  // Use ID parameter for routing
  const id = params.id;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(true);
  
  // Like state
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Helper function to parse dates from various formats
  const parseDate = (dateString: string): Date | null => {
    // Try parsing as ISO string first
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
    
    // If the above fails, try parsing as a timestamp
    const timestamp = Date.parse(dateString);
    if (!isNaN(timestamp)) {
      const dateFromTimestamp = new Date(timestamp);
      return dateFromTimestamp;
    }
    
    return null;
  };
  
  // Helper function to format date for display
  const formatDate = (dateString: string): string => {
    const date = parseDate(dateString);
    if (!date) return 'Дата не указана';
    
    return date.toLocaleDateString('ru-RU');
  };

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

  // Function to fetch comments
  const fetchComments = async () => {
    if (!id) return;
    
    try {
      setCommentsLoading(true);
      const response = await api.get(`/articles/${id}/comments`);
      setComments(response.data.data || response.data); // Handle both paginated and direct responses
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Function to submit a new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;
    
    try {
      const response = await api.post(`/articles/${id}/comments`, {
        content: newComment
      });
      
      // Add the new comment to the list
      setComments(prev => [...prev, response.data.comment]);
      setNewComment('');
      
      // Update comments count
      if (article) {
        setArticle({
          ...article,
          comments_count: (article.comments_count || 0) + 1
        });
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Не удалось добавить комментарий');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewComment(prev => prev + emoji);
  };

  // Function to toggle like
  const handleLike = async () => {
    if (!id) return;
    
    try {
      const response = await api.post(`/articles/${id}/like`);
      const newLikedState = response.data.liked;
      
      setLiked(newLikedState);
      
      // Update likes count
      if (newLikedState) {
        setLikesCount(prev => prev + 1);
      } else {
        setLikesCount(prev => Math.max(0, prev - 1));
      }
      
      // Update article likes count
      if (article) {
        setArticle({
          ...article,
          likes_count: newLikedState ? (article.likes_count || 0) + 1 : Math.max(0, (article.likes_count || 0) - 1)
        });
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      alert('Не удалось поставить лайк');
    }
  };

  // Function to handle comment reactions
  const handleCommentReaction = async (commentId: number, emoji: string) => {
    if (!user) {
      alert('Пожалуйста, войдите в систему, чтобы поставить реакцию');
      return;
    }
    
    try {
      // Send reaction to backend
      const response = await api.post(`/comments/${commentId}/like`, {});
      
      // Update local state with new reaction data
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            // Update reactions based on response
            return {
              ...comment,
              likes_count: response.data.liked ? (comment.likes_count || 0) + 1 : Math.max(0, (comment.likes_count || 0) - 1),
              user_has_liked: response.data.liked
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

  // Prepare content for display (handle HTML entities)
  const prepareContent = (content: string): string => {
    // Replace HTML entities
    return content
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  };

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        // Fetch article data
        console.log(`Fetching article with identifier: ${id}`);
        console.log(`NEXT_PUBLIC_BACKEND_URL from env:`, process.env.NEXT_PUBLIC_BACKEND_URL);
        console.log(`API Base URL: ${process.env.NEXT_PUBLIC_BACKEND_URL}/api`);
        console.log(`Request path: /articles/${id}`);
        console.log(`Full expected URL: ${process.env.NEXT_PUBLIC_BACKEND_URL}/api/articles/${id}`);
        
        // Test the API instance configuration
        console.log('API instance config:', api.defaults);
        
        const articleResponse = await api.get(`/articles/${id}`);
        
        // Extract article data (now single-wrapped after backend change)
        const articleData = articleResponse.data;
        setArticle(articleData);
        setLikesCount(articleData.likes_count || 0);
        
        // Fetch category data if not already included in the article
        if (articleData.category) {
          setCategory(articleData.category);
        } else if (articleData.category_id) {
          const categoryResponse = await api.get(`/categories/${articleData.category_id}`);
          const categoryData = categoryResponse.data;
          setCategory(categoryData);
        }
      } catch (err: any) {
        console.error('Error fetching article:', err);
        console.error('Error details:', {
          message: err.message,
          code: err.code,
          response: err.response,
          request: err.request
        });
        
        // Log more detailed error information
        if (err.request) {
          console.error('Request details:', err.request);
        }
        
        // Check if it's a network error
        if (err.code === 'ECONNABORTED' || err.message?.includes('Network Error') || err.message?.includes('ERR_CONNECTION_REFUSED')) {
          setError('Не удалось подключиться к серверу. Пожалуйста, убедитесь, что backend сервер запущен на порту 8000.');
        } else if (err.response?.status === 404) {
          setError('Статья не найдена');
        } else {
          setError('Не удалось загрузить статью. Проверьте соединение с сервером.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  // Fetch comments when article is loaded
  useEffect(() => {
    if (article && id) {
      fetchComments();
    }
  }, [article, id]);

  useEffect(() => {
    // Scroll to article if hash is present in URL
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
              <li>Перейдите в директорию backend: <code>cd c:\scamproof\backend</code></li>
              <li>Запустите сервер: <code>php artisan serve</code></li>
              <li>Убедитесь, что сервер запущен на порту 8000</li>
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
        <header className={styles.header}>
          <h1 className={styles.title}>{article.title}</h1>
          <div className={styles.meta}>
            {(category || article.category) && (
              <Link href={`/database/${(category || article.category)?.slug}`} className={styles.category}>
                Категория: {(category || article.category)?.name}
              </Link>
            )}
            <span className={styles.author}>
              Автор: admin
            </span>
          </div>
        </header>
        
        {/* Display thumbnail if available */}
        {article.thumbnail_url && (
          <div className={styles.thumbnailContainer}>
            <img 
              src={article.thumbnail_url} 
              alt={article.title}
              className={styles.thumbnail}
            />
          </div>
        )}
        
        <div 
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: prepareContent(article.content || '') }}
        />
          
        <footer className={styles.footer}>
          <div className={styles.stats}>
            {article.views_count !== undefined && (
              <span className={styles.statItem}>
                👁️ {article.views_count} просмотров
              </span>
            )}
            <span 
              className={`${styles.statItem} ${liked ? styles.likedStat : ''}`}
              onClick={handleLike}
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
              onClick={handleLike}
              variant={liked ? "default" : "outline"}
              className={styles.likeButton}
            >
              <ThumbsUp className={styles.buttonIcon} />
              {liked ? 'Убрать лайк' : 'Лайк'}
            </Button>
          </div>
          
          {/* Admin buttons - only shown to admin users */}
          {user?.role === 'admin' && article && (
            <div className={styles.adminActions}>
              <Link href={`/admin?edit=${article.id}`} className={styles.editButton}>
                Редактировать
              </Link>
              <button 
                onClick={handleDelete} 
                className={styles.deleteButton}
              >
                Удалить
              </button>
            </div>
          )}
        </footer>
      </article>
      
      {/* Comments section */}
      <section className={styles.commentsSection}>
        <h2 className={styles.commentsTitle}>
          <MessageCircle className={styles.sectionIcon} />
          Комментарии ({comments.length})
        </h2>
        
        {/* Comment form - only for authenticated users */}
        {user ? (
          <form onSubmit={handleSubmitComment} className={styles.commentForm}>
            <div className={styles.formGroup}>
              <label htmlFor="comment" className={styles.formLabel}>
                Добавить комментарий от имени {user.name}:
              </label>
              <textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Введите ваш комментарий..."
                className={styles.textarea}
                rows={4}
                required
              />
              <div className={styles.emojiPickerContainer}>
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              </div>
            </div>
            <Button type="submit" className={styles.submitButton}>
              <Send className={styles.buttonIcon} />
              Отправить
            </Button>
          </form>
        ) : (
          <div className={styles.loginPrompt}>
            <p>
              Чтобы оставить комментарий, пожалуйста{' '}
              <Link href="/login" className={styles.loginLink}>
                войдите
              </Link>{' '}
              или{' '}
              <Link href="/register" className={styles.registerLink}>
                зарегистрируйтесь
              </Link>
              .
            </p>
          </div>
        )}
        
        {/* Comments list */}
        <div className={styles.commentsList}>
          {commentsLoading ? (
            <div className={styles.loadingComments}>
              <p>Загрузка комментариев...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className={styles.noComments}>
              <p>Пока нет комментариев. Будьте первым!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <Link href={`/profile`} className={styles.commentAuthor}>
                    <User className={styles.authorIcon} />
                    {comment.user.name}
                  </Link>
                  <span className={styles.commentDate}>
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <div className={styles.commentContent}>
                  {comment.content}
                </div>
                <div className={styles.commentReactions}>
                  <button 
                    className={`${styles.reactionButton} ${comment.user_has_liked ? styles.userReacted : ''}`}
                    onClick={() => handleCommentReaction(comment.id, '👍')}
                  >
                    <span className={styles.reactionEmoji}>👍</span>
                    <span className={styles.reactionCount}>{comment.likes_count || 0}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default ArticlePage;