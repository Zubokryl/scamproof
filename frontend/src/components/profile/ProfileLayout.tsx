import { ReactNode } from "react";
import styles from "./ProfileLayout.module.css";

interface ProfileLayoutProps {
  header: ReactNode;
  leftColumn: ReactNode;
  rightColumn: ReactNode;
}

export function ProfileLayout({ header, leftColumn, rightColumn }: ProfileLayoutProps) {
  return (
    <main className={styles.main}>
      {/* Background decoration */}
      <div className={styles.backgroundDecoration}>
        <div 
          className={styles.backgroundGradient}
        />
        <div className={styles.cyanCircle} />
        <div className={styles.purpleCircle} />
      </div>

      <div className={styles.container}>
        {/* Header section */}
        <header className={styles.header}>{header}</header>

        {/* Two column layout - stacked on mobile */}
        <div className={styles.grid}>
          {/* Left column - stats */}
          <aside className={styles.leftColumn}>{leftColumn}</aside>

          {/* Right column - activity feed */}
          <section className={styles.rightColumn}>{rightColumn}</section>
        </div>
      </div>
    </main>
  );
}