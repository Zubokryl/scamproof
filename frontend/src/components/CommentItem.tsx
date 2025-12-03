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
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReact, onDelete }) => {
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
    <div className={styles.comment}>
      <div className={styles.commentHeader}>
        <Link href={`/profile`} className={styles.commentAuthor}>
          <User className={styles.authorIcon} />
          {getAuthorDisplayName()}
        </Link>
        <span className={styles.commentDate}>{formatDate(comment.created_at)}</span>
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
      <div className={styles.commentContent}>{comment.content}</div>
      <div className={styles.commentReactions}>
        <div className={styles.reactionsList}>
          {comment.reactions && Object.keys(comment.reactions).length > 0 ? (
            Object.entries(comment.reactions).map(([reactionType, reactionData]) => (
              <button
                key={reactionType}
                className={`${styles.reactionButton} ${reactionData.user_has_reacted ? styles.userReacted : ''}`}
                onClick={() => onReact(comment.id, reactionType)}
              >
                <span className={styles.reactionEmoji}>{reactionType}</span>
                <span className={styles.reactionCount}>{reactionData.count}</span>
              </button>
            ))
          ) : (
            <span className={styles.noReactions}>Нет реакций</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;