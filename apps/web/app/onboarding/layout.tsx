'use client';

import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN', 'OWNER', 'MANAGER']}>
      {children}
    </AuthGuard>
  );
}
