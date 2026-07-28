// ============================================================
// DinePosAI - Production Ready Authentication Controller
// ============================================================

import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { supabase, supabaseAuthClient } from '../utils/supabase.js';
import { ApiResponse, UserRole } from '@dineposai/shared-types';
import { sessionService } from '../auth/session.service.js';
import { suspiciousLoginService } from '../auth/suspicious-login.service.js';
import { emailService } from '../utils/email.service.js';
import { isCommonPassword } from '../utils/common-passwords.js';
import { parseUserAgent } from '../utils/user-agent.js';
import { geolocateIp } from '../utils/geo-ip.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-jwt-secret-key-at-least-32-chars-long' : '');
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Server will not start.');
}

const ACCESS_TOKEN_EXPIRY = '30m';
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

// Country → timezone / currency defaults
const COUNTRY_DEFAULTS: Record<string, { timezone: string; currency: string }> = {
  'Japan':          { timezone: 'Asia/Tokyo',       currency: 'JPY' },
  'United States':  { timezone: 'America/New_York',  currency: 'USD' },
  'United Kingdom': { timezone: 'Europe/London',     currency: 'GBP' },
  'France':         { timezone: 'Europe/Paris',      currency: 'EUR' },
  'Germany':        { timezone: 'Europe/Berlin',     currency: 'EUR' },
  'Australia':      { timezone: 'Australia/Sydney',  currency: 'AUD' },
  'Canada':         { timezone: 'America/Toronto',   currency: 'CAD' },
  'Singapore':      { timezone: 'Asia/Singapore',    currency: 'SGD' },
  'South Korea':    { timezone: 'Asia/Seoul',        currency: 'KRW' },
  'China':          { timezone: 'Asia/Shanghai',     currency: 'CNY' },
  'Nepal':          { timezone: 'Asia/Kathmandu',    currency: 'NPR' },
};

// Input Validation Schemas
export const signupSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  contactNumber: z.string().optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .refine(
      (val) => /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val),
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  country: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  deviceId: z.string().min(1, 'Device identifier is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .refine(
      (val) => /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val),
      'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

export const changeEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  currentPassword: z.string().min(1, 'Password is required to verify ownership'),
});

// Helper: Generate JWT tokens with sessionId included
const generateAccessToken = (user: { id: string; tenant_id: string; role: string; email: string }, sessionId: string) => {
  return jwt.sign(
    { id: user.id, tenantId: user.tenant_id, role: user.role, email: user.email, sessionId },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

// Helper: hash a token before persisting
const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

// 1. SIGNUP CONTROLLER (Tenant/Organization Creator)
export const signup = async (req: Request, res: Response<ApiResponse>) => {
  const { businessName, name, email, password, country, phone, contactNumber } = req.body;
  const userPhone = (phone || contactNumber || '').trim() || null;
  const emailLower = email.toLowerCase().trim();
  let createdAuthUserId: string | null = null;

  try {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', emailLower)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    if (isCommonPassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'This password is too common and easily guessable. Please choose a stronger password.',
      });
    }

    // Resolve timezone and currency from country
    const resolvedCountry = country || 'Japan';
    const { timezone, currency } = COUNTRY_DEFAULTS[resolvedCountry] ?? { timezone: 'UTC', currency: 'USD' };

    // Generate local UUID for the user
    const userId = crypto.randomUUID();

    // Register user in Supabase Auth first (graceful fallback if Supabase is rate limited or offline)
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        id: userId,
        email: emailLower,
        password: password,
        email_confirm: true
      });

      if (authError) {
        console.warn(`Supabase authentication registration warning: ${authError.message}. Proceeding with local DB user creation.`);
      } else if (authData?.user) {
        createdAuthUserId = authData.user.id;
      }
    } catch (err: any) {
      console.warn(`Supabase Auth creation exception: ${err.message || err}. Proceeding with local DB user creation.`);
    }

    // Hash Password for local DB backup
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert Tenant (Organization)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .insert({
        name: businessName,
        country: resolvedCountry,
        timezone,
        currency,
        tax_type: 'NONE',
        tax_rate: 0.00,
        plan: 'TRIAL',
        status: 'ACTIVE',
        trial_ends_at: trialEndsAt.toISOString(),
      })
      .select()
      .single();

    if (tenantErr || !tenant) {
      throw new Error(`Failed to create tenant: ${tenantErr?.message}`);
    }

    // Create default branch
    const { data: defaultBranch, error: branchErr } = await supabase
      .from('branches')
      .insert({
        tenant_id: tenant.id,
        name: 'Main Branch',
        timezone,
        address: 'Headquarters',
        is_active: true,
      })
      .select()
      .single();

    if (branchErr || !defaultBranch) {
      await supabase.from('tenants').delete().eq('id', tenant.id);
      throw new Error(`Failed to create default branch: ${branchErr?.message}`);
    }

    // Insert User with OWNER role
    const { data: user, error: userErr } = await supabase
      .from('users')
      .insert({
        id: userId,
        tenant_id: tenant.id,
        branch_id: defaultBranch.id,
        name,
        email: emailLower,
        phone: userPhone,
        password_hash: passwordHash,
        role: 'OWNER',
        is_active: true
      })
      .select()
      .single();

    if (userErr || !user) {
      await supabase.from('branches').delete().eq('id', defaultBranch.id);
      await supabase.from('tenants').delete().eq('id', tenant.id);
      throw new Error(`Failed to create user record: ${userErr?.message}`);
    }

    res.status(201).json({
      success: true,
      data: {
        message: 'Account and restaurant workspace created successfully.',
        tenant: {
          id: tenant.id,
          name: tenant.name,
          trialEndsAt: tenant.trial_ends_at,
          plan: tenant.plan,
          onboarded: tenant.onboarded,
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || null,
          role: user.role as UserRole,
        }
      }
    });

  } catch (error: any) {
    if (createdAuthUserId) {
      await supabase.auth.admin.deleteUser(createdAuthUserId).catch(err => {
        console.error('[Signup Rollback] Failed to delete auth user:', err);
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal registration error.'
    });
  }
};

