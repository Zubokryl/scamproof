import { Shield, MessageCircle, UserPlus, Settings, CheckCircle2, Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/api/api";
import "./Profile.css";

interface ProfileHeaderProps {
  user: {
    id: number;
    name: string;
    username: string;
    avatar?: string;
    bio: string;
    reputation: number;
    level: string;
    isVerified: boolean;
    status: "online" | "offline" | "helping";
    badges: string[];
  };
  isOwnProfile?: boolean;
}

const statusColors = {
  online: "profile-status-online",
  offline: "profile-status-offline",
  helping: "profile-status-helping",
};

const statusLabels = {
  online: "В сети",
  offline: "Не в сети",
  helping: "Готов помочь",
};

export function ProfileHeader({ user, isOwnProfile = false }: ProfileHeaderProps) {
  const handleMessage = async () => {
    if (!isOwnProfile) {
      try {
        // In a real implementation, this would send a message to the user
        toast.success("Открываем чат с " + user.name);
      } catch (error) {
        toast.error('Ошибка при отправке сообщения');
        console.error(error);
      }
    } else {
      // Navigate to messages page for own profile
      window.location.href = '/messages';
    }
  };

  const handleAddFriend = async () => {
    if (!isOwnProfile) {
      try {
        const response = await api.post(`/interactions/follow/${user.id}`);
        if (response.status === 200) {
          toast.success(`Заявка в друзья отправлена пользователю ${user.name}`);
        } else {
          toast.error('Ошибка при отправке заявки');
        }
      } catch (error) {
        toast.error('Ошибка при отправке заявки');
        console.error(error);
      }
    }
  };
  
  // Add functionality for following/unfollowing other users
 const handleFollow = async () => {
    if (!isOwnProfile) {
      try {
        const response = await api.post(`/interactions/follow/${user.id}`);
        if (response.status === 200) {
          toast.success(`Вы подписались на ${user.name}`);
        } else {
          toast.error('Ошибка при подписке');
        }
      } catch (error) {
        toast.error('Ошибка при подписке');
        console.error(error);
      }
    }
  };

  return (
    <section className="profile-header">
      <div className="profile-header-content">
        {/* Avatar */}
        <div className="profile-avatar-container">
          <Avatar className="profile-avatar">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-secondary text-xl sm:text-2xl font-bold">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span
            className={`profile-status-indicator ${statusColors[user.status]}`}
            title={statusLabels[user.status]}
          />
        </div>

        {/* Info */}
        <div className="profile-info">
          <div className="profile-name-container">
            <h1 className="profile-name">{user.name}</h1>
            {user.isVerified && (
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            )}
            {/* Badges next to name */}
            {user.badges.slice(0, 2).map((badge) => (
              <Badge
                key={badge}
                className="bg-purple/20 text-accent border-accent/30 text-[10px] sm:text-xs"
              >
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                {badge}
              </Badge>
            ))}
          </div>

          <p className="profile-username">@{user.username}</p>
          
          <Badge variant="outline" className="profile-level-badge">
            {user.level}
          </Badge>

          <p className="profile-bio">{user.bio}</p>

          {/* Reputation metric */}
          <div className="profile-reputation-container">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="profile-reputation-text">Репутация</span>
            <span className="profile-reputation-value">{user.reputation.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="profile-actions">
        {isOwnProfile ? (
          <Button className="profile-button">
            <Settings className="w-4 h-4 mr-2" />
            Редактировать
          </Button>
        ) : (
          <>
            <Button
              onClick={handleMessage}
              className="profile-button"
            >
              <Send className="w-4 h-4 mr-2" />
              Написать
            </Button>
            <Button
              onClick={handleAddFriend}
              variant="outline"
              className="profile-button profile-button-outline"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              В друзья
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
