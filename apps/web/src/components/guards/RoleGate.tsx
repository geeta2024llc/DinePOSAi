// ============================================================
// DinePosAI - Client-Side Role Gate Component
// ============================================================

import React from 'react';
import { useAuth } from '../../../app/authContext';

interface RoleGateProps {
  roles: ('SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'CASHIER' | 'WAITER' | 'KITCHEN' | 'CUSTOMER')[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * UI Gate to conditionally render children based on the user's role.
 */
export function RoleGate({
  roles,
  fallback = null,
  children,
}: RoleGateProps) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
export default RoleGate;
