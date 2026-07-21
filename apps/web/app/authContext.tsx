'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, clearDemoLocalStorage } from '@/utils/api';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'CASHIER' | 'WAITER' | 'KITCHEN' | 'CUSTOMER';
  permissions: string[];
  createdAt?: string;
  lastLogin?: string;
}

interface AuthTenant {
  id: string;
  name: string;
  currency: string;
  taxType: 'VAT' | 'GST' | 'NONE';
  taxRate: number;
  onboarded: boolean;
  plan?: string;
  trialEndsAt?: string;
  subscriptionExpiresAt?: string;
  billingCycle?: 'monthly' | 'annual';
  country?: string;
  timezone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  tenant: AuthTenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AuthUser, tenant: AuthTenant) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateTenant: (partial: Partial<AuthTenant>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<AuthTenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load session from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dinepos_user_account');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.user && parsed.tenant) {
            setUser({
              ...parsed.user,
              permissions: parsed.user.permissions || [],
            });
            setTenant({
              ...parsed.tenant,
              plan: parsed.tenant.plan || parsed.plan,
              trialEndsAt: parsed.tenant.trialEndsAt || parsed.trialEndsAt,
              subscriptionExpiresAt: parsed.tenant.subscriptionExpiresAt || parsed.subscriptionExpiresAt,
              billingCycle: parsed.tenant.billingCycle || parsed.billingCycle,
            });
          } else if (parsed.email && parsed.role) {
            // Support flat user account structure used by other application pages
            setUser({
              id: parsed.id || parsed.userId || 'offline-user-id',
              name: parsed.fullName || parsed.name || 'User',
              email: parsed.email,
              role: parsed.role,
              permissions: parsed.permissions || [],
            });
            setTenant({
              id: parsed.tenantId || 'offline-tenant-id',
              name: parsed.restaurantName || 'My Restaurant',
              currency: parsed.currency || 'JPY',
              taxType: parsed.taxType || 'NONE',
              taxRate: parsed.taxRate || 0,
              onboarded: parsed.onboarded !== false,
              plan: parsed.plan,
              trialEndsAt: parsed.trialEndsAt,
              subscriptionExpiresAt: parsed.subscriptionExpiresAt,
              billingCycle: parsed.billingCycle,
            });
          }
        } catch (e) {
          localStorage.removeItem('dinepos_user_account');
          localStorage.removeItem('dinepos_jwt_token');
          document.cookie = 'dinepos_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      }
      setIsLoading(false);

      // Listen for silent token refresh failures (unauthorized API requests)
      const handleUnauthorized = () => {
        setUser(null);
        setTenant(null);
        document.cookie = 'dinepos_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.push('/login');
      };

      window.addEventListener('dinepos_unauthorized', handleUnauthorized);
      return () => window.removeEventListener('dinepos_unauthorized', handleUnauthorized);
    }
  }, [router]);

  const login = (token: string, user: AuthUser, tenant: AuthTenant) => {
    const cleanUser = {
      ...user,
      permissions: user.permissions || [],
    };
    setUser(cleanUser);
    setTenant(tenant);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dinepos_jwt_token', token);
      const isRemembered = localStorage.getItem('dinepos_remembered_email') !== null;
      const maxAgeAttr = isRemembered ? 'max-age=2592000' : '';
      document.cookie = `dinepos_auth_token=${token}; path=/; ${maxAgeAttr}; SameSite=Strict; Secure`;
      localStorage.setItem('dinepos_user_account', JSON.stringify({
        user: cleanUser,
        tenant,
        id: cleanUser.id,
        fullName: cleanUser.name,
        name: cleanUser.name,
        email: cleanUser.email,
        restaurantName: tenant.name,
        role: cleanUser.role,
        tenantId: tenant.id,
        currency: tenant.currency,
        taxType: tenant.taxType,
        taxRate: tenant.taxRate,
        onboarded: tenant.onboarded,
        plan: tenant.plan,
        trialEndsAt: tenant.trialEndsAt,
        subscriptionExpiresAt: tenant.subscriptionExpiresAt,
        billingCycle: tenant.billingCycle,
        permissions: cleanUser.permissions,
      }));

      // Clear any demo/seed data so a real tenant starts with a clean slate.
      clearDemoLocalStorage();
    }

    // Role-based post-login navigation
    if (cleanUser.role === 'SUPER_ADMIN') {
      router.push('/super-admin');
    } else if (cleanUser.role === 'OWNER' || cleanUser.role === 'MANAGER') {
      if (tenant.onboarded) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } else if (cleanUser.role === 'CASHIER') {
      router.push('/pos');
    } else if (cleanUser.role === 'KITCHEN') {
      router.push('/kds');
    } else {
      router.push('/menu');
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('[Auth] Failed to call logout endpoint:', e);
    } finally {
      setUser(null);
      setTenant(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dinepos_jwt_token');
        localStorage.removeItem('dinepos_user_account');
        document.cookie = 'dinepos_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      setIsLoading(false);
      router.push('/login');
    }
  };

  const refreshAuth = async () => {
    try {
      const response = await apiRequest('/api/auth/refresh', { method: 'POST' });
      if (response.success && response.data?.token) {
        const { token, user: u, tenant: t } = response.data;
        const cleanUser = {
          ...u,
          permissions: u.permissions || [],
        };
        setUser(cleanUser);
        setTenant(t);
        if (typeof window !== 'undefined') {
          localStorage.setItem('dinepos_jwt_token', token);
          const isRemembered = localStorage.getItem('dinepos_remembered_email') !== null;
          const maxAgeAttr = isRemembered ? 'max-age=2592000' : '';
          document.cookie = `dinepos_auth_token=${token}; path=/; ${maxAgeAttr}; SameSite=Strict; Secure`;
          localStorage.setItem('dinepos_user_account', JSON.stringify({ user: cleanUser, tenant: t }));
        }
      } else {
        await logout();
      }
    } catch (e) {
      await logout();
    }
  };

  const updateTenant = (partial: Partial<AuthTenant>) => {
    setTenant(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...partial };
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('dinepos_user_account');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.tenant) {
              parsed.tenant = { ...parsed.tenant, ...partial };
            }
            // Update flat keys as well
            if (partial.plan) parsed.plan = partial.plan;
            if (partial.trialEndsAt) parsed.trialEndsAt = partial.trialEndsAt;
            if (partial.subscriptionExpiresAt) parsed.subscriptionExpiresAt = partial.subscriptionExpiresAt;
            if (partial.billingCycle) parsed.billingCycle = partial.billingCycle;
            if (partial.currency) parsed.currency = partial.currency;
            if (partial.onboarded !== undefined) parsed.onboarded = partial.onboarded;
            if (partial.name) parsed.restaurantName = partial.name;
            localStorage.setItem('dinepos_user_account', JSON.stringify(parsed));
          } catch (e) {
            // ignore
          }
        }
      }
      return updated;
    });
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, tenant, isAuthenticated, isLoading, login, logout, refreshAuth, updateTenant }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
