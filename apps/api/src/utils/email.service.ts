// ============================================================
// DinePosAI - Centralized Transactional Email Service
// ============================================================

import { Resend } from 'resend';
import { logger } from './logger.js';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'DinePOS AI <onboarding@resend.dev>';

/**
 * Service to manage all transactional/security emails in the system.
 */
export const emailService = {
  /**
   * Sends a password reset instruction email.
   */
  async sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<boolean> {
    if (!resend) {
      logger.info(`[Email Mock] Password reset email to ${email}: Link ${resetUrl}`);
      return true;
    }

    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: email,
        subject: 'Reset your DinePOS AI Password',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #402d00;">Password Reset Request</h2>
            <p>Hello ${name},</p>
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
      return true;
    } catch (error: any) {
      logger.error(`Failed to send password reset email: ${error.message || error}`);
      return false;
    }
  },
  /**
   * Sends a security alert when a suspicious or new login is detected.
   */
  async sendNewLoginAlert(
    email: string,
    name: string,
    session: {
      device: string;
      browser: string;
      os: string;
      ipAddress: string;
      country: string;
      city: string;
      loginTime: string;
    }
  ): Promise<boolean> {
    if (!resend) {
      logger.info(`[Email Mock] New login alert to ${email}: New login from ${session.browser} / ${session.os} in ${session.city}, ${session.country} at ${session.loginTime}`);
      return true;
    }

    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: email,
        subject: 'DinePOS AI Security: New Login Detected',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #c97d00; margin-top: 0;">New Login Detected</h2>
            <p>Hello ${name},</p>
            <p>We detected a new login to your DinePOS AI account. Please review the details below to verify it was you:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #555;">Device/OS:</td>
                  <td style="padding: 6px 0; color: #333;">${session.device} / ${session.os}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #555;">Browser:</td>
                  <td style="padding: 6px 0; color: #333;">${session.browser}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #555;">Location:</td>
                  <td style="padding: 6px 0; color: #333;">${session.city}, ${session.country}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #555;">IP Address:</td>
                  <td style="padding: 6px 0; color: #333;">${session.ipAddress}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #555;">Time:</td>
                  <td style="padding: 6px 0; color: #333;">${session.loginTime}</td>
                </tr>
              </table>
            </div>

            <p style="color: #666; font-size: 14px;">If this was you, no action is needed. If you do not recognize this activity, please change your password immediately and revoke the session in your DinePOS Security Dashboard.</p>
            
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;" />
            <p style="font-size: 11px; color: #888888;">&copy; ${new Date().getFullYear()} DinePOS AI. Secure merchant operations.</p>
          </div>
        `,
      });
      return true;
    } catch (error: any) {
      logger.error(`Failed to send new login email alert: ${error.message || error}`);
      return false;
    }
  },

  /**
   * Sends a notification when the password has been changed.
   */
  async sendPasswordChangedAlert(email: string, name: string): Promise<boolean> {
    if (!resend) {
      logger.info(`[Email Mock] Password changed alert to ${email}`);
      return true;
    }

    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: email,
        subject: 'DinePOS AI Security: Password Changed',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #402d00; margin-top: 0;">Password Changed Successfully</h2>
            <p>Hello ${name},</p>
            <p>Your password for DinePOS AI was changed successfully on <strong>${new Date().toUTCString()}</strong>.</p>
            <p style="color: #d9534f; font-weight: bold;">If you did not make this change, please contact support immediately to lock your account.</p>
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;" />
            <p style="font-size: 11px; color: #888888;">&copy; ${new Date().getFullYear()} DinePOS AI. Secure merchant operations.</p>
          </div>
        `,
      });
      return true;
    } catch (error: any) {
      logger.error(`Failed to send password change email alert: ${error.message || error}`);
      return false;
    }
  },

  /**
   * Sends a notification to the old email when the email is updated.
   */
  async sendEmailChangedAlert(oldEmail: string, name: string, newEmail: string): Promise<boolean> {
    if (!resend) {
      logger.info(`[Email Mock] Email changed alert to ${oldEmail} (new email: ${newEmail})`);
      return true;
    }

    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: oldEmail,
        subject: 'DinePOS AI Security: Account Email Changed',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #402d00; margin-top: 0;">Account Email Changed</h2>
            <p>Hello ${name},</p>
            <p>The email associated with your DinePOS AI account was changed from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.</p>
            <p style="color: #d9534f; font-weight: bold;">If you did not request this change, please contact support immediately to secure your account.</p>
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;" />
            <p style="font-size: 11px; color: #888888;">&copy; ${new Date().getFullYear()} DinePOS AI. Secure merchant operations.</p>
          </div>
        `,
      });
      return true;
    } catch (error: any) {
      logger.error(`Failed to send email update alert: ${error.message || error}`);
      return false;
    }
  },
};
