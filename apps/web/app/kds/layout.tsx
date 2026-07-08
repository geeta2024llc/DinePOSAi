'use client';

import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';
import TrialGate from '@/components/TrialGate';

export default function KdsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN', 'MANAGER', 'KITCHEN']}>
      <TrialGate>{children}</TrialGate>
    </AuthGuard>
  );
}