// 2. LOGIN CONTROLLER (Multi-Session Enabled)
export const login = async (req: Request, res: Response<ApiResponse>) => {
  const { email, password, deviceId } = req.body;
  const emailLower = email.toLowerCase().trim();
  const ip = req.ip || req.socket.remoteAddress || '';
  const ua = req.headers['user-agent'] || '';

  // Start geolocation in parallel to reduce sequential network blocking
  const geoPromise = geolocateIp(ip);

  try {
    let authVerified = false;

    // Attempt login via supabaseAuthClient (anon key)
    const { data: signInData, error: signInErr } = await supabaseAuthClient.auth.signInWithPassword({
      email: emailLower,
      password: password
    });

    if (!signInErr && signInData?.user) {
      authVerified = true;
    }

    // Look up user in DB by email
    const { data: localUser, error: localUserErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', emailLower)
      .maybeSingle();

    // Fallback: validate directly against local bcrypt password_hash
    if (!authVerified && localUser && !localUserErr) {
      const passwordMatch = await bcrypt.compare(password, localUser.password_hash);
      if (passwordMatch) {
        authVerified = true;
        
        // Auto-migrate user credentials into Supabase Auth client for future compatibility
        supabase.auth.admin.createUser({
          id: localUser.id,
          email: emailLower,
          password: password,
          email_confirm: true
        }).catch(() => {});
      }
    }

    if (!authVerified) {
      // Record failure history
      const geo = await geoPromise;
      await sessionService.recordLoginHistory({
        userId: localUser?.id || null,
        tenantId: localUser?.tenant_id || null,
        ipAddress: ip,
        browser: parseUserAgent(ua).browser,
        device: parseUserAgent(ua).device,
        os: parseUserAgent(ua).os,
        country: geo.country,
        city: geo.city,
        status: 'FAILED',
        failureReason: 'INVALID_CREDENTIALS',
      });

      return res.status(401).json({
        success: false,
        error: 'Incorrect email or password.',
      });
    }

    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('*, tenants!inner(*)')
      .eq('email', emailLower)
      .single();

    if (userErr || !user) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect email or password.',
      });
    }

    if (!user.is_active) {
      // Record failure: suspended
      const geo = await geoPromise;
      await sessionService.recordLoginHistory({
        userId: user.id,
        tenantId: user.tenant_id,
        ipAddress: ip,
        browser: parseUserAgent(ua).browser,
        device: parseUserAgent(ua).device,
        os: parseUserAgent(ua).os,
        country: geo.country,
        city: geo.city,
        status: 'FAILED',
        failureReason: 'ACCOUNT_SUSPENDED',
      });

      return res.status(403).json({
        success: false,
        error: 'Your account is suspended. Please contact your restaurant manager.',
      });
    }

    const tenant = user.tenants;
    if (!tenant || tenant.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Restaurant workspace is unavailable. Please contact system support.',
      });
    }

    // MULTI-SESSION SETUP
    const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Establish the session in user_sessions (returns the session ID)
    const sessionId = await sessionService.createSession(
      user.id,
      user.tenant_id,
      user.branch_id,
      deviceId,
      refreshToken,
      req
    );

    const accessToken = generateAccessToken(user, sessionId);

    // Update last login
    await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);

    // Check for suspicious login patterns
    const geo = await geoPromise;
    const parsedUa = parseUserAgent(ua);
    suspiciousLoginService.detectAndAlert(user.id, user.email, user.name, {
      device: parsedUa.device,
      browser: parsedUa.browser,
      os: parsedUa.os,
      ipAddress: ip,
      country: geo.country || 'Unknown Country',
      city: geo.city || 'Unknown City',
      loginTime: new Date().toISOString(),
    }).catch(() => {});

    // Set refresh cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: REFRESH_TOKEN_EXPIRY * 1000,
    });

    res.json({
      success: true,
      data: {
        token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || null,
          role: user.role as UserRole,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          currency: tenant.currency,
          taxType: tenant.tax_type,
          taxRate: tenant.tax_rate,
          onboarded: tenant.onboarded,
          plan: tenant.plan,
          trialEndsAt: tenant.trial_ends_at,
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Internal login error.'
    });
  }
};

