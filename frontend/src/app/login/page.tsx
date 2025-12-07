'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../register/register.css';
import api, { initSanctum } from '@/api/api';

const LoginPage = () => {
  const { login, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const validateEmail = (email: string) =>
    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs before submitting
    if (!email) {
      setError('Пожалуйста, введите ваш email');
      return;
    }
    
    if (!password) {
      setError('Пожалуйста, введите ваш пароль');
      return;
    }
    
    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return;
    }
    
    try {
      await login(email, password);
      // Redirect will be handled in useEffect based on user role
    } catch (err: unknown) {
      let errorMessage = 'Не удалось войти в систему. Пожалуйста, проверьте введенные данные.';
      
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          // Handle validation errors
          if (err.response.data?.errors?.email) {
            errorMessage = err.response.data.errors.email[0] || 'Пожалуйста, введите корректный email адрес';
          } else if (err.response.data?.errors?.password) {
            errorMessage = err.response.data.errors.password[0] || 'Пароль должен содержать не менее 6 символов';
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          }
        } else if (err.response?.status === 401) {
          errorMessage = 'Неверный email или пароль. Пожалуйста, проверьте введенные данные.';
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Введите имя');
      return;
    }
    if (!validateEmail(email)) {
      setError('Введите корректный email');
      return;
    }
    if (password.length < 8) {
      setError('Пароль должен быть не меньше 8 символов');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      await initSanctum();
      const response = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirm,
      });

      await login(email, password);
      setSuccess('Вы успешно зарегистрировались!');
      // Redirect will be handled in useEffect based on user role
    } catch (err: unknown) {
      let errorMessage = 'Ошибка регистрации. Пожалуйста, проверьте введенные данные.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; errors?: { [key: string]: string[] } }; status?: number } };
        if (axiosErr.response?.status === 422) {
          if (axiosErr.response.data?.errors?.email) {
            errorMessage = axiosErr.response.data.errors.email[0] || "Этот email уже зарегистрирован";
          } else if (axiosErr.response.data?.message === "validation.unique") {
            errorMessage = "Этот email уже зарегистрирован";
          } else if (typeof axiosErr.response.data?.message === 'string') {
            // Check if the message contains 'unique' to identify duplicate email
            if (axiosErr.response.data.message.toLowerCase().includes('unique')) {
              errorMessage = "Этот email уже зарегистрирован";
            } else {
              errorMessage = axiosErr.response.data.message;
            }
          } else {
            errorMessage = 'Ошибка регистрации. Пожалуйста, проверьте введенные данные.';
          }
        } else if (axiosErr.response?.data?.message) {
          errorMessage = axiosErr.response.data.message;
        }
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
      <main className="auth-main-content">
        <div className="register-section login-page">
          <div className="login-container">
            <div className="login-form-wrapper">
              <div className="login-card">
                {isLogin ? (
                  <form onSubmit={handleLoginSubmit} className="login-form">
                    <h1 className="login-title">Вход</h1>
                    {error && <p className="login-error">{error}</p>}
                    {success && <p className="login-success">{success}</p>}

                    <div className="input-group">
                      <input
                        type="email"
                        placeholder="Введите ваш email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input"
                        required
                      />
                    </div>

                    <div className="input-group">
                      <input
                        type="password"
                        placeholder="Пароль (6+ символов)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                        required
                      />
                    </div>

                    <button type="submit" className="login-button">Войти</button>
                    
                    {error && (
                      <div className="login-error-container">
                        <div className="login-error-icon">⚠️</div>
                        <div className="login-error-message">{error}</div>
                      </div>
                    )}

                    <div className="login-footer">
                      <p className="login-note">
                        Нет аккаунта? <button type="button" onClick={() => setIsLogin(false)} className="login-link">Зарегистрироваться</button>
                      </p>
                      <Link href="/" className="login-home-link">← Вернуться на главную</Link>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="register-form">
                    <h1 className="login-title">Регистрация</h1>
                    {error && <p className="login-error">{error}</p>}
                    {success && <p className="login-success">{success}</p>}

                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="login-input"
                      />
                    </div>

                    <div className="input-group">
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input"
                      />
                    </div>

                    <div className="input-group">
                      <input
                        type="password"
                        placeholder="Пароль (не менее 8 символов)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                      />
                    </div>

                    <div className="input-group">
                      <input
                        type="password"
                        placeholder="Повторите пароль"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        className="login-input"
                      />
                    </div>

                    <button type="submit" className="login-button">Зарегистрироваться</button>
                    
                    {error && (
                      <div className="login-error-container">
                        <div className="login-error-icon">⚠️</div>
                        <div className="login-error-message">{error}</div>
                      </div>
                    )}

                    <div className="login-footer">
                      <p className="login-note">
                        Уже есть аккаунт? <button type="button" onClick={() => setIsLogin(true)} className="login-link">Войти</button>
                      </p>
                      <Link href="/" className="login-home-link">← Вернуться на главную</Link>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// IMPORTANT: Do not modify the form submission logic above
// The login form relies on the AuthContext for authentication
// Changing this structure will break the login functionality

export default LoginPage;