import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { supabase, supabaseAuthClient } from '../utils/supabase.js';
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
  'Nepal':          { timezone: 'Asia/Kathmandu',    currency: 'NPR' },
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
        error: 'An account with this email address already exists.'
      });
    }

    // Resolve timezone and currency from country
    const resolvedCountry = country || 'Japan';
    const { timezone, currency } = COUNTRY_DEFAULTS[resolvedCountry] ?? { timezone: 'UTC', currency: 'USD' };

    // Generate local UUID for the user
    const userId = crypto.randomUUID();

    // Register user in Supabase Auth first
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      id: userId,
      email: emailLower,
      password: password,
      email_confirm: true
    });

    if (authError || !authData?.user) {
      return res.status(500).json({
        success: false,
        error: `Supabase authentication registration failed: ${authError?.message || 'Unknown error'}`
      });
    }

    createdAuthUserId = authData.user.id;

    // Hash Password for local DB backup
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert Tenant
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
        trial_ends_at: trialEndsAt.toISOString()
      })
      .select()
      .single();

    if (tenantErr || !tenant) {
      throw new Error(`Failed to create tenant: ${tenantErr?.message}`);
    }

    // Insert User
    const { data: user, error: userErr } = await supabase
      .from('users')
      .insert({
        id: userId,
        tenant_id: tenant.id,
        name,
        email: emailLower,
        password_hash: passwordHash,
        role: 'MANAGER',
        is_active: true
      })
      .select()
      .single();

    if (userErr || !user) {
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
          onboarded: tenant.onboarded
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as UserRole
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

// 2. LOGIN CONTROLLER
export const login = async (req: Request, res: Response<ApiResponse>) => {
  const { email, password, deviceId } = req.body;
  const emailLower = email.toLowerCase().trim();

  try {
    let authVerified = false;
    let authError = null;

    // Attempt login via supabaseAuthClient (anon key) to avoid contaminating the
    // service-role admin client's session context
    const { data: signInData, error: signInErr } = await supabaseAuthClient.auth.signInWithPassword({
      email: emailLower,
      password: password
    });

    if (signInErr) {
      authError = signInErr;
    } else if (signInData?.user) {
      authVerified = true;
    }

    // Look up user in DB by email (works regardless of ID alignment with Supabase Auth)
    const { data: localUser, error: localUserErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', emailLower)
      .maybeSingle();

    // Fallback: if Supabase Auth failed (email not confirmed, rate limit, etc.)
    // validate credentials directly against the local bcrypt password_hash
    if (!authVerified && localUser && !localUserErr) {
      const passwordMatch = await bcrypt.compare(password, localUser.password_hash);
      if (passwordMatch) {
        authVerified = true;
        console.log(`[Auth] Bcrypt fallback auth successful for: ${emailLower}`);

        // Try to register in Supabase Auth for future sign-ins (non-fatal)
        const { error: migrationErr } = await supabase.auth.admin.createUser({
          id: localUser.id,
          email: emailLower,
          password: password,
          email_confirm: true
        });
        if (migrationErr && !migrationErr.message.includes('already been registered')) {
          console.error(`[Auth Migration] Could not register in Supabase Auth: ${migrationErr.message}`);
        }
      }
    }

    if (!authVerified) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect email or password.'
      });
    }

    // Look up user in local database by EMAIL (not auth ID) to handle any UUID mismatch
    // between Supabase Auth and the users table
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('*, tenants!inner(*)')
      .eq('email', emailLower)
      .single();

    if (userErr || !user) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect email or password.'
      });
    }

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

    // Terminate existing sessions
    await supabase.from('sessions').delete().eq('user_id', user.id);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
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

    // Update last login
    await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);

    // Set refresh cookie
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

    const origin = req.headers.origin || process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000';
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
