import { ForumCategory } from "@/types/forum";
import Link from "next/link";
import { MessageSquare, Eye } from "lucide-react";
import { pluralizeTopics, pluralizePosts } from '@/lib/pluralize';

// Fixed import to use Next.js Link instead of react-router-dom

interface CategoryCardProps {
  category: ForumCategory;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) return "только что";
    if (hours < 24) return `${hours}ч назад`;
    return `${Math.floor(hours / 24)}д назад`;
  };

  return (
    <Link
      href={`/forum/${category.slug}`}
      className="block group no-underline"
    >
      <div className="relative bg-transparent border border-cyan-500/30 rounded-sm p-4 transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,198,255,0.15)] transform skew-x-[-2deg]">
        <div className="transform skew-x-[2deg]">
          {/* Header row */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{category.icon}</span>
            <h3 className="text-lg font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors">
              {category.name}
            </h3>
          </div>
          
          {/* Description */}
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {category.description}
          </p>
          
          {/* Stats row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {pluralizeTopics(category.topicsCount)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {pluralizePosts(category.postsCount)}
              </span>
            </div>
            
            {category.lastActivity && (
              <div className="text-muted-foreground text-right max-w-[200px] truncate">
                <span className="text-cyan-400/70">{category.lastActivity.author}</span>
                {" · "}
                {formatDate(category.lastActivity.date)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;