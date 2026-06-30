'use client';

import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      {children}
    </AuthGuard>
  );
}
