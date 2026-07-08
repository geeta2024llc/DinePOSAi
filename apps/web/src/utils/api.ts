// ==========================================
// DinePosAI - Central Frontend API Client
// ==========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiRequestOptions extends RequestInit {
  useAuth?: boolean;
}

export interface ApiResponseEnvelope<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  isOfflineFallback?: boolean;
}

/**
 * Checks if the backend API server is reachable.
 */
export async function checkBackendOnline(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Main API request fetch wrapper.
 * Automatically injects authorization header and handles server offline states.
 */
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

  try {
    const response = await fetch(url, finalOptions);
    
    // Handle unauthorized/session expired -> try to refresh
    if (response.status === 401 && typeof window !== 'undefined' && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.success && refreshData.data?.token) {
            const newToken = refreshData.data.token;
            localStorage.setItem('dinepos_jwt_token', newToken);
            
            // Retry the original request
            const retryHeaders = new Headers(finalOptions.headers || {});
            retryHeaders.set('Authorization', `Bearer ${newToken}`);
            const retryOptions = { ...finalOptions, headers: retryHeaders };
            const retryRes = await fetch(url, retryOptions);
            
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
        }
      } catch (refreshErr) {
        console.error('[API Client] Silent token refresh failed:', refreshErr);
      }

      // If refresh failed or was bypassed, clean up token
      localStorage.removeItem('dinepos_jwt_token');
      localStorage.removeItem('dinepos_user_account');
      window.dispatchEvent(new Event('dinepos_unauthorized'));
    }

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
    // Check if it is a network error (server offline/unreachable)
    const isNetworkError = err instanceof TypeError || err.name === 'AbortError';
    
    if (isNetworkError) {
      console.warn(`[API Client] Connection to ${API_BASE_URL} failed. Falling back to local storage mocks.`);
      return {
        success: false,
        error: 'Network connection failed. Server is currently offline.',
        isOfflineFallback: true,
      };
    }

    return {
      success: false,
      error: err.message || 'An unknown network error occurred.',
    };
  }
}
