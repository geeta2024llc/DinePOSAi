// ============================================================
// DinePosAI - Authentication Upgrade Feature Tests
// ============================================================

import { describe, it, expect } from 'vitest';
import { isCommonPassword } from '../utils/common-passwords.js';
import { parseUserAgent } from '../utils/user-agent.js';
import { geolocateIp } from '../utils/geo-ip.js';

describe('DinePosAI Authentication System Upgrades', () => {
  
  describe('1. Common Password Rejection', () => {
    it('should reject standard weak passwords', () => {
      expect(isCommonPassword('123456')).toBe(true);
      expect(isCommonPassword('password')).toBe(true);
      expect(isCommonPassword('admin123')).toBe(true);
    });

    it('should reject repeating character sequences', () => {
      expect(isCommonPassword('aaaaaaaa')).toBe(true);
      expect(isCommonPassword('11111111')).toBe(true);
    });

    it('should reject sequential number sequences', () => {
      expect(isCommonPassword('12345678')).toBe(true);
      expect(isCommonPassword('abcdefgh')).toBe(true);
    });

    it('should allow strong complex passwords', () => {
      expect(isCommonPassword('Tr0ub4dur&3')).toBe(false);
      expect(isCommonPassword('S3cur3P@ssw0rd!_2026')).toBe(false);
    });
  });

  describe('2. User Agent Parsing', () => {
    it('should identify Desktop Chrome on Windows', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
      const parsed = parseUserAgent(ua);
      expect(parsed.device).toBe('Desktop');
      expect(parsed.browser).toBe('Chrome');
      expect(parsed.os).toBe('Windows');
    });

    it('should identify Mobile Safari on iPhone', () => {
      const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
      const parsed = parseUserAgent(ua);
      expect(parsed.device).toBe('Mobile');
      expect(parsed.browser).toBe('Safari');
      expect(parsed.os).toBe('iOS');
    });

    it('should handle missing or empty user agent gracefully', () => {
      const parsed = parseUserAgent(undefined);
      expect(parsed.device).toBe('Unknown Device');
      expect(parsed.browser).toBe('Unknown Browser');
      expect(parsed.os).toBe('Unknown OS');
    });
  });

  describe('3. Geolocation Utility', () => {
    it('should resolve local network IPs instantly', async () => {
      const localIp = '127.0.0.1';
      const geo = await geolocateIp(localIp);
      expect(geo.country).toBe('Local Network');
      expect(geo.city).toBe('Local');
    });

    it('should resolve private IPs as local network', async () => {
      const privateIp = '192.168.1.50';
      const geo = await geolocateIp(privateIp);
      expect(geo.country).toBe('Local Network');
      expect(geo.city).toBe('Local');
    });
  });
  
});
