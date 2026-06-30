import { describe, it, expect } from 'vitest';
import { signupSchema, loginSchema } from '../controllers/auth.controller.js';

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
});
