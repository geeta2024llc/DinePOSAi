'use client';

import React, { useEffect } from 'react';
import posthog from 'posthog-js';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const isDev = process.env.NODE_ENV === 'development';
    // Skip PostHog in development to avoid noisy 401/404 errors from invalid keys
    if (key && !isDev) {
      try {
        posthog.init(key, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
          person_profiles: 'identified_only',
          capture_pageview: true,
        });
      } catch (e) {
        console.warn('[PostHog] Failed to initialize:', e);
      }
    }
  }, []);

  return <>{children}</>;
}
