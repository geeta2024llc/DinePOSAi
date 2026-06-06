import React from 'react';
import { Menu, LayoutDashboard, Settings, Users, LogOut } from 'lucide-react';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title = 'Dashboard' }) => {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          DinePosAI
        </div>
        <nav className={styles.nav}>
          <a href="/dashboard" className={`${styles.navItem} ${styles.active}`}>
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </a>
          <a href="/dashboard/menu" className={styles.navItem}>
            <Menu size={20} />
            <span>Menu</span>
          </a>
          <a href="/dashboard/staff" className={styles.navItem}>
            <Users size={20} />
            <span>Staff</span>
          </a>
          <a href="/dashboard/settings" className={styles.navItem}>
            <Settings size={20} />
            <span>Settings</span>
          </a>
        </nav>
        <div className={styles.logoutWrapper}>
          <button className={styles.logoutButton}>
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>A</div>
            <span>Admin</span>
          </div>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};
