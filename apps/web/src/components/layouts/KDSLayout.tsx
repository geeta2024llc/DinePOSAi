import React from 'react';
import styles from './KDSLayout.module.css';
import { Wifi, Maximize } from 'lucide-react';

interface KDSLayoutProps {
  newOrders: React.ReactNode;
  cookingOrders: React.ReactNode;
  readyOrders: React.ReactNode;
  isOffline?: boolean;
}

export const KDSLayout: React.FC<KDSLayoutProps> = ({ newOrders, cookingOrders, readyOrders, isOffline = false }) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>DinePosAI - Kitchen Display</div>
        <div className={styles.statusArea}>
          {isOffline && (
            <div className={styles.offlineBadge}>
              <Wifi size={16} /> Offline Mode
            </div>
          )}
          <button className={styles.iconBtn} aria-label="Fullscreen">
            <Maximize size={20} />
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <section className={styles.column}>
          <div className={`${styles.columnHeader} ${styles.new}`}>New Orders</div>
          <div className={styles.columnContent}>{newOrders}</div>
        </section>
        <section className={styles.column}>
          <div className={`${styles.columnHeader} ${styles.cooking}`}>Cooking</div>
          <div className={styles.columnContent}>{cookingOrders}</div>
        </section>
        <section className={styles.column}>
          <div className={`${styles.columnHeader} ${styles.ready}`}>Ready</div>
          <div className={styles.columnContent}>{readyOrders}</div>
        </section>
      </main>
    </div>
  );
};
