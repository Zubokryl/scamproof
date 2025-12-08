'use client';

/**
 * Forum Topic Page Component
 * 
 * This component displays a single forum topic with:
 * - Topic title, content, and metadata
 * - Breadcrumb navigation
 * - Like functionality for the topic
 * - Replies section with nested comments
 * - Reply form for adding new comments
 * 
 * IMPORTANT STYLING NOTES:
 * - This component uses CSS Modules (TopicPage.module.css) for styling
 * - Do not change the styling approach or file structure
 * - The visual design has been carefully crafted and should remain consistent
 * - All styling decisions have been approved and should not be modified without explicit approval
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/api';
import styles from './TopicPage.module.css';
import { pluralizeLikes } from '@/lib/pluralize';
import { Trash2 } from 'lucide-react';
import ScamEmojiReactions from '@/components/ScamEmojiReactions';

interface ForumTopic {
  id: number;
  title: string;
  slug: string;
  content: string;
  replies_count: number;
  likes_count: number;
  user_has_liked: boolean;
  is_pinned: boolean;
  created_at: string;
  author: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  recent_replies: ForumReply[];
  reactions?: {
    [key: string]: {
      count: number;
      user_has_reacted: boolean;
    };
  };
}

interface ForumReply {
  id: number;
  content: string;
  likes_count: number;
  user_has_liked: boolean;
  created_at: string;
  parent_id?: number;
  user: {
    id: number;
    name: string;
  };
  children?: ForumReply[];
}

export default function TopicPage() {
  const { category } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [inlineReply, setInlineReply] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  useEffect(() => {
    if (category) {
      fetchTopic();
    }
  }, [category]);

  const fetchTopic = async () => {
    // Don't try to fetch if category is undefined
    if (!category) {
      setError('Неверный URL темы');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get(`/forum/topics/${category}`);
      // Extract the actual topic data from the response
      const topicData = response.data.data || response.data;
      setTopic(topicData);
    } catch (err) {
      console.error('Ошибка при загрузке темы:', err);
      setError('Не удалось загрузить тему');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeTopic = async () => {
    if (!user || !topic) return;

    try {
      const response = await api.post(`/forum/topics/${topic.slug}/like`);
      setTopic({
        ...topic,
        likes_count: response.data.likes_count,
        user_has_liked: response.data.liked,
      });
    } catch (err) {
      console.error('Ошибка при лайке темы:', err);
    }
  };

  const handleLikeReply = async (replyId: number) => {
    if (!user) return;

    try {
      const response = await api.post(`/forum/replies/${replyId}/like`);
      
      // Update the reply in the state
      const updateReplies = (replies: ForumReply[]): ForumReply[] => {
        return replies.map(reply => {
          if (reply.id === replyId) {
            return {
              ...reply,
              likes_count: response.data.likes_count,
              user_has_liked: response.data.liked,
            };
          }
          if (reply.children) {
            return {
              ...reply,
              children: updateReplies(reply.children),
            };
          }
          return reply;
        });
      };

      if (topic) {
        setTopic({
          ...topic,
          recent_replies: updateReplies(topic.recent_replies),
        });
      }
    } catch (err) {
      console.error('Ошибка при лайке ответа:', err);
    }
  };

  const handleDeleteTopic = async () => {
    if (!user || !topic) return;
    
    // Allow either admins or the topic author to delete the topic
    const isAuthorized = user.role === 'admin' || (user.id && topic.author?.id && user.id === topic.author.id);
    
    if (!isAuthorized) return;
    
    if (window.confirm('Вы уверены, что хотите удалить эту тему?')) {
      try {
        await api.delete(`/admin/forum/topics/${category}`);
        // Redirect to forum page after successful deletion
        router.push('/forum');
      } catch (err) {
        console.error('Ошибка при удалении темы:', err);
        alert('Не удалось удалить тему');
      }
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topic || !newReply.trim()) return;

    try {
      const response = await api.post(`/forum/topics/${topic.slug}/replies`, {
        content: newReply,
        parent_id: replyingTo,
      });

      // Add the new reply to the state
      if (topic) {
        const updatedTopic = { ...topic };
        if (replyingTo) {
          // Find the parent reply and add to its children
          const updateChildren = (replies: ForumReply[]): ForumReply[] => {
            return replies.map(reply => {
              if (reply.id === replyingTo) {
                return {
                  ...reply,
                  children: [...(reply.children || []), response.data.reply],
                };
              }
              if (reply.children) {
                return {
                  ...reply,
                  children: updateChildren(reply.children),
                };
              }
              return reply;
            });
          };
          updatedTopic.recent_replies = updateChildren(updatedTopic.recent_replies);
        } else {
          // Add as a top-level reply
          updatedTopic.recent_replies = [...updatedTopic.recent_replies, response.data.reply];
        }
        setTopic(updatedTopic);
      }

      setNewReply('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Ошибка при отправке ответа:', err);
    }
  };

  const handleReplyTo = (replyId: number) => {
    setReplyingTo(replyId);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewReply('');
  };

  const cancelInlineReply = () => {
    setReplyingTo(null);
    setInlineReply('');
  };

  const handleInlineReplySubmit = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!user || !topic || !inlineReply.trim()) return;

    try {
      const response = await api.post(`/forum/topics/${topic.slug}/replies`, {
        content: inlineReply,
        parent_id: parentId,
      });

      // Add the new reply to the state
      if (topic) {
        const updatedTopic = { ...topic };
        // Find the parent reply and add to its children
        const updateChildren = (replies: ForumReply[]): ForumReply[] => {
          return replies.map(reply => {
            if (reply.id === parentId) {
              return {
                ...reply,
                children: [...(reply.children || []), response.data.reply],
              };
            }
            if (reply.children) {
              return {
                ...reply,
                children: updateChildren(reply.children),
              };
            }
            return reply;
          });
        };
        updatedTopic.recent_replies = updateChildren(updatedTopic.recent_replies);
        setTopic(updatedTopic);
      }

      setInlineReply('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Ошибка при отправке ответа:', err);
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (!user || !topic) return;
    
    // Find the reply to check if the user is the author
    let targetReply: ForumReply | null = null;
    
    const findReply = (replies: ForumReply[]): ForumReply | undefined => {
      for (const reply of replies) {
        if (reply.id === replyId) {
          return reply;
        }
        if (reply.children) {
          const found = findReply(reply.children);
          if (found) return found;
        }
      }
    };
    
    targetReply = findReply(topic.recent_replies) || null;
    
    // Allow either admins or the reply author to delete the reply
    const isAuthorized = user.role === 'admin' || 
      (targetReply && user.id && targetReply.user?.id && user.id === targetReply.user.id);
    
    if (!isAuthorized) return;
    
    try {
      await api.delete(`/forum/replies/${replyId}`);
      
      // Remove the reply from the state
      const removeReply = (replies: ForumReply[]): ForumReply[] => {
        return replies
          .filter(reply => reply.id !== replyId)
          .map(reply => ({
            ...reply,
            children: reply.children ? removeReply(reply.children) : undefined
          }));
      };
      
      if (topic) {
        setTopic({
          ...topic,
          recent_replies: removeReply(topic.recent_replies)
        });
      }
    } catch (err) {
      console.error('Ошибка при удалении ответа:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка темы...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Тема не найдена</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderReplies = (replies: ForumReply[]) => {
    // First, let's create a set of all reply IDs that have a parent_id (i.e., they are children)
    const childReplyIds = new Set<number>();
    replies.forEach(reply => {
      if (reply.parent_id) {
        childReplyIds.add(reply.id);
      }
    });
    
    // Filter topLevelReplies to exclude any that are actually children of other replies
    const trueTopLevelReplies = replies.filter(reply => !childReplyIds.has(reply.id));
    
    // Create a map for quick lookup
    const replyMap: Record<number, ForumReply> = {};
    replies.forEach(reply => {
      replyMap[reply.id] = reply;
    });
    
    const renderReplyWithInlineForm = (reply: ForumReply, depth: number = 0) => (
      <div key={reply.id}>
        <div className={styles.reply}>
          {/* Show parent comment content for replies directly within the reply box */}
          {reply.parent_id && replyMap[reply.parent_id] && (
            <div className={styles.parentCommentInline}>
              <span className={styles.parentCommentAuthor}>
                {replyMap[reply.parent_id].user && replyMap[reply.parent_id].user.name 
                  ? replyMap[reply.parent_id].user.name 
                  : 'Аноним'}
              </span>
              : <span className={styles.parentCommentContent}>{replyMap[reply.parent_id].content}</span>
            </div>
          )}
          
          <div className={styles.replyHeader}>
            <div className={styles.replyAuthor}>
              {reply.user && reply.user.name ? (
                <span className={styles.authorName}>{reply.user.name}</span>
              ) : (
                <span className={styles.authorName}>Аноним</span>
              )}
              <span className={styles.replyDate}>{formatDate(reply.created_at)}</span>
            </div>
          </div>
          <div className={styles.replyContent}>
            {reply.content}
          </div>
          <div className={styles.replyActions}>
            <ScamEmojiReactions 
              likes_count={reply.likes_count}
              user_has_liked={reply.user_has_liked}
              onLike={() => handleLikeReply(reply.id)}
            />
            {user && (
              <button 
                className={styles.replyButton}
                onClick={() => handleReplyTo(reply.id)}
              >
                Ответить
              </button>
            )}
            {(user && user.role === 'admin' || 
              (user && user.id && reply.user?.id && user.id === reply.user.id)) && (
              <button 
                className={styles.deleteButton}
                onClick={() => handleDeleteReply(reply.id)}
                title="Удалить комментарий"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Inline reply form - appears when user clicks "Reply" on this comment */}
        {replyingTo === reply.id && user && (
          <div className={styles.inlineReplyForm}>
            <form onSubmit={(e) => handleInlineReplySubmit(e, reply.id)}>
              <textarea
                value={inlineReply}
                onChange={(e) => setInlineReply(e.target.value)}
                className={styles.replyTextarea}
                placeholder="Напишите ваш ответ..."
                rows={3}
                required
              />
              <div className={styles.replyFormActions}>
                <button 
                  type="button" 
                  className={styles.cancelReplyButton}
                  onClick={cancelInlineReply}
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className={styles.submitReplyButton}
                  disabled={!inlineReply.trim()}
                >
                  Отправить ответ
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Render nested replies */}
        {reply.children && reply.children.length > 0 && (
          <div className={styles.nestedRepliesContainer}>
            {reply.children.map(child => renderReplyWithInlineForm(child, depth + 1))}
          </div>
        )}
      </div>
    );
    
    return trueTopLevelReplies.map(reply => renderReplyWithInlineForm(reply));
  };

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/forum" className={styles.breadcrumbLink}>
          Форум
        </Link>
        {topic.category && topic.category.slug && topic.category.name && (
          <>
            <span className={styles.breadcrumbSeparator}> / </span>
            <Link href={`/forum/category/${topic.category.slug}`} className={styles.breadcrumbLink}>
              {topic.category.name}
            </Link>
          </>
        )}
        <span className={styles.breadcrumbSeparator}> / </span>
        <span className={styles.currentTopic}>{topic.title}</span>
      </div>

      {/* Combined topic header and content in a single container */}
      <div className={styles.topicCombinedContainer}>
        <div className={styles.topicHeaderTop}>
          <h1 className={styles.topicTitle}>{topic.title}</h1>
          {(user?.role === 'admin' || (user?.id && topic.author?.id && user.id === topic.author.id)) && (
            <button
              className={styles.deleteButton}
              onClick={handleDeleteTopic}
              title="Удалить тему"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        <div className={styles.topicMeta}>
          {topic.author && topic.author.id && (
            <span className={styles.author}>
              от <Link href={`/profile?id=${topic.author.id}`} className={styles.authorLink}>
                {topic.author.name}
              </Link>
            </span>
          )}
          <span className={styles.date}>{formatDate(topic.created_at)}</span>
        </div>
        <div className={styles.topicContent}>
          {topic.content}
        </div>
      </div>

      <div className={styles.topicActions}>
        <ScamEmojiReactions 
          likes_count={topic.likes_count}
          user_has_liked={topic.user_has_liked}
          onLike={handleLikeTopic}
        />
      </div>

      {/* Move the main reply form to the top */}
      {user && (
        <div className={styles.replyForm}>
          <h3 className={styles.replyFormTitle}>Оставить комментарий</h3>
          <form onSubmit={handleSubmitReply}>
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              className={styles.replyTextarea}
              placeholder="Напишите ваш комментарий..."
              rows={4}
              required
            />
            <div className={styles.replyFormActions}>
              {replyingTo && (
                <button 
                  type="button" 
                  className={styles.cancelReplyButton}
                  onClick={cancelReply}
                >
                  Отмена
                </button>
              )}
              <button 
                type="submit" 
                className={styles.submitReplyButton}
                disabled={!newReply.trim()}
              >
                Отправить комментарий
              </button>
            </div>
          </form>
        </div>
      )}

      {!user && (
        <div className={styles.loginPrompt}>
          <p>Пожалуйста, <Link href="/login">войдите</Link>, чтобы оставить комментарий.</p>
        </div>
      )}

      <div className={styles.repliesSection}>
        <div className={styles.repliesList}>
          {renderReplies(topic.recent_replies)}
        </div>
      </div>
    </div>
  );
}