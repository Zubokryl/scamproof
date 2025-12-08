'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/api';
import styles from './MessagingSection.module.css';

// Import Pusher and Echo only on the client side
let echoInstance: any = null;
if (typeof window !== 'undefined') {
  import('@/lib/echo').then(module => {
    echoInstance = module.default;
  }).catch(err => {
    console.error('Failed to load Echo:', err);
  });
}

interface PrivateMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: {
    id: number;
    name: string;
    username?: string;
  };
  receiver: {
    id: number;
    name: string;
    username?: string;
  };
}

interface MessagingSectionProps {
  profileUserId: number;
  profileUserName: string;
  isOwnProfile: boolean;
}

export function MessagingSection({ profileUserId, profileUserName, isOwnProfile }: MessagingSectionProps) {
  const { user: currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Debug log to see if this component is being rendered
  console.log('MessagingSection rendered with props:', { 
    profileUserId, 
    profileUserName, 
    isOwnProfile,
    currentUser
  });
  
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Fetch conversation when component mounts or when profile user changes
  useEffect(() => {
    const fetchConversation = async () => {
      // Make sure we have a current user and we're not on our own profile
      if (!currentUser || isOwnProfile) {
        console.log('Skipping conversation fetch:', { currentUser: !!currentUser, isOwnProfile });
        return;
      }
      
      console.log('Fetching conversation between', currentUser.id, 'and', profileUserId);
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/messages/conversation/${profileUserId}`);
        console.log('Conversation response:', response.data);
        setMessages(response.data.data || response.data);
      } catch (err: any) {
        console.error('Error fetching conversation:', err);
        setError('Не удалось загрузить переписку');
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if we should show the messaging section
    if (!isOwnProfile && currentUser) {
      fetchConversation();
    }
  }, [profileUserId, currentUser, isOwnProfile]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Listen for real-time messages
  useEffect(() => {
    if (!currentUser || isOwnProfile || !echoInstance) {
      return;
    }
    
    // Wait a bit for echo to be initialized
    const timer = setTimeout(() => {
      if (!echoInstance) {
        console.log('Echo instance not available yet');
        return;
      }
      
      try {
        const channel = echoInstance.private(`chat.${currentUser.id}`);
        
        const handleMessage = (event: any) => {
          console.log('New message received in conversation', event.message);
          // Only add message if it's from the current conversation partner
          if ((event.message.sender_id === profileUserId && event.message.receiver_id === currentUser.id) ||
              (event.message.sender_id === currentUser.id && event.message.receiver_id === profileUserId)) {
            setMessages(prev => [...prev, event.message]);
          }
        };
        
        channel.listen('.message.sent', handleMessage);
        
        // Cleanup listener on component unmount
        return () => {
          try {
            if (channel && typeof channel.stopListening === 'function') {
              channel.stopListening('.message.sent', handleMessage);
            }
            if (echoInstance && typeof echoInstance.leave === 'function') {
              echoInstance.leave(`chat.${currentUser.id}`);
            }
          } catch (e) {
            console.error('Error leaving channel:', e);
          }
        };
      } catch (e) {
        console.error('Error setting up real-time listener:', e);
      }
    }, 500);
    
    // Cleanup timeout
    return () => {
      clearTimeout(timer);
    };
  }, [currentUser, profileUserId, isOwnProfile]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser || isOwnProfile) {
      return;
    }
    
    setSending(true);
    setError(null);
    
    try {
      const response = await api.post('/messages', {
        receiver_id: profileUserId,
        content: newMessage
      });
      
      console.log('Message sent response:', response.data);
      
      // Add the new message to the messages array
      setMessages(prev => [...prev, response.data.data || response.data]);
      setNewMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError('Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };
  
  // Don't render anything if this is the user's own profile
  if (isOwnProfile || !currentUser) {
    return null;
  }
  
  return (
    <section className={styles.messagingSection} id="messaging-section">
      <h2 className={styles.sectionTitle}>
        Переписка с {profileUserName}
      </h2>
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      <div className={styles.messagesContainer}>
        {loading ? (
          <div className={styles.loading}>Загрузка переписки...</div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className={styles.noMessages}>
                Нет сообщений. Начните диалог первым!
              </div>
            ) : (
              <div className={styles.messagesList}>
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`${styles.message} ${
                      message.sender_id === currentUser.id 
                        ? styles.ownMessage 
                        : styles.otherMessage
                    }`}
                  >
                    <div className={styles.messageContent}>
                      {message.content}
                    </div>
                    <div className={styles.messageTimestamp}>
                      {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </>
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className={styles.messageForm}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение..."
          className={styles.messageInput}
          disabled={sending}
        />
        <button 
          type="submit" 
          className={styles.sendButton}
          disabled={sending || !newMessage.trim()}
        >
          {sending ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
    </section>
  );
}