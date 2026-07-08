'use client';

import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';
import TrialGate from '@/components/TrialGate';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN', 'MANAGER']}>
      <TrialGate>{children}</TrialGate>
    </AuthGuard>
  );
}
