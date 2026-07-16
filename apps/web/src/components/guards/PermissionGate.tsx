// ============================================================
// DinePosAI - Client-Side Permission Gate Component
// ============================================================

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGateProps {
  permission: string | string[];
  match?: 'all' | 'any';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * UI Gate to conditionally render children based on the user's granular permissions.
 */
export function PermissionGate({
  permission,
  match = 'all',
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let isAllowed = false;

  if (Array.isArray(permission)) {
    if (match === 'any') {
      isAllowed = hasAnyPermission(permission);
    } else {
      isAllowed = hasAllPermissions(permission);
    }
  } else {
    isAllowed = hasPermission(permission);
  }

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
export default PermissionGate;
