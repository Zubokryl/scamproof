import { FileText, MessageSquare, Users } from "lucide-react";
import "./Profile.css";

interface ProfileStatsProps {
  stats: {
    postsCreated: number;
    commentsWritten: number;
    peopleHelped: number;
  };
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <section className="profile-stats">
      <h2 className="profile-stats-title">
        Статистика
      </h2>

      <div className="profile-stats-grid">
        <StatCard
          icon={<FileText className="profile-stat-icon" />}
          label="Тем"
          value={stats.postsCreated}
        />
        <StatCard
          icon={<MessageSquare className="profile-stat-icon" />}
          label="Коммент."
          value={stats.commentsWritten}
        />
        <StatCard
          icon={<Users className="profile-stat-icon" />}
          label="Помог"
          value={stats.peopleHelped}
        />
      </div>
    </section>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="profile-stat-card">
      <div className="profile-stat-icon">{icon}</div>
      <div className="profile-stat-value">{value}</div>
      <div className="profile-stat-label">{label}</div>
    </div>
  );
}
