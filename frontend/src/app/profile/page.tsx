'use client';
import "./../../components/profile/Profile.css";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/api/api";
import { useAuth } from "@/context/AuthContext";

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

export default function ProfilePage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get user ID from query parameters
  const userIdParam = searchParams.get('id');
  const userId = userIdParam ? parseInt(userIdParam, 10) : null;
  
  // Determine if this is the current user's profile
  // FIXED: Logic to correctly identify when viewing own profile vs. other profiles
  // - If no userId param, and user is authenticated, show their own profile
  // - If userId param matches authenticated user's ID, show their own profile
  // - If userId param is different from authenticated user's ID, show other user's profile
  // - If no userId param and user is not authenticated, redirect to login
  // - If userId param and user is not authenticated, allow viewing (guest access)
  const isOwnProfile = (!userId || (currentUser && userId === currentUser.id)) || false;
  
  console.log('Profile page variables:', { userIdParam, userId, currentUser, isOwnProfile });
  
  // Use real activity data from the API instead of dummy data
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    // Redirect to login only if not authenticated and trying to view own profile
    // Allow guest users to view other users' profiles
    // FIXED: Logic to allow guest access to other users' profiles
    if (!currentUser && !userId) {
      router.push("/login");
      return;
    }

    // Function to fetch user profile
    const fetchUserProfile = async () => {
      try {
        console.log('Fetching user profile, userId:', userId, 'isOwnProfile:', isOwnProfile);
      
      // For own profile or other users, use the show endpoint
      const id = isOwnProfile ? currentUser?.id : userId;
      if (id) {
        console.log('Fetching user profile with ID:', id);
        const res = await api.get(`/users/${id}`);
        console.log('User profile response:', res.data);
        setProfile(res.data);
        
        // Only fetch user statistics for own profile or if user has permission
        if (isOwnProfile || (currentUser && currentUser.id === id)) {
          try {
            const statsRes = await api.get(`/users/${id}/statistics`);
            console.log('Statistics response:', statsRes.data);
            setStats(statsRes.data);
          } catch (statsErr: any) {
            console.error('Error fetching user statistics:', statsErr);
            // Set default stats if unable to fetch
            setStats({
              postsCreated: 0,
              commentsWritten: 0,
              peopleHelped: 0
            });
          }
        } else {
          // For other users, set default stats
          setStats({
            postsCreated: 0,
            commentsWritten: 0,
            peopleHelped: 0
          });
        }
      } else {
        setError("Не удалось определить пользователя для отображения");
      }
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      if (err.response?.status === 404) {
        setError("Пользователь не найден");
      } else {
        setError("Ошибка при загрузке профиля");
      }
      console.error(err);
    }
  };

    // Fetch user profile
    fetchUserProfile();
  }, [currentUser, userId, isOwnProfile]); // Dependencies

  // Fetch user's activities when profile is loaded
  useEffect(() => {
    if (profile) {
      // Only fetch activities for own profile or if user has permission
      if (isOwnProfile || (currentUser && currentUser.id === profile.id)) {
        // Fetch user's actual activities from API
        Promise.all([
          api.get(`/users/${profile.id}/activities`).catch(err => {
            console.error("Error fetching activities:", err);
            return { data: [] };
          }),
          api.get(`/users/${profile.id}/comments`).catch(err => {
            console.error("Error fetching comments:", err);
            return { data: [] };
          })
        ])
          .then(([activitiesRes, commentsRes]) => {
            // Combine activities and comments
            const allActivities = [
              ...activitiesRes.data,
              ...commentsRes.data
            ];
            
            // Sort by date (newest first)
            allActivities.sort((a, b) => {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            
            setActivities(allActivities);
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
      } else {
        // For other users, show limited or no activities
        setActivities([]);
        setActivitiesLoading(false);
      }
    }
  }, [profile, isOwnProfile, currentUser]);

 if (authLoading || (!isOwnProfile && !userId)) {
    return (
      <div className="auth-layout">
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
        <main className="auth-main-content">
          <div className="register-section">
            <div className="register-container">
              <div className="register-card">
                <h1 className="register-title">Ошибка</h1>
                <p className="register-error">{error}</p>
                <Link href="/database" className="register-link">Вернуться</Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show loading state while profile is loading
  if (!profile || !stats) {
    return (
      <div className="auth-layout">
        <main className="auth-main-content">
          <div className="register-section">
            <div className="register-container">
              <div className="register-card">
                <h1 className="register-title">Загрузка профиля...</h1>
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
    status: getUserStatus(profile.last_active) || "offline",
  };

  // Debug log to see what status is being determined
  console.log('Profile status determination:', {
    last_active: profile.last_active,
    calculated_status: headerData.status,
    now: new Date(),
    last_active_date: profile.last_active ? new Date(profile.last_active) : null,
    time_diff: profile.last_active ? Math.floor((new Date().getTime() - new Date(profile.last_active).getTime()) / (1000 * 60)) : null
  });

  return (
    <div className="min-h-screen bg-background text-foreground">

      <ProfileLayout
        header={<ProfileHeader user={headerData} isOwnProfile={isOwnProfile} />}
        leftColumn={<ProfileStats stats={stats} />}
        rightColumn={<ProfileActivity activities={activities} />}
      />
    </div>
  );
}
