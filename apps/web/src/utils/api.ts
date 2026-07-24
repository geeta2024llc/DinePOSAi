// ==========================================
// DinePosAI - Central Frontend API Client
// ==========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ==========================================
// TENANT IDENTITY HELPERS
// ==========================================

/**
 * Returns true if the current user is a demo/guest user (no real tenantId),
 * or false if they are a genuine registered tenant.
 * Real tenants should see a clean slate with no pre-seeded demo data.
 */
export function isDemoTenant(): boolean {
  if (typeof window === 'undefined') return true; // SSR: assume demo
  try {
    const userStr = localStorage.getItem('dinepos_user_account');
    if (!userStr) return true; // Not logged in — show demo
    const user = JSON.parse(userStr);
    const tenantId: string | undefined = user?.tenantId;
    // If no tenantId or it is the hardcoded demo sentinel, it's a demo session
    if (!tenantId || tenantId === 'tenant-demo' || tenantId === 'demo') {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

/**
 * The list of all localStorage keys that hold demo/seed data.
 * These are cleared when a real tenant logs in for the first time.
 */
const DEMO_LOCALSTORAGE_KEYS = [
  'dinepos_inventory_ingredients',
  'dinepos_inventory_recipes',
  'dinepos_inventory_suppliers',
  'dinepos_inventory_purchase_orders',
  'dinepos_inventory_purchase_order_items',
  'dinepos_inventory_waste',
  'dinepos_inventory_transactions',
  'dinepos_staff_roster',
  'dinepos_shared_tickets',
  'dinepos_menu_items',
  'dinepos_menu_categories',
  'dinepos_pos_transactions',
];

/**
 * Clears all demo/seed data from localStorage.
 * Called after a successful login/signup for a real (non-demo) tenant
 * so they start with a completely clean slate.
 */
export function clearDemoLocalStorage(): void {
  if (typeof window === 'undefined') return;
  for (const key of DEMO_LOCALSTORAGE_KEYS) {
    localStorage.removeItem(key);
  }
}

interface ApiRequestOptions extends RequestInit {
  useAuth?: boolean;
}

export interface ApiResponseEnvelope<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  isOfflineFallback?: boolean;
}

// ==========================================
// REFRESH TOKEN RACE CONDITION HANDLER
// ==========================================
// When the JWT expires, multiple parallel API calls all get 401.
// Each would trigger a refresh, but the server rotates the refresh token
// on the first success, causing all subsequent refreshes to fail.
// This mutex ensures only ONE refresh request is in flight at a time.

let refreshPromise: Promise<string | null> | null = null;

async function attemptTokenRefresh(): Promise<string | null> {
  try {
    const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    }).catch(() => null);

    if (refreshRes && refreshRes.ok) {
      const refreshData = await refreshRes.json();
      if (refreshData.success && refreshData.data?.token) {
        const newToken = refreshData.data.token;
        localStorage.setItem('dinepos_jwt_token', newToken);
        return newToken;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function getRefreshPromise(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = attemptTokenRefresh().finally(() => {
      // Clear the shared promise so the next batch of 401s triggers a new refresh
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Checks if the backend API server is reachable.
 */
export async function checkBackendOnline(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort('Health check timeout'), 2000);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    }).catch(() => null);
    
    clearTimeout(timeoutId);
    return response ? response.ok : false;
  } catch {
    return false;
  }
}

/**
 * Main API request fetch wrapper.
 * Automatically injects authorization header and handles server offline states.
 */
let lastOfflineCheckTime = 0;
let isServerOfflineCached = true;

export async function apiRequest<T = any>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponseEnvelope<T>> {
  const { useAuth = true, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  // 1. Prepare headers
  const headers = new Headers(fetchOptions.headers || {});
  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // 2. Inject Authorization Bearer token if requested
  if (useAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('dinepos_jwt_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const finalOptions: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: 'include',
  };

  let response: Response | null = null;
  try {
    response = await fetch(url, finalOptions);
  } catch (fetchErr: any) {
    lastOfflineCheckTime = Date.now();
    isServerOfflineCached = true;
    console.warn(`[API Client] Connection to ${API_BASE_URL} failed (${fetchErr?.message || 'offline'}). Using local fallback.`);
    return {
      success: false,
      error: 'Network connection failed. Server is currently offline.',
      isOfflineFallback: true,
    };
  }

  if (!response) {
    lastOfflineCheckTime = Date.now();
    isServerOfflineCached = true;
    return {
      success: false,
      error: 'Network connection failed. Server is currently offline.',
      isOfflineFallback: true,
    };
  }
  
  // Server responded successfully -> reset offline flag
  isServerOfflineCached = false;
  
  // Handle unauthorized/session expired -> try to refresh
  if (response.status === 401 && typeof window !== 'undefined' && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
    // Use the shared refresh mutex — only one refresh request in flight at a time
    const newToken = await getRefreshPromise();

    if (newToken) {
      // Retry the original request with the new token
      const retryHeaders = new Headers(finalOptions.headers || {});
      retryHeaders.set('Authorization', `Bearer ${newToken}`);
      const retryOptions = { ...finalOptions, headers: retryHeaders };
      
      let retryRes: Response | null = null;
      try {
        retryRes = await fetch(url, retryOptions);
      } catch {
        return {
          success: false,
          error: 'Network connection failed on retry. Server is currently offline.',
          isOfflineFallback: true,
        };
      }

      if (!retryRes) {
        return {
          success: false,
          error: 'Network connection failed on retry. Server is currently offline.',
          isOfflineFallback: true,
        };
      }

      const retryContentType = retryRes.headers.get('content-type');
      let retryDataObj;
      if (retryContentType && retryContentType.includes('application/json')) {
        retryDataObj = await retryRes.json();
      } else {
        retryDataObj = { message: await retryRes.text() };
      }

      if (!retryRes.ok) {
        return {
          success: false,
          error: retryDataObj.error || `HTTP error! Status: ${retryRes.status}`,
        };
      }
      return {
        success: true,
        data: retryDataObj.data !== undefined ? retryDataObj.data : retryDataObj,
      };
    }

    // Refresh failed — only log out if this is the definitive failure
    if (!refreshPromise) {
      localStorage.removeItem('dinepos_jwt_token');
      localStorage.removeItem('dinepos_user_account');
      window.dispatchEvent(new Event('dinepos_unauthorized'));
    }
  }

  try {
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error! Status: ${response.status}`,
      };
    }

    return {
      success: true,
      data: data.data !== undefined ? data.data : data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to parse response.',
    };
  }
}
