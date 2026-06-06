import React from 'react';
import styles from './POSLayout.module.css';
import { LogOut, Wifi } from 'lucide-react';

interface POSLayoutProps {
  categories: React.ReactNode;
  items: React.ReactNode;
  cart: React.ReactNode;
  isOffline?: boolean;
}

export const POSLayout: React.FC<POSLayoutProps> = ({ categories, items, cart, isOffline = false }) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>DinePosAI - POS</div>
        <div className={styles.statusArea}>
          {isOffline && (
            <div className={styles.offlineBadge}>
              <Wifi size={16} /> Offline Mode
            </div>
          )}
          <div className={styles.user}>Cashier: Sarah</div>
          <button className={styles.logoutBtn} aria-label="Log out">
            <LogOut size={20} />
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <section className={styles.categoriesPanel}>
          {categories}
        </section>
        <section className={styles.itemsPanel}>
          {items}
        </section>
        <section className={styles.cartPanel}>
          {cart}
        </section>
      </main>
    </div>
  );
};
