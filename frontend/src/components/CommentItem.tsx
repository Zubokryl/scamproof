import Link from 'next/link';
import { User, Trash2 } from 'lucide-react';
import styles from './ArticlePage.module.css';
import { formatDate } from '@/utils/date';
import { useAuth } from '@/context/AuthContext';

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

interface CommentItemProps {
  comment: Comment;
  onReact: (commentId: number, reaction: string) => void;
  onDelete: (commentId: number) => void;
  index?: number; // Add index prop for staggered animations
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReact, onDelete, index = 0 }) => {
  const { user } = useAuth();

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      onDelete(comment.id);
    }
  };

  // CRITICAL: USER DETECTION LOGIC - DO NOT MODIFY!
  // This function correctly identifies authenticated vs anonymous users
  // by checking if comment.user.id is not null.
  // Changing this logic will cause authenticated users' comments to appear as anonymous.
  // This was fixed in December 2025 - do not revert this change.
  const isAuthoredByUser = () => {
    return comment.user && comment.user.id !== null;
  };

  // Function to get the display name for the comment author
  const getAuthorDisplayName = () => {
    // If the comment is from an anonymous user, show "Анонимный пользователь"
    if (!isAuthoredByUser()) {
      return 'Анонимный пользователь';
    }
    
    // For authenticated users, check if they are admin (Zubokryl777 with ID 1)
    // CRITICAL: ADMIN DISPLAY NAME - DO NOT MODIFY!
    // Admin users should be displayed as "admin" instead of their username
    // This was requested in December 2025 - do not revert this change.
    if (comment.user?.id === 1) { // Zubokryl777 has ID 1
      return 'admin';
    }
    
    // For other authenticated users, show their actual name
    return comment.user!.name;
  };

  return (
    <div 
      className={styles.comment} 
      id={`comment-${comment.id}`}
      style={{
        animationDelay: `${index * 0.1}s`
      }}
    >
      <div className={styles.commentContentWrapper}>
        <div className={styles.commentMeta}>
          <div className={styles.commentAuthorGroup}>
            <div className={styles.commentAvatar}>
              <User className={styles.authorIcon} />
            </div>
            <Link 
              href={isAuthoredByUser() && comment.user?.id ? `/profile?id=${comment.user.id}` : `/profile`} 
              className={styles.commentAuthor}
            >
              {getAuthorDisplayName()}
            </Link>
          </div>
          <span className={styles.commentDate}>{formatDate(comment.created_at)}</span>
          <div className={styles.commentMetaSpacer} />
          {comment.reactions && Object.keys(comment.reactions).length > 0 && (
            <div className={styles.reactionsList}>
              {Object.entries(comment.reactions).map(([reactionType, reactionData]) => (
                <button
                  key={reactionType}
                  className={`${styles.reactionButton} ${reactionData.user_has_reacted ? styles.userReacted : ''}`}
                  onClick={() => onReact(comment.id, reactionType)}
                >
                  <span className={styles.reactionEmoji}>{reactionType}</span>
                  <span className={styles.reactionCount}>{reactionData.count}</span>
                </button>
              ))}
            </div>
          )}
          {user?.role === 'admin' && (
            <button 
              className={styles.deleteButton}
              onClick={handleDelete}
              title="Удалить комментарий"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        <div className={styles.commentText}>{comment.content}</div>
      </div>
    </div>
  );
};

export default CommentItem;