import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
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

    // Create Tenant and Admin User inside a single database transaction RPC
    const { data: signupResult, error: signupErr } = await supabase
      .rpc('signup_tenant_and_user', {
        p_business_name: businessName,
        p_name: name,
        p_email: email,
        p_password_hash: passwordHash,
        p_country: resolvedCountry,
        p_timezone: timezone,
        p_currency: currency
      });

    if (signupErr || !signupResult) {
      return res.status(500).json({
        success: false,
        error: signupErr?.message || 'Tenant provisioning failed. Please try again.'
      });
    }

    res.status(201).json({
      success: true,
      data: {
        message: 'Account and restaurant workspace created successfully.',
        tenant: signupResult.tenant,
        user: signupResult.user
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal registration error.'
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
          onboarded: tenant.onboarded,
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
      .from('sessions')
      .select('*')
      .eq('refresh_token', refreshTokenHash)
      .eq('user_id', decoded.id)
      .maybeSingle();

    if (sessionErr || !session) {
      return res.status(401).json({ success: false, error: 'Invalid session or refresh token.' });
    }

    // Check expiry
    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('sessions').delete().eq('id', session.id);
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
      .from('sessions')
      .update({
        refresh_token: newRefreshTokenHash,
        expires_at: newExpiresAt.toISOString(),
      })
      .eq('id', session.id);

    if (updateErr) {
      return res.status(500).json({ success: false, error: 'Failed to rotate session.' });
    }

    // Set new cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_EXPIRY * 1000,
    });

    const accessToken = generateAccessToken(user);

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
          onboarded: tenant.onboarded,
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

  if (refreshToken) {
    try {
      const refreshTokenHash = hashToken(refreshToken);
      await supabase.from('sessions').delete().eq('refresh_token', refreshTokenHash);
    } catch (e) {
      // Ignore session delete errors on logout to allow clean cookie removal
    }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.json({
    success: true,
    data: { message: 'Logged out successfully.' }
  });
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

// 5. FORGOT PASSWORD CONTROLLER
export const forgotPassword = async (req: Request, res: Response<ApiResponse>) => {
  const { email } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .maybeSingle();

    // Secure design: do not leak if email exists or not
    const successMsg = 'If the email exists in our system, secure reset instructions have been sent.';
    if (error || !user) {
      return res.json({ success: true, data: { message: successMsg } });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiry

    await supabase
      .from('users')
      .update({
        reset_password_token: token,
        reset_password_expires: expires.toISOString(),
      })
      .eq('id', user.id);

    const origin = req.headers.origin || 'http://localhost:3000';
    const resetUrl = `${origin}/reset-password?token=${token}`;

    console.log('\n========================================');
    console.log('🔑 PASSWORD RESET REQUESTED');
    console.log(`User: ${user.name} (${user.email})`);
    console.log(`Reset Link: ${resetUrl}`);
    console.log('========================================\n');

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: 'DinePOS AI <security@dinepos.ai>',
          to: user.email,
          subject: 'Reset your DinePOS AI Password',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #402d00;">Password Reset Request</h2>
              <p>Hello ${user.name},</p>
              <p>We received a request to reset your password. Click the button below to set up a new password:</p>
              <div style="margin: 25px 0;">
                <a href="${resetUrl}" style="background-color: #ffe2ab; color: #402d00; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
              </div>
              <p>This link is valid for 1 hour. If you did not make this request, you can safely ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
              <p style="font-size: 11px; color: #888888;">&copy; ${new Date().getFullYear()} DinePOS AI. Secure merchant operations.</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('[Auth] Failed to send reset email via Resend:', emailErr);
      }
    }

    res.json({
      success: true,
      data: { message: successMsg }
    });

  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal forgot password error.' });
  }
};

// 6. RESET PASSWORD CONTROLLER
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
