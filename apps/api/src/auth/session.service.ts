// ============================================================
// DinePosAI - Session & Login History Service
// ============================================================

import crypto from 'crypto';
import { Request } from 'express';
import { supabase } from '../utils/supabase.js';
import { parseUserAgent } from '../utils/user-agent.js';
import { geolocateIp } from '../utils/geo-ip.js';
import { logger } from '../utils/logger.js';

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const sessionService = {
  /**
   * Creates a new user session, parses metadata, geolocates the request IP,
   * inserts a user_sessions record, and records a successful login history entry.
   */
  async createSession(
    userId: string,
    tenantId: string,
    branchId: string | null,
    deviceId: string,
    refreshToken: string,
    req: Request
  ): Promise<string> {
    try {
      const ip = req.ip || req.socket.remoteAddress || '';
      const userAgentStr = req.headers['user-agent'] || '';
      
      const { device, browser, os } = parseUserAgent(userAgentStr);
      const { country, city } = await geolocateIp(ip);
      
      const refreshTokenHash = hashToken(refreshToken);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

      // Insert session record
      const { data: sessionData, error: sessionErr } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          tenant_id: tenantId,
          branch_id: branchId,
          device_id: deviceId,
          refresh_token: refreshTokenHash,
          device,
          browser,
          os,
          ip_address: ip,
          country,
          city,
          expires_at: expiresAt.toISOString(),
          login_time: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          is_current: true,
        })
        .select('id')
        .single();

      if (sessionErr || !sessionData) {
        throw new Error(`Failed to insert session row: ${sessionErr?.message || 'Unknown error'}`);
      }

      // Record successful login in history
      await this.recordLoginHistory({
        userId,
        tenantId,
        ipAddress: ip,
        browser,
        device,
        os,
        country,
        city,
        status: 'SUCCESS',
        failureReason: null,
      });

      return sessionData.id;

    } catch (err: any) {
      logger.error(`Failed to establish session: ${err.message || err}`);
      throw err;
    }
  },

  /**
   * Records an entry in the login_history table.
   */
  async recordLoginHistory(data: {
    userId: string | null;
    tenantId: string | null;
    ipAddress: string | null;
    browser: string | null;
    device: string | null;
    os: string | null;
    country: string | null;
    city: string | null;
    status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
    failureReason: string | null;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('login_history')
        .insert({
          user_id: data.userId,
          tenant_id: data.tenantId,
          ip_address: data.ipAddress,
          browser: data.browser,
          device: data.device,
          os: data.os,
          country: data.country,
          city: data.city,
          status: data.status,
          failure_reason: data.failureReason,
        });

      if (error) {
        logger.error(`Failed to record login history: ${error.message}`);
      }
    } catch (err: any) {
      logger.error(`Error recording login history: ${err.message || err}`);
    }
  },

  /**
   * Revokes a specific session by ID.
   */
  async revokeSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId)
        .select();

      if (error) {
        throw error;
      }

      return (data && data.length > 0) || false;
    } catch (err: any) {
      logger.error(`Failed to revoke session ${sessionId}: ${err.message || err}`);
      return false;
    }
  },

  /**
   * Revokes all sessions for a user EXCEPT the current active session.
   */
  async revokeAllOtherSessions(userId: string, currentSessionTokenHash: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userId)
        .neq('refresh_token', currentSessionTokenHash);

      if (error) {
        throw error;
      }
    } catch (err: any) {
      logger.error(`Failed to revoke other sessions for user ${userId}: ${err.message || err}`);
      throw err;
    }
  },

  /**
   * Revokes all sessions for a specific user (force logout everywhere).
   */
  async revokeAllSessions(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (err: any) {
      logger.error(`Failed to revoke all sessions for user ${userId}: ${err.message || err}`);
      throw err;
    }
  },

  /**
   * Updates the last activity timestamp for a session.
   */
  async updateLastActivity(refreshTokenHash: string): Promise<void> {
    try {
      await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('refresh_token', refreshTokenHash);
    } catch (err: any) {
      logger.error(`Failed to update session activity: ${err.message || err}`);
    }
  },

  /**
   * Cleans up expired sessions from the database.
   */
  async cleanExpiredSessions(): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        logger.error(`Failed to prune expired sessions: ${error.message}`);
      }
    } catch (err: any) {
      logger.error(`Error during session pruning: ${err.message || err}`);
    }
  },
};
