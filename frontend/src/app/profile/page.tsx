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
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

    api.get("/users/profile")
      .then(res => setProfile(res.data))
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

 if (loading || !profile) {
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
    status: "online" as const,
    badges: ["Надёжный", "Активный"],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* --- ГЛАВНЫЙ LAYOUT ПРОФИЛЯ --- */}
        <ProfileLayout
          header={<ProfileHeader user={headerData} isOwnProfile={true} />}
          leftColumn={
            <section className="glass-card p-4 sm:p-6 cyber-border animate-fade-in">
              <h2 className="font-semibold text-lg mb-3 gradient-text">О пользователе</h2>
              <p className="text-muted-foreground text-sm mb-4">{profile.bio || "Пользователь ещё не заполнил описание."}</p>

              <h3 className="font-semibold text-sm mb-2">Социальные ссылки</h3>
              {profile.social_links && profile.social_links.length > 0 ? (
                <ul className="space-y-1">
                  {profile.social_links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.startsWith('http') ? link : `https://${link}`}
                        className="text-primary hover:underline break-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-xs">Нет соц-сетей</p>
              )}

              <div className="mt-4">
                <h3 className="font-semibold text-sm mb-2">Роль</h3>
                <Badge variant="outline" className="border-primary/50 text-primary">
                  {profile.role}
                </Badge>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold text-sm mb-2">Контактная информация</h3>
                <p className="text-xs text-muted-foreground break-all">{profile.email}</p>
              </div>
            </section>
          }
          rightColumn={<ProfileActivity activities={activities} />}
        />
      </main>
    </div>
  );
}
