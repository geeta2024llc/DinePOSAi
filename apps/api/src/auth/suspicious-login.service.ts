// ============================================================
// DinePosAI - Suspicious Login Detection Service
// ============================================================

import { supabase } from '../utils/supabase.js';
import { emailService } from '../utils/email.service.js';
import { logger } from '../utils/logger.js';

export const suspiciousLoginService = {
  /**
   * Compares a new session against the user's recent login history
   * to detect impossible travel, different countries, or completely new devices.
   * If suspicious, triggers an email alert to the user.
   */
  async detectAndAlert(
    userId: string,
    email: string,
    name: string,
    newSession: {
      device: string;
      browser: string;
      os: string;
      ipAddress: string;
      country: string;
      city: string;
      loginTime: string;
    }
  ): Promise<boolean> {
    try {
      // 1. Get recent successful logins from history
      const { data: history, error } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'SUCCESS')
        .order('created_at', { ascending: false })
        .limit(6); // Get up to 6 (new one is already inserted or we compare before inserting)

      if (error || !history || history.length <= 1) {
        // First login or not enough history, not suspicious
        return false;
      }

      // The new session is the most recent in the DB, so compare it with the previous ones (index 1+)
      const previousLogins = history.slice(1);
      const latestPrev = previousLogins[0];

      let isSuspicious = false;
      const reasons: string[] = [];

      // 2. Check: Different Country (Impossible Travel)
      if (
        newSession.country && 
        newSession.country !== 'Unknown Country' && 
        latestPrev.country && 
        latestPrev.country !== 'Unknown Country' && 
        newSession.country !== latestPrev.country
      ) {
        // Country changed. Check time difference.
        const prevTime = new Date(latestPrev.created_at).getTime();
        const newTime = new Date(newSession.loginTime).getTime();
        const hoursDiff = Math.abs(newTime - prevTime) / (1000 * 60 * 60);

        if (hoursDiff < 6) {
          isSuspicious = true;
          reasons.push(`Impossible Travel (Country changed from ${latestPrev.country} to ${newSession.country} in ${hoursDiff.toFixed(1)} hours)`);
        } else {
          // Different country but elapsed time makes travel possible, still notify since it's a different country
          isSuspicious = true;
          reasons.push(`New login from different country: ${newSession.country} (previously ${latestPrev.country})`);
        }
      }

      // 3. Check: New Device combination
      const isNewDevice = !previousLogins.some(
        (prev) =>
          prev.device === newSession.device &&
          prev.browser === newSession.browser &&
          prev.os === newSession.os
      );

      if (isNewDevice) {
        isSuspicious = true;
        reasons.push(`New device fingerprint: ${newSession.device} / ${newSession.browser} / ${newSession.os}`);
      }

      // 4. Send email alert if suspicious
      if (isSuspicious) {
        logger.warn({ userId, reasons }, `[Security Alert] Suspicious login detected for user ${email}`);
        
        // Asynchronously send the alert so we don't hold up the login process
        emailService.sendNewLoginAlert(email, name, newSession).catch((err) => {
          logger.error(`Failed to send suspicious login email alert: ${err.message}`);
        });
      }

      return isSuspicious;
    } catch (err: any) {
      logger.error(`Error in suspicious login check: ${err.message || err}`);
      return false;
    }
  },
};
