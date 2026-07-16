// ============================================================
// DinePosAI - Client-Side Permission Guard Hook
// ============================================================

import { useAuth } from '../../app/authContext';

/**
 * Hook to enforce granular permission policies on the frontend.
 */
export function usePermissions() {
  const { user } = useAuth();
  const permissions = user?.permissions || [];

  return {
    /**
     * Checks if the user has the specified permission.
     */
    hasPermission: (permission: string): boolean => {
      // Super Admin overrides all permission checks
      if (user?.role === 'SUPER_ADMIN') return true;
      return permissions.includes(permission);
    },

    /**
     * Checks if the user has at least one of the specified permissions.
     */
    hasAnyPermission: (requiredPermissions: string[]): boolean => {
      if (user?.role === 'SUPER_ADMIN') return true;
      return requiredPermissions.some((p) => permissions.includes(p));
    },

    /**
     * Checks if the user has all of the specified permissions.
     */
    hasAllPermissions: (requiredPermissions: string[]): boolean => {
      if (user?.role === 'SUPER_ADMIN') return true;
      return requiredPermissions.every((p) => permissions.includes(p));
    },
    
    /**
     * The raw list of permissions for the active user.
     */
    permissions,
  };
}
