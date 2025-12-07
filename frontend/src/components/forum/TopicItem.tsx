import { ForumTopic } from "@/types/forum";
import Link from "next/link";
import { MessageSquare, Eye, Pin, Lock, User } from "lucide-react";

interface TopicItemProps {
  topic: ForumTopic;
}

const TopicItem = ({ topic }: TopicItemProps) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) return "только что";
    if (hours < 24) return `${hours}ч назад`;
    return new Date(date).toLocaleDateString("ru-RU");
  };

  return (
    <Link
      href={`/forum/topic/${topic.id}`}
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
                {topic.postsCount}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {topic.viewsCount}
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
  );
};

export default TopicItem;