'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAccessAllowed } from '@/utils/trial';

/**
 * TrialGate
 * Wrap any protected page layout with this component.
 * If the user has no active trial AND no active subscription, they are
 * redirected to /subscribe?expired=true.
 *
 * Usage:
 *   export default function DashboardLayout({ children }) {
 *     return <TrialGate>{children}</TrialGate>;
 *   }
 */
export default function TrialGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(() => {
    if (typeof window !== 'undefined') {
      return isAccessAllowed();
    }
    return null;
  });

  useEffect(() => {
    let access = allowed;
    if (access === null) {
      access = isAccessAllowed();
      setAllowed(access);
    }
    if (access === false) {
      router.replace('/subscribe?expired=true');
    }
  }, [allowed, router]);

  // While checking, show nothing (avoids flash of content)
  if (allowed === null) return null;

  // Denied — redirect is in progress, show nothing
  if (!allowed) return null;

  return <>{children}</>;
}
