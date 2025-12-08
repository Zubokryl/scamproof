'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/api';
import styles from './ChatWindow.module.css';

// Import Pusher and Echo only on the client side
let echoInstance: any = null;

// Try to initialize Echo only if we're in the browser
if (typeof window !== 'undefined') {
  try {
    // Dynamically import the libraries only on the client side
    Promise.all([
      import('laravel-echo'),
      import('pusher-js')
    ]).then(([EchoModule, PusherModule]) => {
      const Echo = EchoModule.default;
      const Pusher = PusherModule.default;
      
      echoInstance = new Echo({
        broadcaster: 'pusher',
        key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'key',
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
        wsHost: process.env.NEXT_PUBLIC_BACKEND_WS_HOST || 'localhost',
        wsPort: 6001,
        wssPort: 6001,
        forceTLS: false,
        encrypted: true,
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        client: Pusher,
        authEndpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`
          }
        }
      });
      
      console.log('Echo initialized successfully');
    }).catch(err => {
      console.error('Failed to load Echo/Pusher:', err);
    });
  } catch (err) {
    console.error('Failed to initialize Echo:', err);
  }
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

interface ChatWindowProps {
  userId: number;
  userName: string;
  userAvatar?: string;
  onBack: () => void;
}

export function ChatWindow({ userId, userName, userAvatar, onBack }: ChatWindowProps) {
  const { user: currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realTimeAvailable, setRealTimeAvailable] = useState(false);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Fetch conversation when component mounts or when user changes
  useEffect(() => {
    const fetchConversation = async () => {
      if (!currentUser || !userId) {
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/messages/conversation/${userId}`);
        console.log('Conversation response:', response.data);
        setMessages(response.data.data || response.data);
      } catch (err: any) {
        console.error('Error fetching conversation:', err);
        setError('Не удалось загрузить переписку');
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [userId, currentUser]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Check if real-time messaging is available
  useEffect(() => {
    // Check if echo is available after a short delay
    const timer = setTimeout(() => {
      if (echoInstance && typeof echoInstance.private === 'function') {
        setRealTimeAvailable(true);
        console.log('Real-time messaging is available');
      } else {
        setRealTimeAvailable(false);
        console.log('Real-time messaging is not available');
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Listen for real-time messages
  useEffect(() => {
    if (!currentUser || !userId || !echoInstance || !realTimeAvailable) {
      return;
    }
    
    let channel: any = null;
    
    try {
      console.log('Setting up real-time listener for user:', currentUser.id);
      channel = echoInstance.private(`chat.${currentUser.id}`);
      
      const handleMessage = (event: any) => {
        console.log('New message received in chat', event.message);
        // Only add message if it's from the current conversation partner
        if ((event.message.sender_id === userId && event.message.receiver_id === currentUser.id) ||
            (event.message.sender_id === currentUser.id && event.message.receiver_id === userId)) {
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
  }, [currentUser, userId, realTimeAvailable]);
  
  // Poll for new messages if real-time is not available
  useEffect(() => {
    if (realTimeAvailable || !currentUser || !userId) {
      return;
    }
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/messages/conversation/${userId}`);
        const latestMessages = response.data.data || response.data;
        
        // Check if there are new messages
        if (latestMessages.length > messages.length) {
          setMessages(latestMessages);
        }
      } catch (err) {
        console.error('Error polling for messages:', err);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentUser, userId, messages.length, realTimeAvailable]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser || !userId) {
      return;
    }
    
    setSending(true);
    setError(null);
    
    try {
      const response = await api.post('/messages', {
        receiver_id: userId,
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
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <section className={styles.chatWindow}>
      <div className={styles.chatHeader}>
        <button 
          className={styles.backButton}
          onClick={onBack}
        >
          ← Назад
        </button>
        <div className={styles.userInfo}>
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt={userName} 
              className={styles.userAvatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {userName.charAt(0)}
            </div>
          )}
          <span className={styles.userName}>{userName}</span>
        </div>
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      {!realTimeAvailable && (
        <div className={styles.infoMessage}>
          Режим оффлайн: сообщения обновляются каждые 5 секунд
        </div>
      )}
      
      <div className={styles.messagesContainer}>
        {loading ? (
          <div className={styles.loading}>Загрузка переписки...</div>
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