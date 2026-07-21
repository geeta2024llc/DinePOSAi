// ============================================================
// DinePosAI - Security Page Route Guard Layout
// ============================================================

'use client';

import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN', 'OWNER', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN', 'CUSTOMER']}>
      {children}
    </AuthGuard>
  );
}
