import React from 'react';
import Link from 'next/link';
import styles from './PublicLayout.module.css';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>DinePosAI</div>
        <nav className={styles.nav}>
          <Link href="/login" className={styles.link}>Sign In</Link>
          <Link href="/register" className={styles.buttonLink}>Get Started</Link>
        </nav>
      </header>
      <main className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} DinePosAI. All rights reserved.</p>
      </footer>
    </div>
  );
};
