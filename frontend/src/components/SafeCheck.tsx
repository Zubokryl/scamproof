"use client";
import { useState } from "react";
import styles from './SafeCheck.module.css';

export default function SafeCheck() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [site, setSite] = useState("");

  return (
    <div className={styles.container}>

      {/* Проверка Email */}
      <div className={styles.section}>
        <h2 className={styles.title}>Проверка Email на утечки</h2>
        <input
          type="email"
          placeholder="Введите email: name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <button
          onClick={() => {
            if (!email) return alert("Введите email");
            window.open(
              `https://haveibeenpwned.com/account/${encodeURIComponent(email)}`,
              "_blank"
            );
          }}
          className={`${styles.button} ${styles.emailButton}`}
        >
          Проверить Email
        </button>
        <p className={styles.description}>
          Откроется Have I Been Pwned — проверка, попадал ли ваш email в утечки данных.
        </p>
      </div>

      {/* Проверка номера телефона */}
      <div className={styles.section}>
        <h2 className={styles.title}>Проверка номера телефона</h2>
        <input
          type="text"
          placeholder="Введите номер: +79991234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={styles.input}
        />
        <button
          onClick={() => {
            if (!phone) return alert("Введите номер");
            // Format phone number - support international format
            let formattedPhone = phone.trim();
            // If it doesn't start with +, assume it's Russian and add +7
            if (!formattedPhone.startsWith('+')) {
              if (formattedPhone.startsWith('8')) {
                formattedPhone = '+7' + formattedPhone.substring(1);
              } else if (formattedPhone.startsWith('9') && formattedPhone.length === 10) {
                formattedPhone = '+7' + formattedPhone;
              } else {
                formattedPhone = '+7' + formattedPhone;
              }
            }
            // Use Tellows with the formatted number
            window.open(`https://www.tellows.ru/search?q=${encodeURIComponent(formattedPhone)}`, "_blank");
          }}
          className={`${styles.button} ${styles.phoneButton}`}
        >
          Проверить номер
        </button>
        <p className={styles.description}>
          Данные откроются на Tellows — отзывы пользователей и уровень риска номера.
        </p>
        <p className={styles.description} style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
          Введите номер в международном формате: +79991234567 или 89991234567
        </p>
      </div>

      {/* Проверка сайта */}
      <div className={styles.section}>
        <h2 className={styles.title}>Проверка сайта на безопасность</h2>
        <input
          type="text"
          placeholder="Введите адрес сайта: example.com"
          value={site}
          onChange={(e) => setSite(e.target.value)}
          className={styles.input}
        />
        <button
          onClick={() => {
            if (!site) return alert("Введите сайт");
            // Remove protocol if present and encode properly
            let cleanSite = site.replace(/^https?:\/\//, '');
            // Remove trailing slash if present
            cleanSite = cleanSite.replace(/\/$/, '');
            window.open(
              `https://www.virustotal.com/gui/search/${cleanSite}`,
              "_blank"
            );
          }}
          className={`${styles.button} ${styles.siteButton}`}
        >
          Проверить сайт
        </button>
        <p className={styles.description}>
          Откроется VirusTotal — проверка сайта на вирусы, фишинг и репутацию.
        </p>
      </div>

    </div>
  );
}