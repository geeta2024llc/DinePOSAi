/**
 * trial.ts
 * Pure utility functions for managing 7-day free trial and subscription state.
 * Reads directly from the logged-in user account details stored in localStorage.
 */

export interface UserAccount {
  fullName?: string;
  email?: string;
  role?: string;
  restaurantName?: string;
  tenantId?: string;
  currency?: string;
  onboarded?: boolean;
  plan?: 'TRIAL' | 'STARTER' | 'GROWTH' | 'BUSINESS' | 'EXPIRED' | 'SUSPENDED';
  trialEndsAt?: string; // ISO String
  subscriptionExpiresAt?: string; // ISO String
  billingCycle?: 'monthly' | 'annual';
}

export interface Subscription {
  plan: 'Starter' | 'Growth' | 'Business';
  billingCycle: 'monthly' | 'annual';
  startDate?: string; // ISO string
  status: 'active' | 'cancelled' | 'expired';
  expiresAt?: string;
}

/** Get the current user account from localStorage with migration support. */
export function getUserAccount(): UserAccount | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('dinepos_user_account');
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (!data) return null;

    let account: UserAccount = {};
    if (data.user && data.tenant) {
      // Nested structure
      account = {
        fullName: data.user.name || data.fullName,
        email: data.user.email || data.email,
        role: data.user.role || data.role,
        restaurantName: data.tenant.name || data.restaurantName,
        tenantId: data.tenant.id || data.tenantId,
        currency: data.tenant.currency || data.currency,
        onboarded: data.tenant.onboarded !== undefined ? data.tenant.onboarded : data.onboarded,
        plan: data.tenant.plan || data.plan,
        trialEndsAt: data.tenant.trialEndsAt || data.trialEndsAt,
        subscriptionExpiresAt: data.tenant.subscriptionExpiresAt || data.subscriptionExpiresAt,
        billingCycle: data.tenant.billingCycle || data.billingCycle,
      };
    } else {
      // Flat structure
      account = data as UserAccount;
    }
    
    // Add backward compatibility for dashboard page.tsx:
    // If userAccount.expiryDate is requested but not present, populate it with trialEndsAt or subscriptionExpiresAt
    if (!(account as any).expiryDate) {
      (account as any).expiryDate = account.subscriptionExpiresAt || account.trialEndsAt || '';
    }
    
    // Migration: if they have old dinepos_trial_start key, migrate it into the user account object
    const oldTrialStart = localStorage.getItem('dinepos_trial_start');
    if (oldTrialStart && !account.trialEndsAt && !account.plan) {
      const start = new Date(oldTrialStart);
      const endsAt = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
      account.plan = 'TRIAL';
      account.trialEndsAt = endsAt.toISOString();
      localStorage.setItem('dinepos_user_account', JSON.stringify(account));
      localStorage.removeItem('dinepos_trial_start');
      localStorage.removeItem('dinepos_subscription'); // also clean up old sub keys if any
    }
    
    return account;
  } catch {
    return null;
  }
}

// --------------------------------------------------------------------------
// Trial helpers
// --------------------------------------------------------------------------

/** Returns days remaining in the trial (0 if expired, -1 if never started or not on trial). */
export function getTrialDaysRemaining(): number {
  const account = getUserAccount();
  if (!account || account.plan !== 'TRIAL') return -1;
  if (!account.trialEndsAt) return -1;
  
  const end = new Date(account.trialEndsAt);
  const now = new Date();
  const msRemaining = end.getTime() - now.getTime();
  const daysRemaining = msRemaining / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(daysRemaining));
}

/** Returns true if the trial is currently active and not yet expired. */
export function isTrialActive(): boolean {
  const account = getUserAccount();
  if (!account || account.plan !== 'TRIAL') return false;
  if (!account.trialEndsAt) return false;
  return new Date(account.trialEndsAt) > new Date();
}

// --------------------------------------------------------------------------
// Subscription helpers
// --------------------------------------------------------------------------

/** Returns the active subscription or null. */
export function getSubscription(): Subscription | null {
  const account = getUserAccount();
  if (!account) return null;
  const plan = account.plan;
  if (!plan || plan === 'TRIAL' || plan === 'EXPIRED' || plan === 'SUSPENDED') return null;
  
  let planTitle: 'Starter' | 'Growth' | 'Business' = 'Growth';
  if (plan.toUpperCase() === 'STARTER') planTitle = 'Starter';
  else if (plan.toUpperCase() === 'BUSINESS') planTitle = 'Business';

  const isExpired = account.subscriptionExpiresAt && new Date(account.subscriptionExpiresAt) <= new Date();
  const status = isExpired ? 'expired' : 'active';

  return {
    plan: planTitle,
    billingCycle: account.billingCycle || 'monthly',
    status,
    expiresAt: account.subscriptionExpiresAt,
  };
}

/** Returns true if the user has an active paid subscription that has not expired. */
export function isSubscribed(): boolean {
  const account = getUserAccount();
  if (!account) return false;
  const plan = account.plan;
  if (!plan) return false;
  
  if (['STARTER', 'GROWTH', 'BUSINESS'].includes(plan.toUpperCase())) {
    if (account.subscriptionExpiresAt) {
      return new Date(account.subscriptionExpiresAt) > new Date();
    }
    return true; // No explicit expiry, assume active
  }
  return false;
}

// --------------------------------------------------------------------------
// Access gate
// --------------------------------------------------------------------------

/**
 * Returns true if the user should be allowed access to protected pages.
 * Access is allowed when: trial is active OR a paid subscription is active.
 */
export function isAccessAllowed(): boolean {
  return isTrialActive() || isSubscribed();
}
