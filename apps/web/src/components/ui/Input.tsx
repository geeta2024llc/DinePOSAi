import React from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, fullWidth = false, ...props }, ref) => {
    const classNames = [
      styles.input,
      error ? styles.hasError : '',
      className
    ].filter(Boolean).join(' ');

    const containerClassNames = [
      styles.container,
      fullWidth ? styles.fullWidth : ''
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClassNames}>
        {label && <label className={styles.label}>{label}</label>}
        <input ref={ref} className={classNames} {...props} />
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
