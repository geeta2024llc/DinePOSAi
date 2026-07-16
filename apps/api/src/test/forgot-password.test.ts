// ============================================================
// DinePosAI - Forgot Password Controller Verification Tests
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Response } from 'express';
import { forgotPassword, resetPasswordSupabase } from '../controllers/auth.controller.js';

// Mock Supabase client
let mockUserResult = { data: null as any, error: null as any };

vi.mock('../utils/supabase.js', () => {
  const client = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => mockUserResult)
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(async () => ({ error: null }))
      }))
    })),
    auth: {
      resetPasswordForEmail: vi.fn(async () => ({ error: null })),
      getUser: vi.fn(async () => ({ data: { user: { id: 'user-uuid-123' } }, error: null })),
      admin: {
        updateUserById: vi.fn(async () => ({ error: null }))
      }
    }
  };
  return { supabase: client };
});

// Mock Email Service
vi.mock('../utils/email.service.js', () => {
  return {
    emailService: {
      sendPasswordResetEmail: vi.fn(async () => true)
    }
  };
});

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe('Forgot Password Controller Protection Toggle', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.EMAIL_ENUMERATION_PROTECTION;
    mockUserResult = { data: null, error: null }; // Default: user not found
  });

  afterEach(() => {
    process.env.EMAIL_ENUMERATION_PROTECTION = originalEnv;
  });

  it('should return success msg even if user is not found if protection is ENABLED (true)', async () => {
    process.env.EMAIL_ENUMERATION_PROTECTION = 'true';
    const req = { body: { email: 'nonexistent@dinepos.ai' } } as any;
    const res = mockResponse();

    await forgotPassword(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          message: expect.stringContaining('secure reset instructions have been sent')
        })
      })
    );
  });

  it('should return 404 error if user is not found and protection is DISABLED (false)', async () => {
    process.env.EMAIL_ENUMERATION_PROTECTION = 'false';
    const req = { body: { email: 'nonexistent@dinepos.ai' } } as any;
    const res = mockResponse();

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'This email address is not registered.'
      })
    );
  });

  it('should generate token, update database, and return success if user is found', async () => {
    mockUserResult = { 
      data: { id: 'user-uuid-123', email: 'john@dinepos.ai', name: 'John Doe' }, 
      error: null 
    };
    const req = { 
      body: { email: 'john@dinepos.ai' },
      headers: { origin: 'http://localhost:3000' }
    } as any;
    const res = mockResponse();

    await forgotPassword(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          message: expect.stringContaining('secure reset instructions have been sent')
        })
      })
    );
  });

  describe('Reset Password Supabase Controller', () => {
    it('should reset password successfully with a valid access token', async () => {
      const req = {
        body: {
          token: 'valid-supabase-access-token',
          newPassword: 'StrongNewPassword123!'
        }
      } as any;
      const res = mockResponse();

      await resetPasswordSupabase(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            message: expect.stringContaining('Password reset successfully')
          })
        })
      );
    });

    it('should reject common passwords', async () => {
      const req = {
        body: {
          token: 'valid-supabase-access-token',
          newPassword: 'Password123!' // in common pass blocklist
        }
      } as any;
      const res = mockResponse();

      await resetPasswordSupabase(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('too common')
        })
      );
    });
  });
});
