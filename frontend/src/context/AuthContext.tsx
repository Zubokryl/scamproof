'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { initSanctum } from '@/api/api';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        await initSanctum();
        // Only try to load user if there's a token
        const token = localStorage.getItem('auth_token');
        if (token) {
          const res = await api.get('/users/profile');
          setUser(res.data);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Login data:', { email, password });
      
      // Make login request without CSRF initialization
      const res = await api.post('/login', { email, password });
      
      console.log('Login response:', res);
      
      // FIX: Better handling of login response
      // The API should return { token: string, user: User }
      if (res.data && res.data.token && res.data.user) {
        // Store the token in localStorage
        localStorage.setItem('auth_token', res.data.token);
        setUser(res.data.user);
      } else {
        throw new Error('Invalid login response from server');
      }
      
      // Don't redirect here - let the calling page handle redirect
    } catch (error) {
      console.error('Login error:', error);
      // Clear any existing token on failed login
      localStorage.removeItem('auth_token');
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      // Ignore logout errors
    }
    // Clear the stored token
    localStorage.removeItem('auth_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// IMPORTANT: Do not modify the login response handling above
// The login API is expected to return { token: string, user: User }
// Changing this structure will break the authentication functionality

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};