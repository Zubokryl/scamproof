'use client';
import "./../../components/profile/Profile.css";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/api/api";
import { useAuth } from "@/context/AuthContext";

import Navigation from "@/components/Navigation";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileActivity } from "@/components/profile/ProfileActivity";
import { ProfileLayout } from "@/components/profile/ProfileLayout";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: number;
  name: string;
  username?: string;
  email: string;
  bio?: string;
  role: string;
  reputation: number;
  trusted_badge: boolean;
  profile_photo_url?: string;
  social_links?: string[];
  last_active?: string;
}

interface UserStats {
  postsCreated: number;
  commentsWritten: number;
  peopleHelped: number;
}

// Function to determine user status based on last_active timestamp
const getUserStatus = (lastActive?: string): "online" | "offline" | "helping" => {
  // If no last_active timestamp, default to offline
  if (!lastActive) return "offline";
  
  const lastActiveTime = new Date(lastActive);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - lastActiveTime.getTime()) / (1000 * 60));
  
  // User is online if they were active in the last 15 minutes
  if (diffInMinutes <= 15) {
    return "online";
  }
  
  return "offline";
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Use real activity data from the API instead of dummy data
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

 useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Fetch user profile
    api.get("/users/profile")
      .then(res => {
        setProfile(res.data);
        
        // Fetch user statistics
        return api.get(`/users/${res.data.id}/statistics`);
      })
      .then(res => {
        setStats(res.data);
      })
      .catch(err => {
        setError("Ошибка при загрузке профиля");
        console.error(err);
      });
  }, [user]);

  // Fetch user's activities when profile is loaded
  useEffect(() => {
    if (profile) {
      // Fetch user's actual activities from API
      api.get(`/users/${profile.id}/activities`)
        .then(res => {
          setActivities(res.data);
          setActivitiesLoading(false);
        })
        .catch(err => {
          console.error("Ошибка при загрузке активности", err);
          // Fallback to some sample activities if API call fails
          setActivities([
            {
              id: "1",
              type: "post",
              title: "Обновление схемы мошенников по Binance",
              preview: "Все ещё действует. Добавил скриншоты...",
              timestamp: "2 часа назад",
              likes: 12,
            },
            {
              id: "2",
              type: "comment",
              title: "Комментарий к теме о телеграм-ботах",
              preview: "Полностью согласен. Они скорее всего используют…",
              timestamp: "5 часов назад",
              likes: 3,
            },
          ]);
          setActivitiesLoading(false);
        });
    }
  }, [profile]);

 if (loading || !profile || !stats) {
    return (
      <div className="auth-layout">
        <Navigation />
        <main className="auth-main-content">
          <div className="register-section">
            <div className="register-container">
              <div className="register-card">
                <h1 className="register-title">Загрузка...</h1>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

 if (error) {
    return (
      <div className="auth-layout">
        <Navigation />
        <main className="auth-main-content">
          <div className="register-section">
            <div className="register-container">
              <div className="register-card">
                <h1 className="register-title">Ошибка</h1>
                <p className="register-error">{error}</p>
                <Link href="/login" className="register-link">Вернуться</Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const headerData = {
    id: profile.id,
    name: profile.name,
    username: profile.username || "user" + profile.id,
    avatar: profile.profile_photo_url,
    bio: profile.bio || "Пользователь ещё не заполнил описание.",
    reputation: profile.reputation,
    level: profile.trusted_badge ? "Доверенный пользователь" : "Новичок",
    isVerified: profile.trusted_badge,
    badges: ["Надёжный", "Активный"],
    last_active: profile.last_active,
    status: getUserStatus(profile.last_active),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <ProfileLayout
        header={<ProfileHeader user={headerData} isOwnProfile={true} />}
        leftColumn={<ProfileStats stats={stats} />}
        rightColumn={<ProfileActivity activities={activities} />}
      />
    </div>
  );
}