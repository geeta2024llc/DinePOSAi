import { apiRequest } from './api';

export interface ActivityLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata: {
    category: 'Security' | 'Billing' | 'Staff' | 'Menu' | 'Settings' | 'CMS' | 'System';
    userName: string;
    userEmail: string;
    role: string;
    [key: string]: any;
  };
  createdAt: string;
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

const LOCAL_LOGS_KEY = 'dinepos_audit_logs';
const MAX_LOCAL_LOGS = 200;

/**
 * Record a user action to the activity log.
 * Synchronizes with database API and falls back to LocalStorage when offline.
 */
export async function recordActivity(
  action: string,
  details: string,
  category: 'Security' | 'Billing' | 'Staff' | 'Menu' | 'Settings' | 'CMS' | 'System',
  metadata: Record<string, any> = {}
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Get current logged in user details from localStorage
    const storedAccount = localStorage.getItem('dinepos_user_account');
    if (!storedAccount) return false;

    const parsed = JSON.parse(storedAccount);
    // Support nested or flat structure from authContext
    const user = parsed.user || parsed;
    const tenant = parsed.tenant || parsed;

    if (!user || !user.email) return false;

    const logMetadata = {
      ...metadata,
      category,
      userName: user.fullName || user.name || 'Unknown User',
      userEmail: user.email,
      role: user.role || 'MANAGER',
      details // Store details here for local serialization consistency
    };

    const newLocalLog: ActivityLog = {
      id: `act-${Math.random().toString(36).substring(2, 9)}`,
      tenantId: tenant.tenantId || tenant.id || 'offline-tenant-id',
      userId: user.id || 'offline-user-id',
      action,
      entityType: category.toLowerCase(),
      metadata: logMetadata,
      createdAt: new Date().toISOString(),
      user: {
        name: logMetadata.userName,
        email: logMetadata.userEmail,
        role: logMetadata.role
      }
    };

    // 2. Append to Local Storage immediately for offline capability / local caching
    const existingLogsStr = localStorage.getItem(LOCAL_LOGS_KEY);
    let localLogs: ActivityLog[] = [];
    if (existingLogsStr) {
      try {
        localLogs = JSON.parse(existingLogsStr);
      } catch {
        localLogs = [];
      }
    }
    localLogs.unshift(newLocalLog);
    if (localLogs.length > MAX_LOCAL_LOGS) {
      localLogs = localLogs.slice(0, MAX_LOCAL_LOGS);
    }
    localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(localLogs));

    // 3. Try to sync to the server
    const response = await apiRequest('/api/audit/logs', {
      method: 'POST',
      body: JSON.stringify({
        action,
        entityType: category.toLowerCase(),
        metadata: logMetadata,
        tenantId: tenant.tenantId || tenant.id
      })
    });

    return response.success;
  } catch (err) {
    console.error('[ActivityLogger] Error recording activity:', err);
    return false;
  }
}

/**
 * Retrieve activity logs. Falls back to LocalStorage when offline.
 */
export async function getActivityLogs(
  filters: {
    category?: string;
    action?: string;
    tenantId?: string;
  } = {}
): Promise<ActivityLog[]> {
  if (typeof window === 'undefined') return [];

  try {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.set('category', filters.category);
    if (filters.action) queryParams.set('action', filters.action);
    if (filters.tenantId) queryParams.set('tenantId', filters.tenantId);

    const response = await apiRequest<ActivityLog[]>(`/api/audit/logs?${queryParams.toString()}`);

    if (response.success && response.data) {
      return response.data;
    }

    // Fallback: Read local storage logs
    const localLogsStr = localStorage.getItem(LOCAL_LOGS_KEY);
    if (localLogsStr) {
      let logs: ActivityLog[] = JSON.parse(localLogsStr);

      // Filter locally
      const storedAccount = localStorage.getItem('dinepos_user_account');
      if (storedAccount) {
        const parsed = JSON.parse(storedAccount);
        const user = parsed.user || parsed;
        const tenant = parsed.tenant || parsed;

        // Managers can only see their own tenant's logs
        if (user.role !== 'SUPER_ADMIN') {
          const tId = tenant.tenantId || tenant.id;
          logs = logs.filter(l => l.tenantId === tId);
        } else if (filters.tenantId) {
          logs = logs.filter(l => l.tenantId === filters.tenantId);
        }
      }

      if (filters.category) {
        logs = logs.filter(l => l.metadata?.category === filters.category);
      }
      if (filters.action) {
        logs = logs.filter(l => l.action === filters.action);
      }

      return logs;
    }

    return [];
  } catch (err) {
    console.error('[ActivityLogger] Failed to fetch activity logs:', err);
    // Return local storage logs on error
    const localLogsStr = localStorage.getItem(LOCAL_LOGS_KEY);
    return localLogsStr ? JSON.parse(localLogsStr) : [];
  }
}

/**
 * Clear activity logs for the current workspace.
 */
export async function clearActivityLogs(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    // Clear in localStorage
    localStorage.removeItem(LOCAL_LOGS_KEY);

    // Call API to clear DB logs
    const response = await apiRequest('/api/audit/logs', {
      method: 'DELETE'
    });

    return response.success;
  } catch (err) {
    console.error('[ActivityLogger] Error clearing activity logs:', err);
    return false;
  }
}
