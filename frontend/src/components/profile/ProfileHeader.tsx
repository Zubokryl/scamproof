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
    reputation?: number; // Make reputation optional
    level: string;
    isVerified: boolean;
    status: "online" | "offline" | "helping";
    badges: string[];
    last_active?: string;
  };
  isOwnProfile?: boolean;
}

const statusColors = {
  online: "bg-success",
  offline: "bg-muted-foreground",
  helping: "bg-warning",
};

const statusLabels = {
  online: "В сети",
  offline: "Не в сети",
  helping: "Готов помочь",
};

// Function to determine user status based on last_active timestamp
const getUserStatus = (lastActive?: string): "online" | "offline" | "helping" => {
  // If no last_active timestamp, default to offline
  if (!lastActive) return "offline";
  
  try {
    const lastActiveTime = new Date(lastActive);
    
    // Check if the date is valid
    if (isNaN(lastActiveTime.getTime())) {
      console.warn('Invalid date format for last_active:', lastActive);
      return "offline";
    }
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastActiveTime.getTime()) / (1000 * 60));
    
    // User is online if they were active in the last 15 minutes
    if (diffInMinutes <= 15) {
      return "online";
    }
    
    return "offline";
  } catch (error) {
    console.error('Error parsing last_active date:', lastActive, error);
    return "offline";
  }
};

export function ProfileHeader({ user, isOwnProfile = false }: ProfileHeaderProps) {
  // Determine the actual status based on last_active or use provided status
  // Log for debugging
  console.log('ProfileHeader user data:', user);
  const actualStatus = user.status || getUserStatus(user.last_active) as "online" | "offline" | "helping";
  console.log('Calculated actualStatus:', actualStatus);
  
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
        const response = await api.post(`/users/${user.id}/follow`);
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
  
  const handleEditProfile = () => {
    // Navigate to edit profile page
    window.location.href = '/profile/edit';
  };

  return (
    <section className="glass-card profile-header">
      <div className="profile-header-content">
        {/* Avatar */}
        <div className="profile-avatar-container">
          <div className="profile-avatar-wrapper">
            <Avatar className="profile-avatar">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="profile-avatar-fallback">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span
              className={`profile-status-indicator ${statusColors[actualStatus] || 'bg-muted-foreground'}`}
              title={statusLabels[actualStatus]}
            />
          </div>
        </div>

        {/* Info */}
        <div className="profile-info">
          <div className="profile-name-container">
            <h1 className="profile-name">{user.name}</h1>
            {user.isVerified && (
              <CheckCircle2 className="profile-icon" />
            )}
          </div>

          <p className="profile-bio">{user.bio}</p>

          {/* Reputation metric - only show if reputation exists */}
          {user.reputation !== undefined && (
            <div className="profile-reputation-container">
              <Shield className="profile-icon" />
              <span className="profile-reputation-text">Репутация</span>
              <span className="profile-reputation-value">{user.reputation.toLocaleString()}</span>
            </div>
          )}

          {/* Action buttons - moved inside the profile info section */}
          <div className="profile-actions">
            {isOwnProfile ? (
              <Button className="profile-button" onClick={handleEditProfile}>
                <Settings className="profile-button-icon" />
                Редактировать
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleMessage}
                  className="profile-button"
                >
                  <Send className="profile-button-icon" />
                  Написать
                </Button>
                <Button 
                  onClick={handleAddFriend}
                  className="profile-button profile-button-outline"
                >
                  <UserPlus className="profile-button-icon" />
                  В друзья
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