// 3. REFRESH CONTROLLER
export const refresh = async (req: Request, res: Response<ApiResponse>) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, error: 'Authentication required. Refresh token missing.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { id: string };
    const refreshTokenHash = hashToken(refreshToken);

    // Look up session in database
    const { data: session, error: sessionErr } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('refresh_token', refreshTokenHash)
      .eq('user_id', decoded.id)
      .maybeSingle();

    if (sessionErr || !session) {
      return res.status(401).json({ success: false, error: 'Invalid session or refresh token.' });
    }

    // Check expiry
    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('user_sessions').delete().eq('id', session.id);
      return res.status(401).json({ success: false, error: 'Session has expired. Please log in again.' });
    }

    // Look up user and tenant
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('*, tenants!inner(*)')
      .eq('id', session.user_id)
      .single();

    if (userErr || !user || !user.is_active || user.tenants.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, error: 'User or restaurant account is inactive.' });
    }

    const tenant = user.tenants;

    // Roll refresh token (rotate)
    const newRefreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const newRefreshTokenHash = hashToken(newRefreshToken);
    
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    const { error: updateErr } = await supabase
      .from('user_sessions')
      .update({
        refresh_token: newRefreshTokenHash,
        expires_at: newExpiresAt.toISOString(),
        last_activity: new Date().toISOString(),
      })
      .eq('id', session.id);

    if (updateErr) {
      return res.status(500).json({ success: false, error: 'Failed to rotate session.' });
    }

    // Set new cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: REFRESH_TOKEN_EXPIRY * 1000,
    });

    const accessToken = generateAccessToken(user, session.id);

    res.json({
      success: true,
      data: {
        token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || null,
          role: user.role as UserRole,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          currency: tenant.currency,
          taxType: tenant.tax_type,
          taxRate: tenant.tax_rate,
          onboarded: tenant.onboarded,
          plan: tenant.plan,
          trialEndsAt: tenant.trial_ends_at,
        }
      }
    });

  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session. Please log in again.' });
  }
};

