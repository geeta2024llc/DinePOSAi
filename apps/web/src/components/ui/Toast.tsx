import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';
import type { ToastType } from './ToastContext';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle className={styles.icon} size={20} />,
    error: <XCircle className={styles.icon} size={20} />,
    info: <Info className={styles.icon} size={20} />
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <div className={styles.content}>
        {icons[type]}
        <span className={styles.message}>{message}</span>
      </div>
      <button onClick={onClose} className={styles.closeButton} aria-label="Close toast">
        <X size={16} />
      </button>
    </div>
  );
};
