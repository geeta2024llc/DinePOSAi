// ============================================================
// DinePosAI - User Profile Page (Production Ready)
// ============================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../authContext';
import { ArrowLeft, Shield, Building, User, Calendar, MapPin, Phone } from 'lucide-react';

export default function ProfilePage() {
  const { user, tenant, logout } = useAuth();
  const router = useRouter();

  if (!user || !tenant) return null;

  // Determine back navigation link based on role
  const getBackLink = () => {
    if (user.role === 'SUPER_ADMIN') return '/super-admin';
    if (user.role === 'CASHIER') return '/pos';
    if (user.role === 'KITCHEN') return '/kds';
    return '/dashboard';
  };

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-[#0e0e0d] text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-white/5 bg-[#161513]/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href={getBackLink()}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5 group"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-xs text-zinc-500">Manage your identity and restaurant workspace info</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/security"
            className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-sm transition-colors text-zinc-300 hover:text-white font-medium"
          >
            <Shield className="w-4 h-4 text-zinc-400" />
            <span>Security Settings</span>
          </Link>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-950/30 hover:bg-red-900/40 border border-red-900/30 text-red-200 rounded-lg text-sm transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Profile Card */}
        <section className="bg-[#161513]/90 border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden">
          {/* Subtle design element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
          
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6 z-10 relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400/20 to-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <User className="w-10 h-10 text-amber-300" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <span className="px-2.5 py-0.5 bg-amber-400/10 border border-amber-400/20 text-amber-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <p className="text-zinc-400 text-sm">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/5 text-sm">
            <div className="flex items-center space-x-3 text-zinc-400">
              <Phone className="w-5 h-5 text-amber-400/80 flex-shrink-0" />
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Contact Number</p>
                <p className="text-zinc-200 font-medium mt-0.5">{user.phone || 'Not Provided'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-zinc-400">
              <Calendar className="w-5 h-5 text-zinc-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Registered Since</p>
                <p className="text-zinc-300 mt-0.5">{formatDate(user.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-zinc-400">
              <User className="w-5 h-5 text-zinc-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Last Activity Time</p>
                <p className="text-zinc-300 mt-0.5">{formatDate(user.lastLogin)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Organization / Workspace Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Org details */}
          <div className="bg-[#161513]/90 border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-white/5">
              <Building className="w-5 h-5 text-amber-300" />
              <h3 className="font-bold text-lg">Organization Details</h3>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-zinc-600 uppercase font-bold tracking-wider">Business Name</p>
                <p className="text-zinc-200 font-medium mt-0.5">{tenant.name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 uppercase font-bold tracking-wider">Subscription Plan</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-xs font-semibold">
                    {tenant.plan || 'TRIAL'}
                  </span>
                  {tenant.trialEndsAt && new Date(tenant.trialEndsAt) > new Date() && (
                    <span className="text-xs text-amber-400">
                      Trial ends {new Date(tenant.trialEndsAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-600 uppercase font-bold tracking-wider">Default Currency</p>
                <p className="text-zinc-200 mt-0.5">{tenant.currency}</p>
              </div>
            </div>
          </div>

          {/* Location / Branch Details */}
          <div className="bg-[#161513]/90 border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-white/5">
              <MapPin className="w-5 h-5 text-amber-300" />
              <h3 className="font-bold text-lg">Location Details</h3>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-zinc-600 uppercase font-bold tracking-wider">Assigned Branch</p>
                <p className="text-zinc-200 font-medium mt-0.5">Main Branch</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 uppercase font-bold tracking-wider">Country / Timezone</p>
                <p className="text-zinc-200 mt-0.5">{tenant.country || 'Not Set'} / {tenant.timezone || 'UTC'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 uppercase font-bold tracking-wider">Tax Configuration</p>
                <p className="text-zinc-200 mt-0.5">
                  {tenant.taxType !== 'NONE' ? `${tenant.taxType} (${tenant.taxRate}%)` : 'Tax Exempt'}
                </p>
              </div>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
