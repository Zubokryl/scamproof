"use client";

import SafeCheck from "@/components/SafeCheck";
import Link from "next/link";
import styles from './page.module.css';
import { useState } from "react";

export default function ToolsPage() {
  const [ipAddress, setIpAddress] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Проверка на утечки данных и ненадежные сайты
      </h1>
      <p className={styles.subtitle}>
        Бесплатные инструменты для проверки безопасности ваших данных. 
        Все проверки открываются на сторонних сервисах без сбора вашей информации.
      </p>
      
      <div className={styles.card}>
        <SafeCheck />
      </div>
      
      {/* IP Address Checker Section */}
      <div className={styles.card} style={{ marginTop: '2rem' }}>
        <h2 className={styles.sectionTitle}>Проверка IP адреса</h2>
        <p className={styles.description} style={{ marginBottom: '1.5rem' }}>
          Узнайте геолокацию и провайдера по IP адресу. Это поможет определить, 
          откуда исходит подозрительная активность или проверить местоположение вашего собственного IP.
        </p>
        
        <div className={styles.section}>
          <input
            type="text"
            placeholder="Введите IP адрес: 8.8.8.8"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            className={styles.input}
          />
          <button
            onClick={() => {
              if (!ipAddress) return alert("Введите IP адрес");
              window.open(`https://ipinfo.io/${ipAddress}`, "_blank");
            }}
            className={styles.button}
          >
            Проверить IP адрес
          </button>
          <p className={styles.description} style={{ marginTop: '1rem' }}>
            Откроется ipinfo.io — подробная информация о местоположении и провайдере IP адреса.
          </p>
          <p className={styles.description} style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
            Введите IPv4 или IPv6 адрес в формате: 192.168.1.1 или 2001:0db8:85a3:0000:0000:8a2e:0370:7334
          </p>
        </div>
        
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(10, 14, 39, 0.5)', borderRadius: '8px', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
          <h3 style={{ color: '#00d9ff', marginBottom: '0.5rem' }}>Что показывает проверка IP:</h3>
          <ul style={{ paddingLeft: '1.2rem', color: '#a0aec0', fontSize: '0.9rem' }}>
            <li>Страна, регион и город</li>
            <li>Интернет-провайдер (ISP)</li>
            <li>Организация или компания</li>
            <li>Координаты (широта/долгота)</li>
            <li>Часовой пояс</li>
          </ul>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#a0aec0' }}>
            <strong>Для чего это нужно:</strong> Проверка помогает выявить несоответствия 
            (например, если письмо якобы из России, а IP указывает на другой регион).
          </p>
        </div>
      </div>
      
      {/* Website Reputation Checker Section */}
      <div className={styles.card} style={{ marginTop: '2rem' }}>
        <h2 className={styles.sectionTitle}>Проверка сайта на репутацию</h2>
        <p className={styles.description} style={{ marginBottom: '1.5rem' }}>
          Проверьте, является ли сайт безопасным и доверенным. Особенно полезно перед вводом персональных данных.
        </p>
        
        <div className={styles.section}>
          <input
            type="text"
            placeholder="Введите адрес сайта: https://example.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className={styles.input}
          />
          <button
            onClick={() => {
              if (!websiteUrl) return alert("Введите адрес сайта");
              // Ensure URL has protocol
              let url = websiteUrl.trim();
              if (!/^https?:\/\//i.test(url)) {
                url = 'https://' + url;
              }
              // Extract domain
              try {
                const domain = new URL(url).hostname;
                window.open(`https://www.scamadviser.com/?url=${domain}`, "_blank");
              } catch (e) {
                alert("Введите корректный URL");
              }
            }}
            className={styles.button}
          >
            Проверить сайт на репутацию
          </button>
          <p className={styles.description} style={{ marginTop: '1rem' }}>
            Откроется Scamadviser — проверка сайта на мошенничество с рейтингом доверия.
          </p>
          <p className={styles.description} style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
            Введите полный адрес сайта: https://example.com или example.com
          </p>
        </div>
      </div>
      
      {/* Antivirus Scanners Section */}
      <div className={styles.card} style={{ marginTop: '2rem' }}>
        <h2 className={styles.sectionTitle}>Проверка файлов на вирусы</h2>
        <p className={styles.description} style={{ marginBottom: '1.5rem' }}>
          Бесплатные онлайн-сервисы для проверки файлов на вирусы, трояны и другое вредоносное ПО.
        </p>
        
        <div className={styles.toolsGrid} style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <div className={styles.toolCard}>
            <h3 className={styles.toolTitle}>Jotti</h3>
            <p className={styles.toolDescription}>
              Проверка файлов на вирусы с помощью нескольких антивирусных движков одновременно.
            </p>
            <Link 
              href="https://virusscan.jotti.org" 
              target="_blank"
              className={styles.toolLink}
            >
              Перейти к инструменту →
            </Link>
          </div>
          
          <div className={styles.toolCard}>
            <h3 className={styles.toolTitle}>MetaDefender</h3>
            <p className={styles.toolDescription}>
              Многослойная проверка файлов с использованием более 20 антивирусных решений.
            </p>
            <Link 
              href="https://metadefender.opswat.com" 
              target="_blank"
              className={styles.toolLink}
            >
              Перейти к инструменту →
            </Link>
          </div>
        </div>
        
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(10, 14, 39, 0.5)', borderRadius: '8px', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
          <h3 style={{ color: '#00d9ff', marginBottom: '0.5rem' }}>Как использовать:</h3>
          <ul style={{ paddingLeft: '1.2rem', color: '#a0aec0', fontSize: '0.9rem' }}>
            <li>Скачайте подозрительный файл на ваш компьютер</li>
            <li>Перейдите по одной из ссылок выше</li>
            <li>Загрузите файл на сервис для проверки</li>
            <li>Дождитесь результатов сканирования</li>
          </ul>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#a0aec0' }}>
            <strong>Важно:</strong> Не загружайте конфиденциальные документы — используйте для этого временные файлы.
          </p>
        </div>
      </div>
    </div>
  );
}