// 4. LOGOUT CONTROLLER
export const logout = async (req: Request, res: Response<ApiResponse>) => {
  const refreshToken = req.cookies?.refreshToken;
  const authRequest = req as AuthenticatedRequest;

  try {
    if (authRequest.user?.sessionId) {
      // Revoke via loaded session ID
      await supabase.from('user_sessions').delete().eq('id', authRequest.user.sessionId);
    } else if (refreshToken) {
      // Fallback: revoke via cookie token
      const refreshTokenHash = hashToken(refreshToken);
      await supabase.from('user_sessions').delete().eq('refresh_token', refreshTokenHash);
    }
  } catch (e) {
    // Ignore error to ensure cookie is cleared
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    domain: process.env.COOKIE_DOMAIN || undefined,
  });

  res.json({
    success: true,
    data: { message: 'Logged out successfully.' }
  });
};

// 5. LOGOUT ALL DEVICES CONTROLLER
export const logoutAll = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  try {
    await sessionService.revokeAllSessions(req.user.id);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    res.json({
      success: true,
      data: { message: 'Logged out from all devices successfully.' }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to invalidate all sessions.' });
  }
};

// 6. CHANGE PASSWORD CONTROLLER
export const changePassword = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    // Fetch full user record to verify password
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordMatch) {
      return res.status(400).json({ success: false, error: 'Incorrect current password.' });
    }

    if (isCommonPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'This password is too common and easily guessable. Please choose a stronger password.',
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update DB
    await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', user.id);

    // Update Supabase Auth
    try {
      await supabase.auth.admin.updateUserById(user.id, { password: newPassword });
    } catch (err: any) {
      console.warn(`Supabase Auth password update warning: ${err.message || err}`);
    }

    res.json({
      success: true,
      data: { message: 'Password updated successfully.' },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update password.' });
  }
};

// 7. CHANGE EMAIL CONTROLLER
export const changeEmail = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  const { newEmail, currentPassword } = req.body;
  const newEmailLower = newEmail.toLowerCase().trim();

  try {
    // Check if new email is in use
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', newEmailLower)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'This email is already in use.' });
    }

    // Verify password
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordMatch) {
      return res.status(400).json({ success: false, error: 'Incorrect password.' });
    }

    // Update DB email
    await supabase
      .from('users')
      .update({ email: newEmailLower })
      .eq('id', user.id);

    // Update Supabase Auth email
    try {
      await supabase.auth.admin.updateUserById(user.id, { email: newEmailLower });
    } catch (err: any) {
      console.warn(`Supabase Auth email update warning: ${err.message || err}`);
    }

    // Revoke all sessions (forces re-login under new email)
    await sessionService.revokeAllSessions(user.id);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    res.json({
      success: true,
      data: { message: 'Email updated successfully. You have been logged out from all devices.' },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update email.' });
  }
};

// 8. GET ME CONTROLLER
export const getMe = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, is_active, last_login, created_at, tenants!inner(id, name, currency, tax_type, tax_rate, plan, status, onboarded)')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || null,
          role: user.role as UserRole,
          isActive: user.is_active,
          lastLogin: user.last_login,
          createdAt: user.created_at,
          permissions: req.user.permissions,
        },
        tenant: user.tenants,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile.' });
  }
};

// UPDATE PROFILE CONTROLLER
export const updateProfile = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  const { name, phone, contactNumber } = req.body;
  const userPhone = phone !== undefined ? phone : (contactNumber !== undefined ? contactNumber : undefined);

  try {
    const updateData: any = {};
    if (typeof name === 'string' && name.trim()) updateData.name = name.trim();
    if (userPhone !== undefined) updateData.phone = userPhone ? String(userPhone).trim() : null;

    updateData.updated_at = new Date().toISOString();

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error || !user) {
      return res.status(400).json({ success: false, error: error?.message || 'Failed to update profile.' });
    }

    res.json({
      success: true,
      data: {
        message: 'Profile updated successfully.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || null,
          role: user.role as UserRole,
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update profile.' });
  }
};

// 9. GET SESSIONS CONTROLLER
export const getSessions = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  try {
    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('last_activity', { ascending: false });

    if (error) {
      throw error;
    }

    const formattedSessions = sessions.map((s) => ({
      id: s.id,
      deviceId: s.device_id,
      device: s.device || 'Unknown Device',
      browser: s.browser || 'Unknown Browser',
      os: s.os || 'Unknown OS',
      ipAddress: s.ip_address,
      country: s.country || 'Unknown',
      city: s.city || 'Unknown',
      loginTime: s.login_time,
      lastActivity: s.last_activity,
      isCurrent: s.id === req.user?.sessionId,
    }));

    res.json({
      success: true,
      data: formattedSessions,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve active sessions.' });
  }
};

// 10. REVOKE SESSION CONTROLLER
export const revokeSession = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  const { id } = req.params;

  try {
    if (id === req.user.sessionId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot revoke your current active session. Use the logout endpoint instead.',
      });
    }

    const revoked = await sessionService.revokeSession(id, req.user.id);
    if (!revoked) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    res.json({
      success: true,
      data: { message: 'Session revoked successfully.' },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to revoke session.' });
  }
};

// 11. GET LOGIN HISTORY CONTROLLER
export const getLoginHistory = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  try {
    const { data: history, error } = await supabase
      .from('login_history')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50); // Limit to last 50 entries

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: history,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch login history.' });
  }
};

