'use client';

import { useState, useEffect } from 'react';
import api from '@/api/api';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, MessageCircle, User, Calendar } from 'lucide-react';
import './AdminPanel.css';

interface Comment {
  id: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user: {
    id: number;
    name: string;
  };
  article?: {
    id: number;
    title: string;
    slug: string;
  };
  moderated_by?: number;
  moderation_note?: string;
}

interface ModerationStats {
  pending: number;
  approved_today: number;
  rejected_today: number;
}

const CommentModerationTab = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    pending: 0,
    approved_today: 0,
    rejected_today: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [moderationNote, setModerationNote] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchPendingComments();
    fetchModerationStats();
  }, []);

  const fetchPendingComments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/comments/pending');
      setComments(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching pending comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModerationStats = async () => {
    try {
      const response = await api.get('/admin/comments/moderation/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching moderation stats:', error);
    }
  };

  const handleApprove = async (commentId: number) => {
    try {
      setActionLoading(commentId);
      const note = moderationNote[commentId] || '';
      await api.post(`/admin/comments/${commentId}/approve`, { note });
      
      // Remove approved comment from the list
      setComments(comments.filter(comment => comment.id !== commentId));
      
      // Update stats
      await fetchModerationStats();
      
      // Clear moderation note for this comment
      const newNotes = { ...moderationNote };
      delete newNotes[commentId];
      setModerationNote(newNotes);
    } catch (error) {
      console.error('Error approving comment:', error);
      alert('Failed to approve comment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (commentId: number) => {
    const note = moderationNote[commentId] || '';
    if (!note.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      setActionLoading(commentId);
      await api.post(`/admin/comments/${commentId}/reject`, { note });
      
      // Remove rejected comment from the list
      setComments(comments.filter(comment => comment.id !== commentId));
      
      // Update stats
      await fetchModerationStats();
      
      // Clear moderation note for this comment
      const newNotes = { ...moderationNote };
      delete newNotes[commentId];
      setModerationNote(newNotes);
    } catch (error) {
      console.error('Error rejecting comment:', error);
      alert('Failed to reject comment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleNoteChange = (commentId: number, value: string) => {
    setModerationNote({
      ...moderationNote,
      [commentId]: value
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-spinner"></div>
        <p className="admin-loading-text">Загрузка комментариев...</p>
      </div>
    );
  }

  return (
    <div className="comment-moderation-tab">
      {/* Stats Overview */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <MessageCircle className="admin-stat-icon" />
            <h3 className="admin-stat-title">Ожидают модерации</h3>
          </div>
          <p className="admin-stat-value">{stats.pending}</p>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <ThumbsUp className="admin-stat-icon text-green-500" />
            <h3 className="admin-stat-title">Одобрено сегодня</h3>
          </div>
          <p className="admin-stat-value text-green-500">{stats.approved_today}</p>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <ThumbsDown className="admin-stat-icon text-red-500" />
            <h3 className="admin-stat-title">Отклонено сегодня</h3>
          </div>
          <p className="admin-stat-value text-red-500">{stats.rejected_today}</p>
        </div>
      </div>

      {/* Comments List */}
      <div className="admin-comments-container">
        <h2 className="admin-section-title">Комментарии на модерации ({comments.length})</h2>
        
        {comments.length === 0 ? (
          <div className="admin-empty-state">
            <MessageCircle className="admin-empty-icon" />
            <p className="admin-empty-text">Нет комментариев, ожидающих модерации</p>
          </div>
        ) : (
          <div className="admin-comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="admin-comment-card">
                <div className="admin-comment-header">
                  <div className="admin-comment-user">
                    <User className="admin-comment-user-icon" />
                    <span className="admin-comment-username">{comment.user.name}</span>
                  </div>
                  <div className="admin-comment-meta">
                    <Calendar className="admin-comment-date-icon" />
                    <span className="admin-comment-date">{formatDate(comment.created_at)}</span>
                  </div>
                </div>
                
                {comment.article && (
                  <div className="admin-comment-article">
                    <span className="admin-comment-article-label">Статья:</span>
                    <span className="admin-comment-article-title">{comment.article.title}</span>
                  </div>
                )}
                
                <div className="admin-comment-content">
                  <p>{comment.content}</p>
                </div>
                
                <div className="admin-comment-actions">
                  <div className="admin-moderation-note">
                    <label htmlFor={`note-${comment.id}`} className="admin-note-label">
                      Причина (обязательна для отклонения):
                    </label>
                    <textarea
                      id={`note-${comment.id}`}
                      value={moderationNote[comment.id] || ''}
                      onChange={(e) => handleNoteChange(comment.id, e.target.value)}
                      placeholder="Введите причину одобрения или отклонения..."
                      className="admin-note-textarea"
                      rows={2}
                    />
                  </div>
                  
                  <div className="admin-action-buttons">
                    <Button
                      onClick={() => handleApprove(comment.id)}
                      disabled={actionLoading === comment.id}
                      className="admin-approve-button"
                    >
                      {actionLoading === comment.id ? 'Обработка...' : 'Одобрить'}
                    </Button>
                    
                    <Button
                      onClick={() => handleReject(comment.id)}
                      disabled={actionLoading === comment.id}
                      variant="destructive"
                      className="admin-reject-button"
                    >
                      {actionLoading === comment.id ? 'Обработка...' : 'Отклонить'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentModerationTab;