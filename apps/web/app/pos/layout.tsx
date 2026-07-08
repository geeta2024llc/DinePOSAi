'use client';

import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';
import TrialGate from '@/components/TrialGate';

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN', 'MANAGER', 'CASHIER']}>
      <TrialGate>{children}</TrialGate>
    </AuthGuard>
  );
}
