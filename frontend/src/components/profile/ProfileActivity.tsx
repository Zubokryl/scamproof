import { useState } from "react";
import styles from "./ProfileActivity.module.css";
import { MessageSquare, FileText, Bell, Clock, ThumbsUp, AlertTriangle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";

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
  // Comment-specific fields for navigation
  article_id?: number;
  article_slug?: string;
}

interface ProfileActivityProps {
  activities: ActivityItem[];
}

const typeConfig = {
  post: {
    icon: <FileText className={styles.activityIcon} />,
    label: "Топик",
    color: styles.textPrimary,
    bgColor: styles.bgPrimary10,
  },
  comment: {
    icon: <MessageSquare className={styles.activityIcon} />,
    label: "Комментарий",
    color: styles.textAccent,
    bgColor: styles.bgAccent10,
  },
  subscription: {
    icon: <Bell className={styles.activityIcon} />,
    label: "Подписка",
    color: styles.textMutedForeground,
    bgColor: styles.bgMuted50,
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
    <section className={styles.profileActivity}>
      <h2 className={styles.activityHeading}>
        <Clock className={styles.activityIcon} />
        Активность
      </h2>

      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList className={styles.tabsList}>
          <TabsTrigger 
            value="all" 
            className={styles.tabTrigger}
          >
            Все
          </TabsTrigger>
          <TabsTrigger 
            value="post" 
            className={styles.tabTrigger}
          >
            Темы
          </TabsTrigger>
          <TabsTrigger 
            value="comment" 
            className={styles.tabTrigger}
          >
            Коммент.
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className={styles.tabsContent}>
          <div className={styles.activityList}>
            {filteredActivities.length === 0 ? (
              <div className={styles.emptyState}>
                <AlertTriangle className={styles.activityIcon} />
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
              className={styles.viewAllButton}
              onClick={() => handleViewAll(filter)}
            >
              Смотреть все {filter === "post" ? "темы" : "комментарии"}
              <ChevronRight className={styles.activityIcon} />
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}

function ActivityCard({ activity, index }: { activity: ActivityItem; index: number }) {
  const config = typeConfig[activity.type];

  // For comments, we want to navigate to the article with the comment highlighted
  const renderActivityContent = () => {
    if (activity.type === "comment" && activity.article_id) {
      // Create a link to the article with the comment ID as hash
      return (
        <Link 
          href={`/article/${activity.article_id}#comment-${activity.id}`}
          className={styles.activityLink}
        >
          <article
            className={styles.activityCard}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={styles.activityContent}>
              <div className={`${styles.iconContainer} ${config.bgColor} ${config.color}`}>
                {config.icon}
              </div>

              <div className={styles.activityDetails}>
                <div className={styles.badgeContainer}>
                  <Badge variant="outline" className={`${styles.activityBadge} ${config.color}`}>
                    {config.label}
                  </Badge>
                </div>

                <h3 className={styles.activityTitle}>
                  {activity.title}
                </h3>

                {activity.preview && (
                  <p className={styles.activityPreview}>{activity.preview}</p>
                )}

                <div className={styles.activityMeta}>
                  <span className={styles.metaItem}>
                    <Clock className={styles.activityIcon} />
                    {activity.timestamp}
                  </span>
                  {activity.likes !== undefined && (
                    <span className={styles.metaItem}>
                      <ThumbsUp className={styles.activityIcon} />
                      {activity.likes}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </article>
        </Link>
      );
    }

    // For other activities or comments without article_id, render as before
    return (
      <article
        className={styles.activityCard}
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className={styles.activityContent}>
          <div className={`${styles.iconContainer} ${config.bgColor} ${config.color}`}>
            {config.icon}
          </div>

          <div className={styles.activityDetails}>
            <div className={styles.badgeContainer}>
              <Badge variant="outline" className={`${styles.activityBadge} ${config.color}`}>
                {config.label}
              </Badge>
            </div>

            <h3 className={styles.activityTitle}>
              {activity.title}
            </h3>

            {activity.preview && (
              <p className={styles.activityPreview}>{activity.preview}</p>
            )}

            <div className={styles.activityMeta}>
              <span className={styles.metaItem}>
                <Clock className={styles.activityIcon} />
                {activity.timestamp}
              </span>
              {activity.likes !== undefined && (
                <span className={styles.metaItem}>
                  <ThumbsUp className={styles.activityIcon} />
                  {activity.likes}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  };

  return renderActivityContent();
}
