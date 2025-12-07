'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api, { initSanctum } from '@/api/api';
import Link from 'next/link';
import './register.css';

const RegisterPage = () => {
  const { login, user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const validateEmail = (email: string) =>
    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
        <div className="register-section">
          <div className="register-container">
            <div className="form-wrapper">
              <div className="register-card">
                <form onSubmit={handleSubmit}>
                  <h1 className="register-title">Регистрация</h1>
                  {error && <p className="register-error">{error}</p>}
                  {success && <p className="register-success">{success}</p>}

                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Имя (обязательно)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="register-input"
                    />
                    <p className="input-hint">Обязательное поле. Используйте настоящее имя.</p>
                  </div>

                  <div className="input-group">
                    <input
                      type="email"
                      placeholder="Email (например, test@mail.com)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="register-input"
                    />
                    <p className="input-hint">Обязательное поле. Пример: user@example.com</p>
                  </div>

                  <div className="input-group">
                    <input
                      type="password"
                      placeholder="Пароль (не менее 8 символов)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="register-input"
                    />
                    <p className="input-hint">Минимум 8 символов. Используйте буквы, цифры и специальные символы для надежности.</p>
                  </div>

                  <div className="input-group">
                    <input
                      type="password"
                      placeholder="Повторите пароль"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="register-input"
                    />
                    <p className="input-hint">Повторите пароль для подтверждения.</p>
                  </div>

                  <button type="submit" className="register-button">Зарегистрироваться</button>
                </form>

                {/* Ссылка на логин под формой */}
                <p className="register-login-note">
                  Уже есть аккаунт? <Link href="/login" className="register-link">Войдите здесь</Link>.
                </p>
              </div>
            </div>

            {/* Блок преимуществ регистрации */}
            <div className="register-info">
              <h2 className="register-info-title">Что вы получите, пройдя регистрацию</h2>

              <h3>Репутация и доверие</h3>
              <ul>
                <li><strong>Система репутации</strong> — начисление очков за комментарии, топики, подтверждённые доказательства, лайки.</li>
                <li><strong>Значки/бейджи</strong> — визуально выделяет пользователей, которым доверяют больше: {"\"Доказанный пользователь\""}, {"\"Эксперт\""}, {"\"Помог другим\""}. </li>
              </ul>

              <h3>История активности</h3>
              <ul>
                <li><strong>Лента активности</strong> — топики, комментарии, загруженные доказательства, подписки на темы.</li>
              </ul>

              <h3>Верификация информации</h3>
              <ul>
                <li><strong>Подтверждение скринов</strong> — прикрепляйте переписки или платежи, а другие пользователи могут подтвердить или отметить сомнительное.</li>
                <li><strong>Метка {"\"подтверждено модератором\""}</strong> для доказательств.</li>
              </ul>

              <h3>Социальная составляющая</h3>
              <ul>
                <li><strong>Подписки на пользователей</strong> — следите за надежными информаторами.</li>
                <li><strong>Список доверенных контактов</strong> — общение только с подтвержденными пользователями.</li>
                <li><strong>Отзывы и рейтинг</strong> — краткие отзывы о полезности действов пользователя.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;