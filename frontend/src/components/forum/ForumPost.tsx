import { ForumPost as ForumPostType } from "@/types/forum";
import { User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ForumPostProps {
  post: ForumPostType;
  onReact?: (postId: string, emoji: string) => void;
  onDelete?: (postId: string) => void;
  canDelete?: boolean;
}

const ForumPost = ({ post, onReact, onDelete, canDelete }: ForumPostProps) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const reactionEmojis = ["👍", "👎", "😂", "😮", "❤️"];

  return (
    <div className="relative bg-transparent border border-cyan-500/30 rounded-sm p-4 transition-all duration-300 hover:border-cyan-400/50 transform skew-x-[-2deg]">
      <div className="transform skew-x-[2deg]">
        {/* Header: author, date, delete */}
        <div className="flex items-center justify-between gap-2 mb-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
              <User className="w-3.5 h-3.5" />
              {post.author.name}
            </span>
            <span className="text-muted-foreground text-xs">
              {formatDate(post.createdAt)}
            </span>
          </div>
          
          {canDelete && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(post.id)}
              className="h-6 w-6 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        
        {/* Content */}
        <p className="text-foreground leading-relaxed mb-3">
          {post.content}
        </p>
        
        {/* Reactions */}
        <div className="flex items-center gap-2 flex-wrap">
          {reactionEmojis.map((emoji) => {
            const reaction = post.reactions?.[emoji];
            const isActive = reaction?.userReacted;
            
            return (
              <button
                key={emoji}
                onClick={() => onReact?.(post.id, emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all border ${
                  isActive
                    ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"
                    : "bg-transparent border-cyan-500/20 text-muted-foreground hover:border-cyan-400/40"
                }`}
              >
                <span>{emoji}</span>
                {reaction?.count ? (
                  <span>{reaction.count}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ForumPost;