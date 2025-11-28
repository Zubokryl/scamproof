import { useState } from "react";
import "./Profile.css";
import { MessageSquare, FileText, Bell, Clock, ThumbsUp, AlertTriangle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface ActivityItem {
  id: string;
  type: "post" | "comment" | "subscription";
  title: string;
  preview?: string;
  timestamp: string;
  likes?: number;
  // Backend fields
  action?: string;
  description?: string;
  created_at?: string;
}

interface ProfileActivityProps {
  activities: ActivityItem[];
}

const typeConfig = {
  post: {
    icon: <FileText className="profile-activity-icon" />,
    label: "Топик",
    color: "text-primary",
    bgColor: "profile-activity-icon-container post",
  },
  comment: {
    icon: <MessageSquare className="profile-activity-icon" />,
    label: "Комментарий",
    color: "text-accent",
    bgColor: "profile-activity-icon-container comment",
  },
  subscription: {
    icon: <Bell className="profile-activity-icon" />,
    label: "Подписка",
    color: "text-muted-foreground",
    bgColor: "profile-activity-icon-container subscription",
  },
};

export function ProfileActivity({ activities }: ProfileActivityProps) {
  const [filter, setFilter] = useState("all");

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true;
    return activity.type === filter;
  });

  const handleViewAll = (type: string) => {
    toast.info(`Показать все ${type === "post" ? "темы" : "комментарии"}`);
  };

  return (
    <section className="profile-activity">
      <h2 className="profile-activity-header">
        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        Активность
      </h2>

      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList className="profile-tabs-list">
          <TabsTrigger
            value="all"
            className="profile-tab-trigger"
          >
            Все
          </TabsTrigger>
          <TabsTrigger
            value="post"
            className="profile-tab-trigger"
          >
            Темы
          </TabsTrigger>
          <TabsTrigger
            value="comment"
            className="profile-tab-trigger"
          >
            Коммент.
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-0">
          <div className="profile-activity-list">
            {filteredActivities.length === 0 ? (
              <div className="profile-activity-empty">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Нет активности</p>
              </div>
            ) : (
              filteredActivities.map((activity, idx) => (
                <ActivityCard key={activity.id} activity={activity} index={idx} />
              ))
            )}
          </div>

          {/* View all buttons */}
          {filter !== "all" && filteredActivities.length > 0 && (
            <Button
              variant="ghost"
              className="profile-view-all-button"
              onClick={() => handleViewAll(filter)}
            >
              Смотреть все {filter === "post" ? "темы" : "комментарии"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}

function ActivityCard({ activity, index }: { activity: ActivityItem; index: number }) {
  const config = typeConfig[activity.type];

  return (
    <article className="profile-activity-card" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="profile-activity-content">
        <div className={config.bgColor}>
          {config.icon}
        </div>

        <div className="profile-activity-details">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="outline" className="profile-activity-badge">
              {config.label}
            </Badge>
          </div>

          <h3 className="profile-activity-title">
            {activity.title}
          </h3>

          {activity.preview && (
            <p className="profile-activity-preview">{activity.preview}</p>
          )}

          <div className="profile-activity-meta">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {activity.timestamp}
            </span>
            {activity.likes !== undefined && (
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                {activity.likes}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
