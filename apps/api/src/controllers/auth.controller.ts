import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabase.js';
import { ApiResponse, UserRole } from '@dineposai/shared-types';

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
};

// Input Validation Schemas
export const signupSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  country: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  deviceId: z.string().min(1, 'Device identifier is required'),
});

// Helper: Generate JWT tokens
const generateAccessToken = (user: { id: string; tenant_id: string; role: string; email: string }) => {
  return jwt.sign(
    { id: user.id, tenantId: user.tenant_id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

// Helper: hash a token before persisting
const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

// 1. SIGNUP CONTROLLER (Tenant Creator)
export const signup = async (req: Request, res: Response<ApiResponse>) => {
  const { businessName, name, email, password, country } = req.body;

  try {
    // Check if email already exists (use maybeSingle to avoid 406 on no-row)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    // Hash Password
    const passwordHash = await bcrypt.hash(password, 12);

    // Resolve timezone and currency from provided country
    const resolvedCountry = country || 'Japan';
    const { timezone, currency } = COUNTRY_DEFAULTS[resolvedCountry] ?? { timezone: 'UTC', currency: 'USD' };

    // Create Tenant Record
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 14);

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
        trial_ends_at: trialEnds.toISOString(),
      })
      .select()
      .single();

    if (tenantErr || !tenant) {
      return res.status(500).json({
        success: false,
        error: 'Tenant provisioning failed. Please try again.'
      });
    }

    // Create Admin User (Role: MANAGER)
    const { data: user, error: userErr } = await supabase
      .from('users')
      .insert({
        tenant_id: tenant.id,
        name,
        email,
        password_hash: passwordHash,
        role: 'MANAGER',
        is_active: true,
      })
      .select()
      .single();

    if (userErr || !user) {
      return res.status(500).json({
        success: false,
        error: 'User provisioning failed. Please try again.'
      });
    }

    res.status(201).json({
      success: true,
      data: {
        message: 'Account and restaurant workspace created successfully.',
        tenant: { id: tenant.id, name: tenant.name, trialEndsAt: tenant.trial_ends_at },
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Internal registration error.'
    });
  }
};

// 2. LOGIN CONTROLLER
export const login = async (req: Request, res: Response<ApiResponse>) => {
  const { email, password, deviceId } = req.body;

  try {
    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*, tenants!inner(*)')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect email or password.'
      });
    }

    // Verify password FIRST — before revealing any account-state information
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect email or password.'
      });
    }

    // Now safe to check account and tenant status
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Your account is suspended. Please contact your restaurant manager.'
      });
    }

    const tenant = user.tenants;
    if (!tenant || tenant.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Restaurant workspace is unavailable. Please contact system support.'
      });
    }

    // Delete any existing sessions for this user (single-session enforcement)
    await supabase.from('sessions').delete().eq('user_id', user.id);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Store a SHA-256 hash of the refresh token — raw token is never persisted
    const refreshTokenHash = hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: sessionErr } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        tenant_id: user.tenant_id,
        device_id: deviceId,
        refresh_token: refreshTokenHash,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'] || null,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionErr) {
      return res.status(500).json({
        success: false,
        error: 'Session setup failed. Please try again.'
      });
    }

    // Update last login timestamp
    await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);

    // Set refresh token in httpOnly cookie (raw token, not the hash)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
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
          role: user.role as UserRole,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          currency: tenant.currency,
          taxType: tenant.tax_type,
          taxRate: tenant.tax_rate,
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
