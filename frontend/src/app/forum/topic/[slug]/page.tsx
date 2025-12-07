'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/api';
import styles from './TopicPage.module.css';

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
}

interface ForumReply {
  id: number;
  content: string;
  likes_count: number;
  user_has_liked: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
  children?: ForumReply[];
}

export default function TopicPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  useEffect(() => {
    if (slug) {
      fetchTopic();
    }
  }, [slug]);

  const fetchTopic = async () => {
    // Don't try to fetch if slug is undefined
    if (!slug) {
      setError('Неверный URL темы');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get(`/forum/topics/${slug}`);
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
    });
  };

  const renderReplies = (replies: ForumReply[], depth = 0) => {
    return replies.map((reply) => (
      <div 
        key={reply.id} 
        className={`${styles.reply} ${depth > 0 ? styles.nestedReply : ''}`}
        style={{ marginLeft: depth > 0 ? `${depth * 20}px` : '0' }}
      >
        <div className={styles.replyHeader}>
          <div className={styles.replyAuthor}>
            {reply.user && reply.user.name ? (
              <span className={styles.authorName}>{reply.user.name}</span>
            ) : (
              <span className={styles.authorName}>Аноним</span>
            )}
            <span className={styles.replyDate}>{formatDate(reply.created_at)}</span>
          </div>
          <div className={styles.replyActions}>
            <button 
              className={`${styles.likeButton} ${reply.user_has_liked ? styles.liked : ''}`}
              onClick={() => handleLikeReply(reply.id)}
            >
              ❤️ {reply.likes_count}
            </button>
            {user && (
              <button 
                className={styles.replyButton}
                onClick={() => handleReplyTo(reply.id)}
              >
                Ответить
              </button>
            )}
          </div>
        </div>
        <div className={styles.replyContent}>
          {reply.content}
        </div>
        {reply.children && reply.children.length > 0 && (
          <div className={styles.nestedReplies}>
            {renderReplies(reply.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/forum" className={styles.breadcrumbLink}>
          ← Назад к Форуму
        </Link>
      </div>

      <div className={styles.topicHeader}>
        <h1 className={styles.topicTitle}>{topic.title}</h1>
        <div className={styles.topicMeta}>
          {topic.author && (
            <span className={styles.author}>от {topic.author.name}</span>
          )}
          <span className={styles.date}>{formatDate(topic.created_at)}</span>
          {topic.category && topic.category.name && topic.category.slug && (
            <span className={styles.category}>
              <Link href={`/forum/category/${topic.category.slug}`} className={styles.categoryLink}>
                {topic.category.name}
              </Link>
            </span>
          )}
        </div>
      </div>

      <div className={styles.topicContent}>
        {topic.content}
      </div>

      <div className={styles.topicActions}>
        <button 
          className={`${styles.likeButton} ${topic.user_has_liked ? styles.liked : ''}`}
          onClick={handleLikeTopic}
        >
          ❤️ {topic.likes_count} Лайков
        </button>
      </div>

      <div className={styles.repliesSection}>
        {topic.replies_count > 0 && (
          <h2 className={styles.repliesTitle}>
            Ответы ({topic.replies_count})
          </h2>
        )}
        <div className={styles.repliesList}>
          {renderReplies(topic.recent_replies)}
        </div>

        {user && (
          <div className={styles.replyForm}>
            {replyingTo ? <h3 className={styles.replyFormTitle}>Ответить на комментарий</h3> : null}
            <form onSubmit={handleSubmitReply}>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                className={styles.replyTextarea}
                placeholder="Напишите ваш ответ..."
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
                  Отправить ответ
                </button>
              </div>
            </form>
          </div>
        )}

        {!user && (
          <div className={styles.loginPrompt}>
            <p>Пожалуйста, <Link href="/login">войдите</Link>, чтобы оставить ответ.</p>
          </div>
        )}
      </div>
    </div>
  );
}