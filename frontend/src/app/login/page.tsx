'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../register/register.css';
import Navigation from '@/components/Navigation'; // добавляем навигацию

const LoginPage = () => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect will be handled in useEffect based on user role
    } catch (err: unknown) {
      let errorMessage = 'Ошибка входа. Пожалуйста, проверьте введенные данные.';
      
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          // Handle validation errors
          if (err.response.data?.errors?.email) {
            errorMessage = err.response.data.errors.email[0] || 'Неверный email';
          } else if (err.response.data?.errors?.password) {
            errorMessage = err.response.data.errors.password[0] || 'Неверный пароль';
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          }
        } else if (err.response?.data?.message) {
          // Handle specific error messages
          if (typeof err.response.data.message === 'string') {
            if (err.response.data.message.toLowerCase().includes('invalid') || err.response.data.message.toLowerCase().includes('credentials')) {
              errorMessage = 'Неверный email или пароль';
            } else {
              errorMessage = err.response.data.message;
            }
          } else {
            errorMessage = err.response.data.message;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  // Handle redirect based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
    }
  }, [user, router]);

  return (
    <div className="auth-layout">
      <Navigation /> {/* Добавляем навигацию */}
      <main className="auth-main-content">
        <div className="register-section">
          <div className="register-container"> {/* Changed to use the same container as register */}
            <div className="form-wrapper login-form-wrapper"> {/* Changed to use same form wrapper */}
              <div className="register-card"> {/* Changed to use same card styling */}
                <form onSubmit={handleSubmit}>
                  <h1 className="register-title">Вход</h1>
                  {error && <p className="register-error">{error}</p>}

                  <input
                    type="email"
                    placeholder="Email (например, test@mail.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="register-input"
                  />

                  <input
                    type="password"
                    placeholder="Пароль (не менее 6 символов)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="register-input"
                  />

                  <button type="submit" className="register-button">Войти</button>
                </form>

                {/* Ссылка на регистрацию под формой */}
                <p className="register-login-note">
                  Еще не зарегистрированы? <Link href="/register" className="register-link">Зарегистрироваться</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;