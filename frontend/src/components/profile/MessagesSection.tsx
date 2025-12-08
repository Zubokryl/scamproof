'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ConversationsList } from './ConversationsList';
import { ChatWindow } from './ChatWindow';
import styles from './MessagesSection.module.css';

interface MessagesSectionProps {
  onInitiateConversation: (userId: number) => void;
}

export function MessagesSection({ onInitiateConversation }: MessagesSectionProps) {
  const { user: currentUser } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [selectedUserAvatar, setSelectedUserAvatar] = useState<string | undefined>(undefined);

  const handleConversationSelect = (userId: number) => {
    // In a real implementation, you would fetch the user details here
    // For now, we'll just set the user ID and simulate user data
    setSelectedUserId(userId);
    setSelectedUserName(`User ${userId}`);
    // setSelectedUserAvatar(...) - would be set from API response
  };

  const handleBack = () => {
    setSelectedUserId(null);
    setSelectedUserName('');
    setSelectedUserAvatar(undefined);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <section className={styles.messagesSection}>
      <h2 className={styles.sectionTitle}>Сообщения</h2>
      
      {selectedUserId ? (
        <ChatWindow 
          userId={selectedUserId}
          userName={selectedUserName}
          userAvatar={selectedUserAvatar}
          onBack={handleBack}
        />
      ) : (
        <ConversationsList onConversationSelect={handleConversationSelect} />
      )}
    </section>
  );
}
