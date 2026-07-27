'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../app/authContext';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'CASHIER' | 'WAITER' | 'KITCHEN' | 'CUSTOMER')[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const isAuthorized = !isLoading && isAuthenticated && (!allowedRoles || allowedRoles.includes(user?.role as any));

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user?.role as any)) {
        // Redirect unauthorized users to their correct workspace
        if (user?.role === 'SUPER_ADMIN') {
          router.push('/super-admin');
        } else if (user?.role === 'MANAGER') {
          router.push('/dashboard');
        } else if (user?.role === 'CASHIER') {
          router.push('/pos');
        } else if (user?.role === 'KITCHEN') {
          router.push('/kds');
        } else {
          router.push('/');
        }
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  if (isLoading || !isAuthorized) {
    return (
      <div suppressHydrationWarning className="fixed inset-0 z-50 bg-[#0e0e0e] flex flex-col items-center justify-center font-sans">
        {/* Ambient background glow */}
        <div suppressHydrationWarning className="absolute w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(255,226,171,0.05)_0%,transparent_60%)] pointer-events-none" />
        
        {/* Premium loader */}
        <div suppressHydrationWarning className="relative flex items-center justify-center mb-6">
          <div suppressHydrationWarning className="w-16 h-16 rounded-full border-2 border-white/5 border-t-[#ffe2ab] animate-spin" />
          <span suppressHydrationWarning className="material-symbols-outlined absolute text-[#ffe2ab] text-xl animate-pulse">lock</span>
        </div>
        
        <h3 suppressHydrationWarning className="text-white font-title-md font-semibold text-sm tracking-widest uppercase mb-1.5 select-none">
          Securing Connection
        </h3>
        <p suppressHydrationWarning className="text-[#A69984]/50 text-[11px] font-medium tracking-wide uppercase select-none">
          Verifying credentials with DinePOS AI
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