// Validation schemas for password reset
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .refine(
      (val) => /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val),
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

// 12. FORGOT PASSWORD CONTROLLER
export const forgotPassword = async (req: Request, res: Response<ApiResponse>) => {
  const { email } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .maybeSingle();

    // Secure design: option to toggle email enumeration protection (friendly errors in dev/test)
    const protectionEnabled = process.env.EMAIL_ENUMERATION_PROTECTION !== 'false';
    const successMsg = 'If the email exists in our system, secure reset instructions have been sent.';
    if (error || !user) {
      if (protectionEnabled) {
        return res.json({ success: true, data: { message: successMsg } });
      } else {
        return res.status(404).json({ success: false, error: 'This email address is not registered.' });
      }
    }

    const origin = req.headers.origin || process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000';
    
    // Call Supabase Auth to trigger password reset email using its built-in SMTP delivery
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (resetErr) {
      console.error('[Auth] Supabase resetPasswordForEmail failed:', resetErr.message);
      return res.status(500).json({ success: false, error: 'Failed to dispatch reset email via security service.' });
    }

    // Still print in console for local dev convenience
    console.log('\n========================================');
    console.log('🔑 PASSWORD RESET REQUESTED (via Supabase SMTP)');
    console.log(`User: ${user.name} (${user.email})`);
    console.log(`Verify Redirect Origin: ${origin}/reset-password`);
    console.log('========================================\n');

    res.json({
      success: true,
      data: { message: successMsg }
    });

  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal forgot password error.' });
  }
};

// 13. RESET PASSWORD CONTROLLER
export const resetPassword = async (req: Request, res: Response<ApiResponse>) => {
  const { token, newPassword } = req.body;

  try {
    // Find user by reset token and check expiration
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('reset_password_token', token)
      .gt('reset_password_expires', new Date().toISOString())
      .maybeSingle();

    if (error || !user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired password reset token.'
      });
    }

    if (isCommonPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'This password is too common and easily guessable. Please choose a stronger password.',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset fields
    const { error: updateErr } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        reset_password_token: null,
        reset_password_expires: null,
      })
      .eq('id', user.id);

    if (updateErr) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update password.'
      });
    }

    res.json({
      success: true,
      data: { message: 'Password reset successfully. You can now log in.' }
    });

  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal reset password error.' });
  }
};

// 14. RESET PASSWORD SUPABASE CONTROLLER
export const resetPasswordSupabase = async (req: Request, res: Response<ApiResponse>) => {
  const { token, newPassword } = req.body;

  try {
    // 1. Fetch user by Supabase access token (consumes the browser-appended hash token)
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    
    if (userErr || !user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset session. Please request a new link.'
      });
    }

    if (isCommonPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'This password is too common and easily guessable. Please choose a stronger password.',
      });
    }

    // 2. Hash password for our local PostgreSQL DB
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // 3. Update the users table credentials
    const { error: dbErr } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        reset_password_token: null,
        reset_password_expires: null,
      })
      .eq('id', user.id);

    if (dbErr) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update local password credentials.'
      });
    }

    // 4. Update the password in Supabase Auth GoTrue service
    const { error: authErr } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (authErr) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update authentication account credentials.'
      });
    }

    res.json({
      success: true,
      data: { message: 'Password reset successfully. You can now log in.' }
    });

  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal reset password error.' });
  }
};
