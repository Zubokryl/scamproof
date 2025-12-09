'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/api';
import styles from './ConversationsList.module.css';
import Link from 'next/link';

interface Conversation {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export function ConversationsList({ onConversationSelect }: { onConversationSelect: (userId: number) => void }) {
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) {
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get('/messages/conversations');
        console.log('Conversations response:', response.data);
        setConversations(response.data.data || response.data);
      } catch (err: any) {
        console.error('Error fetching conversations:', err);
        setError('Не удалось загрузить список сообщений');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUser]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <section className={styles.conversationsSection}>
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.conversationsContainer}>
        {loading ? (
          <div className={styles.loading}>Загрузка сообщений...</div>
        ) : conversations.length === 0 ? (
          <div className={styles.noConversations}>У вас пока нет сообщений</div>
        ) : (
          <div className={styles.conversationsList}>
            {conversations.map((conversation) => (
              <div 
                key={conversation.user_id} 
                className={styles.conversation}
                onClick={() => onConversationSelect(conversation.user_id)}
              >
                <div className={styles.avatar}>
                  {conversation.user_avatar ? (
                    <img 
                      src={conversation.user_avatar} 
                      alt={conversation.user_name} 
                      className={styles.avatarImg}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {conversation.user_name.charAt(0)}
                    </div>
                  )}
                  {conversation.unread_count > 0 && (
                    <span className={styles.unreadBadge}>
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
                <div className={styles.conversationInfo}>
                  <div className={styles.userName}>
                    {conversation.user_name}
                  </div>
                  <div className={styles.lastMessage}>
                    {conversation.last_message.substring(0, 30)}
                    {conversation.last_message.length > 30 ? '...' : ''}
                  </div>
                </div>
                <div className={styles.messageTime}>
                  {formatDate(conversation.last_message_time)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}