'use client';

import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN', 'MANAGER', 'CASHIER']}>
      {children}
    </AuthGuard>
  );
}
