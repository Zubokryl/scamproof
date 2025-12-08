import { ForumTopic } from "@/types/forum";
import Link from "next/link";
import { MessageSquare, Eye, Pin, Lock, User, Trash2 } from "lucide-react";
import { pluralizeReplies, pluralizeViews } from '@/lib/pluralize';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/api';
import { useState } from 'react';

interface TopicItemProps {
  topic: ForumTopic;
  onDelete?: (topicId: number) => void;
}

const TopicItem = ({ topic, onDelete }: TopicItemProps) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) return "только что";
    if (hours < 24) return `${hours}ч назад`;
    return new Date(date).toLocaleDateString("ru-RU");
  };

  const handleDelete = async () => {
    if (!user) return;
    
    // Allow either admins or the topic author to delete the topic
    const isAuthorized = user.role === 'admin' || (user.id && topic.author.id && user.id === topic.author.id);
    
    if (!isAuthorized) return;
    
    if (window.confirm('Вы уверены, что хотите удалить эту тему?')) {
      try {
        setIsDeleting(true);
        // Use the slug for API calls as the backend expects it
        await api.delete(`/admin/forum/topics/${topic.slug}`);
        if (onDelete) {
          // Pass the topic id to onDelete as it expects a number
          onDelete(topic.id);
        }
      } catch (err) {
        console.error('Ошибка при удалении темы:', err);
        alert('Не удалось удалить тему');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="relative">
      <Link
        href={`/forum/topic/${topic.slug}`}
        className="block group no-underline"
      >
        <div className="relative bg-transparent border border-cyan-500/30 rounded-sm p-3 transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(0,198,255,0.1)] transform skew-x-[-2deg]">
          <div className="transform skew-x-[2deg]">
            {/* Single row layout */}
            <div className="flex items-center gap-3">
              {/* Icons for pinned/locked */}
              <div className="flex items-center gap-1 w-8">
                {topic.isPinned && <Pin className="w-3 h-3 text-cyan-400" />}
                {topic.isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
              </div>
              
              {/* Title */}
              <h4 className="flex-1 font-medium text-foreground group-hover:text-cyan-400 transition-colors truncate">
                {topic.title}
              </h4>
              
              {/* Author */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-[100px]">
                <User className="w-3 h-3" />
                <span className="truncate">{topic.author.name}</span>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground min-w-[120px]">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {pluralizeReplies(topic.postsCount)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {pluralizeViews(topic.viewsCount)}
                </span>
              </div>
              
              {/* Date */}
              <span className="text-xs text-muted-foreground min-w-[80px] text-right">
                {formatDate(topic.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Delete button for admins and topic authors */}
      {(user?.role === 'admin' || (user?.id && topic.author.id && user.id === topic.author.id)) && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute top-2 right-2 p-1 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
          title="Удалить тему"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default TopicItem;