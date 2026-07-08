'use client';

import React, { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Critical Global Error caught:', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>System Error — DinePOS AI</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
      </head>
      <body style={{ backgroundColor: '#131313', color: '#e5e2e1', margin: 0, padding: 0 }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{
            maxWidth: '440px',
            width: '100%',
            backgroundColor: '#1c1b1b',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'rgba(153, 0, 10, 0.25)',
              border: '1px solid rgba(255, 180, 171, 0.2)',
              color: '#ffb4ab',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>warning</span>
            </div>
            <h2 style={{ color: '#ffe2ab', fontSize: '24px', margin: '0 0 12px 0' }}>Critical System Error</h2>
            <p style={{ color: '#a69984', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              A critical failure occurred in the application shell. We apologize for the inconvenience.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Go Home
              </button>
              <button
                onClick={reset}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#ffe2ab',
                  color: '#402d00',
                  fontWeight: '600',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
