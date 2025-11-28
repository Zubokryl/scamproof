// frontend/src/app/admin/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminPanel from '@/components/admin/AdminPanel';

const AdminPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/login');
      else if (user.role !== 'admin') router.push('/'); // обычные пользователи редирект на главную
    }
  }, [user, loading, router]);

  if (loading) return <div>Проверка прав доступа...</div>;
  if (!user || user.role !== 'admin') return null;

  return <AdminPanel />;
};

export default AdminPage;