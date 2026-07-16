// ============================================================
// DinePosAI - Session & Login History Hook
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/utils/api';

export interface UserSession {
  id: string;
  deviceId: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  country: string;
  city: string;
  loginTime: string;
  lastActivity: string;
  isCurrent: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  ip_address: string;
  browser: string;
  device: string;
  os: string;
  country: string;
  city: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  failure_reason: string | null;
  created_at: string;
}

/**
 * Hook to manage user sessions and view login history on the client side.
 */
export function useSession() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequest<UserSession[]>('/api/auth/sessions');
      if (res.success && res.data) {
        setSessions(res.data);
      } else {
        setError(res.error || 'Failed to fetch active sessions.');
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred fetching sessions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLoginHistory = useCallback(async () => {
    try {
      const res = await apiRequest<LoginHistoryEntry[]>('/api/auth/login-history');
      if (res.success && res.data) {
        setLoginHistory(res.data);
      }
    } catch (e: any) {
      console.error('Error fetching login history:', e);
    }
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    setError(null);
    try {
      const res = await apiRequest(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        return true;
      } else {
        setError(res.error || 'Failed to revoke session.');
        return false;
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred revoking session.');
      return false;
    }
  }, []);

  const revokeAllOtherSessions = useCallback(async () => {
    setError(null);
    try {
      // Logout-all handles clearing all sessions except the current one if desired,
      // or we can invoke the logout-all endpoint and re-authenticate, but
      // here logout-all deletes all. If we want logout-all-other, we can
      // easily do it via our endpoint or a separate endpoint.
      // In auth.controller.ts, logoutAll revokes ALL sessions.
      // So to revoke OTHER sessions, we can either implement an endpoint or
      // invoke revokeSession in a loop or call our logout-all and re-login.
      // Wait, let's look at auth.controller.ts logoutAll:
      // it revokes ALL sessions. That's fine, but let's implement logout-all-other!
      // Wait, is it better to just call revokeSession for each other session?
      // Yes, we can just call revokeSession for the non-current sessions, or
      // call a REST endpoint. Let's call revokeSession for all other sessions:
      const otherSessions = sessions.filter(s => !s.isCurrent);
      let success = true;
      for (const s of otherSessions) {
        const ok = await revokeSession(s.id);
        if (!ok) success = false;
      }
      return success;
    } catch (e: any) {
      setError(e.message || 'An error occurred revoking other sessions.');
      return false;
    }
  }, [sessions, revokeSession]);

  useEffect(() => {
    fetchSessions();
    fetchLoginHistory();
  }, [fetchSessions, fetchLoginHistory]);

  return {
    sessions,
    loginHistory,
    isLoading,
    error,
    refreshSessions: fetchSessions,
    refreshLoginHistory: fetchLoginHistory,
    revokeSession,
    revokeAllOtherSessions,
  };
}
