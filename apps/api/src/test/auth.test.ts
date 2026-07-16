import { describe, it, expect } from 'vitest';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../controllers/auth.controller.js';

describe('Auth Validation Schemas', () => {
  describe('Signup Schema Validation', () => {
    it('should validate complete correct inputs successfully', () => {
      const correctInput = {
        businessName: 'Deluxe Diner',
        name: 'John Doe',
        email: 'john.doe@dineposai.com',
        password: 'securePassword123!',
        country: 'Japan'
      };
      
      const parsed = signupSchema.safeParse(correctInput);
      expect(parsed.success).toBe(true);
    });

    it('should reject invalid or short passwords', () => {
      const weakInput = {
        businessName: 'Deluxe Diner',
        name: 'John Doe',
        email: 'john.doe@dineposai.com',
        password: 'short',
        country: 'Japan'
      };

      const parsed = signupSchema.safeParse(weakInput);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.errors[0].message).toContain('at least 8 characters');
      }
    });

    it('should reject structurally invalid email strings', () => {
      const badEmailInput = {
        businessName: 'Deluxe Diner',
        name: 'John Doe',
        email: 'not-an-email',
        password: 'securePassword123!'
      };

      const parsed = signupSchema.safeParse(badEmailInput);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.errors[0].message).toContain('Invalid email');
      }
    });
  });

  describe('Login Schema Validation', () => {
    it('should reject login payloads missing deviceUuid/deviceId', () => {
      const missingDeviceInput = {
        email: 'cashier@diner.com',
        password: 'validpassword'
      };

      const parsed = loginSchema.safeParse(missingDeviceInput);
      expect(parsed.success).toBe(false);
    });

    it('should pass correct credentials structure', () => {
      const correctLogin = {
        email: 'cashier@diner.com',
        password: 'validpassword',
        deviceId: 'tablet-pos-01'
      };

      const parsed = loginSchema.safeParse(correctLogin);
      expect(parsed.success).toBe(true);
    });
  });

  describe('Forgot Password Schema Validation', () => {
    it('should pass with a valid email address', () => {
      const parsed = forgotPasswordSchema.safeParse({ email: 'manager@restaurant.com' });
      expect(parsed.success).toBe(true);
    });

    it('should reject structurally invalid email addresses', () => {
      const parsed = forgotPasswordSchema.safeParse({ email: 'invalid-email' });
      expect(parsed.success).toBe(false);
    });
  });

  describe('Reset Password Schema Validation', () => {
    it('should pass with a valid token and strong password', () => {
      const parsed = resetPasswordSchema.safeParse({
        token: 'valid-reset-token-hash-1234',
        newPassword: 'StrongPassword123!'
      });
      expect(parsed.success).toBe(true);
    });

    it('should reject empty reset tokens', () => {
      const parsed = resetPasswordSchema.safeParse({
        token: '',
        newPassword: 'StrongPassword123!'
      });
      expect(parsed.success).toBe(false);
    });

    it('should reject passwords that fail complexity requirements', () => {
      const weakPasswordInput = {
        token: 'valid-token',
        newPassword: 'weak'
      };
      const parsed = resetPasswordSchema.safeParse(weakPasswordInput);
      expect(parsed.success).toBe(false);
    });
  });
});
