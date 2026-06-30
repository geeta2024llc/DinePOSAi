'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/utils/api';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN';
}

interface AuthTenant {
  id: string;
  name: string;
  currency: string;
  taxType: 'VAT' | 'GST' | 'NONE';
  taxRate: number;
  onboarded: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  tenant: AuthTenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AuthUser, tenant: AuthTenant) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
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
            setUser(parsed.user);
            setTenant(parsed.tenant);
          }
        } catch (e) {
          localStorage.removeItem('dinepos_user_account');
          localStorage.removeItem('dinepos_jwt_token');
        }
      }
      setIsLoading(false);

      // Listen for silent token refresh failures (unauthorized API requests)
      const handleUnauthorized = () => {
        setUser(null);
        setTenant(null);
        router.push('/login');
      };

      window.addEventListener('dinepos_unauthorized', handleUnauthorized);
      return () => window.removeEventListener('dinepos_unauthorized', handleUnauthorized);
    }
  }, [router]);

  const login = (token: string, user: AuthUser, tenant: AuthTenant) => {
    setUser(user);
    setTenant(tenant);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dinepos_jwt_token', token);
      localStorage.setItem('dinepos_user_account', JSON.stringify({ user, tenant }));
    }

    // Role-based post-login navigation
    if (user.role === 'SUPER_ADMIN') {
      router.push('/super-admin');
    } else if (user.role === 'MANAGER') {
      if (tenant.onboarded) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } else if (user.role === 'CASHIER') {
      router.push('/pos');
    } else if (user.role === 'KITCHEN') {
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
        setUser(u);
        setTenant(t);
        if (typeof window !== 'undefined') {
          localStorage.setItem('dinepos_jwt_token', token);
          localStorage.setItem('dinepos_user_account', JSON.stringify({ user: u, tenant: t }));
        }
      } else {
        await logout();
      }
    } catch (e) {
      await logout();
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, tenant, isAuthenticated, isLoading, login, logout, refreshAuth }}>
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
