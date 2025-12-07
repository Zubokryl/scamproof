'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import "./../../../components/profile/Profile.css";

export default function EditProfilePage() {
  const { user, loading } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Wait for auth loading to complete before checking user status
    if (loading) {
      return;
    }
    
    // If not loading and no user, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // Fetch current profile data
    api.get("/users/profile")
      .then(res => {
        setProfileData({
          name: res.data.name || '',
          bio: res.data.bio || '',
        });
      })
      .catch(err => {
        toast.error("Ошибка при загрузке профиля");
        console.error(err);
      });
  }, [user, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await api.put("/profile", profileData);
      toast.success("Профиль успешно обновлен");
      router.push("/profile");
    } catch (error) {
      toast.error("Ошибка при обновлении профиля");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card profile-edit-form">
            <h1 className="profile-edit-title">Редактирование профиля</h1>
            
            <form onSubmit={handleSubmit}>
              <div className="profile-edit-field">
                <label htmlFor="name" className="profile-edit-label">
                  Имя
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  className="profile-edit-input"
                  required
                />
              </div>
              
              <div className="profile-edit-field">
                <label htmlFor="bio" className="profile-edit-label">
                  О себе
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  className="profile-edit-textarea"
                />
              </div>
              
              <div className="profile-edit-buttons">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="profile-edit-submit-btn"
                >
                  {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => router.push('/profile')}
                  className="profile-edit-cancel-btn"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}