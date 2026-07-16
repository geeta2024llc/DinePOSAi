// ============================================================
// DinePosAI - Security Settings Dashboard (Production Ready)
// ============================================================

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../authContext';
import { useSession } from '@/hooks/useSession';
import { apiRequest } from '@/utils/api';
import { 
  ArrowLeft, Shield, Key, Mail, Laptop, Clock, 
  AlertTriangle, CheckCircle, RefreshCw, Smartphone, Globe 
} from 'lucide-react';

export default function SecurityPage() {
  const { user } = useAuth();
  const { 
    sessions, 
    loginHistory, 
    isLoading: isSessionLoading, 
    error: sessionError,
    revokeSession, 
    revokeAllOtherSessions,
    refreshSessions
  } = useSession();

  const [activeTab, setActiveTab] = useState<'sessions' | 'history' | 'password' | 'email'>('sessions');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form States
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' });

  if (!user) return null;

  // Determine back navigation link based on role
  const getBackLink = () => {
    if (user.role === 'SUPER_ADMIN') return '/super-admin';
    if (user.role === 'CASHIER') return '/pos';
    if (user.role === 'KITCHEN') return '/kds';
    return '/dashboard';
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (res.success) {
        setSuccessMsg('Your password has been changed successfully.');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setErrorMsg(res.error || 'Failed to change password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    setLoading(true);
    try {
      const res = await apiRequest('/api/auth/change-email', {
        method: 'POST',
        body: JSON.stringify({
          newEmail: emailForm.newEmail,
          currentPassword: emailForm.currentPassword,
        }),
      });

      if (res.success) {
        setSuccessMsg('Your email has been changed successfully. You will be logged out.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        setErrorMsg(res.error || 'Failed to update email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
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
            <h1 className="text-xl font-bold tracking-tight flex items-center space-x-2">
              <Shield className="w-5 h-5 text-amber-300" />
              <span>Security Settings</span>
            </h1>
            <p className="text-xs text-zinc-500">Secure your DinePOS account credentials and session access</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <nav className="md:col-span-1 flex flex-col space-y-1">
          <button
            onClick={() => { setActiveTab('sessions'); setSuccessMsg(null); setErrorMsg(null); }}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              activeTab === 'sessions' 
                ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Laptop className="w-4 h-4 flex-shrink-0" />
            <span>Active Sessions</span>
          </button>
          <button
            onClick={() => { setActiveTab('history'); setSuccessMsg(null); setErrorMsg(null); }}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              activeTab === 'history' 
                ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>Login History</span>
          </button>
          <button
            onClick={() => { setActiveTab('password'); setSuccessMsg(null); setErrorMsg(null); }}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              activeTab === 'password' 
                ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Key className="w-4 h-4 flex-shrink-0" />
            <span>Change Password</span>
          </button>
          <button
            onClick={() => { setActiveTab('email'); setSuccessMsg(null); setErrorMsg(null); }}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              activeTab === 'email' 
                ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span>Update Email</span>
          </button>
        </nav>

        {/* Tab Panel Content */}
        <section className="md:col-span-3 bg-[#161513]/90 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          {/* Design blur element */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />

          {/* Feedback Messages */}
          {successMsg && (
            <div className="mb-6 p-4 bg-green-950/20 border border-green-800/30 text-green-300 rounded-lg flex items-center space-x-3 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-950/20 border border-red-800/30 text-red-300 rounded-lg flex items-center space-x-3 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Active Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Active Device Sessions</h2>
                  <p className="text-xs text-zinc-500">Devices currently logged into your DinePOS account</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={refreshSessions}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors"
                    title="Refresh Sessions"
                  >
                    <RefreshCw className="w-4 h-4 text-zinc-400" />
                  </button>
                  {sessions.length > 1 && (
                    <button
                      onClick={revokeAllOtherSessions}
                      className="px-3 py-1.5 bg-red-950/30 hover:bg-red-900/40 border border-red-900/30 text-red-200 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Revoke Other Devices
                    </button>
                  )}
                </div>
              </div>

              {isSessionLoading ? (
                <div className="py-12 flex justify-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-amber-300" />
                </div>
              ) : sessionError ? (
                <p className="text-sm text-zinc-500 py-6 text-center">{sessionError}</p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((s) => (
                    <div 
                      key={s.id} 
                      className={`p-4 border rounded-xl flex items-start justify-between transition-colors ${
                        s.isCurrent 
                          ? 'border-amber-400/20 bg-amber-400/5' 
                          : 'border-white/5 bg-white/5'
                      }`}
                    >
                      <div className="flex items-start space-x-3 text-sm">
                        <div className="p-2 bg-zinc-800 rounded-lg border border-white/5 flex-shrink-0 mt-1">
                          {s.device === 'Mobile' ? (
                            <Smartphone className="w-5 h-5 text-zinc-400" />
                          ) : (
                            <Laptop className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="font-semibold">{s.browser} on {s.os}</span>
                            {s.isCurrent && (
                              <span className="px-2 py-0.5 bg-amber-400/10 border border-amber-400/20 text-amber-300 rounded text-[10px] font-bold uppercase">
                                Current Session
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 mt-1">
                            <span className="flex items-center space-x-1">
                              <Globe className="w-3.5 h-3.5 text-zinc-600" />
                              <span>{s.city}, {s.country} ({s.ipAddress})</span>
                            </span>
                            <span>•</span>
                            <span>Last active: {formatDate(s.lastActivity)}</span>
                          </div>
                        </div>
                      </div>

                      {!s.isCurrent && (
                        <button
                          onClick={() => revokeSession(s.id)}
                          className="px-2.5 py-1 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 text-zinc-500 hover:text-red-300 rounded-lg text-xs font-semibold transition-all"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Login History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold">Recent Login Activities</h2>
                <p className="text-xs text-zinc-500">History of the last 50 login events on your account</p>
              </div>

              <div className="border border-white/5 rounded-xl overflow-hidden bg-zinc-950/20">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                      <th className="p-4">Time</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">IP Address</th>
                      <th className="p-4">Device / Browser</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {loginHistory.map((h) => (
                      <tr key={h.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-xs font-medium whitespace-nowrap">{formatDate(h.created_at)}</td>
                        <td className="p-4 whitespace-nowrap">{h.city || 'Unknown'}, {h.country || 'Unknown'}</td>
                        <td className="p-4 text-zinc-500 font-mono text-xs">{h.ip_address}</td>
                        <td className="p-4 text-xs">
                          {h.device || 'Unknown'} - {h.browser || 'Unknown'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            h.status === 'SUCCESS'
                              ? 'bg-green-400/10 border border-green-400/20 text-green-400'
                              : 'bg-red-400/10 border border-red-400/20 text-red-400'
                          }`}>
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {loginHistory.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500">No login history recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Change Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold">Update Account Password</h2>
                <p className="text-xs text-zinc-500">Ensure your account uses a strong, unique password</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-950/50 border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-950/50 border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-950/50 border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/50 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#ffe2ab] hover:bg-[#ffd58c] text-[#402d00] font-bold rounded-lg text-sm transition-colors cursor-pointer"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          )}

          {/* 4. Change Email Tab */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold">Update Account Email</h2>
                <p className="text-xs text-zinc-500">Change the primary login email address for your account</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">New Email Address</label>
                  <input
                    type="email"
                    required
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-950/50 border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Verify Your Password</label>
                  <input
                    type="password"
                    required
                    value={emailForm.currentPassword}
                    onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-950/50 border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/50 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#ffe2ab] hover:bg-[#ffd58c] text-[#402d00] font-bold rounded-lg text-sm transition-colors cursor-pointer"
              >
                {loading ? 'Updating Email...' : 'Save New Email'}
              </button>
            </form>
          )}

        </section>

      </main>
    </div>
  );
}
