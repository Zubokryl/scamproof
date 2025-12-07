import { FileText, MessageSquare, Users } from "lucide-react";
import styles from "./ProfileStats.module.css";

interface ProfileStatsProps {
  stats: {
    postsCreated: number;
    commentsWritten: number;
    peopleHelped: number;
  };
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <section className={styles.profileStats}>
      <h2 className={styles.statsHeading}>
        Статистика
      </h2>

      <div className={styles.statsGrid}>
        <StatCard 
          icon={<FileText className={styles.statIcon} />} 
          label="Тем" 
          value={stats.postsCreated} 
        />
        <StatCard 
          icon={<MessageSquare className={styles.statIcon} />} 
          label="Коммент." 
          value={stats.commentsWritten} 
        />
        <StatCard 
          icon={<Users className={styles.statIcon} />} 
          label="Помог" 
          value={stats.peopleHelped} 
        />
      </div>
    </section>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIconWrapper}>{icon}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}