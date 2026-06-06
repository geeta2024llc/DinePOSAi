import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabase.js';
import { ApiResponse, UserRole } from '@dineposai/shared-types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secure-jwt-secret-key-12345';
const ACCESS_TOKEN_EXPIRY = '30m'; // 30 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

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

// 1. SIGNUP CONTROLLER (Tenant Creator)
export const signup = async (req: Request, res: Response<ApiResponse>) => {
  const { businessName, name, email, password, country } = req.body;

  try {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    // Step A: Hash Password
    const passwordHash = await bcrypt.hash(password, 12);

    // Step B: Create Tenant Record
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 14); // 14-day trial

    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .insert({
        name: businessName,
        country: country || 'Japan',
        timezone: 'Asia/Tokyo',
        currency: 'JPY',
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
        error: `Tenant provisioning failed: ${tenantErr?.message}`
      });
    }

    // Step C: Create Admin User (Role: MANAGER)
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
      // In a real production system we should rollback tenant creation, but this is a sample flow
      return res.status(500).json({
        success: false,
        error: `User provisioning failed: ${userErr?.message}`
      });
    }

    // Success response
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
      error: error.message || 'Internal registration error.'
    });
  }
};

// 2. LOGIN CONTROLLER
export const login = async (req: Request, res: Response<ApiResponse>) => {
  const { email, password, deviceId } = req.body;

  try {
    // Step A: Find user by email
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

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Your account is suspended. Please contact your restaurant manager.'
      });
    }

    // Check if tenant is active
    const tenant = user.tenants;
    if (tenant.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: `Restaurant workspace is ${tenant.status.toLowerCase()}. Please contact system support.`
      });
    }

    // Step B: Verify Password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect email or password.'
      });
    }

    // Step C: Single active session enforcement
    // Delete any old session for this user to enforce single session limit
    await supabase
      .from('sessions')
      .delete()
      .eq('user_id', user.id);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Save session in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: sessionErr } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        tenant_id: user.tenant_id,
        device_id: deviceId,
        refresh_token: refreshToken,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'] || null,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionErr) {
      return res.status(500).json({
        success: false,
        error: `Session setup failed: ${sessionErr.message}`
      });
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_EXPIRY * 1000,
    });

    // Return access token
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
      error: error.message || 'Internal login error.'
    });
  }
};
