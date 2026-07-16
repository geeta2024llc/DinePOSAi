// ============================================================
// DinePosAI - Common Passwords List for Rejecting Weak Passwords
// ============================================================

export const COMMON_PASSWORDS = new Set<string>([
  '123456', '123456789', 'picture1', 'password', '12345678', '111111', 
  '1234567', 'qwerty', '12345', '1234567890', '1234567890', '123123',
  '123456789', 'administrator', 'admin123', 'admin', 'pass123', 'password123',
  'superadmin', 'guest', 'user123', 'welcome', 'letmein', 'default',
  'dinepos', 'dinepos123', 'restaurant', 'cashier', 'kitchen', 'manager',
  'password!', 'password123!', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm', '000000', '987654321',
  'password1234', 'monkey', 'dragon', 'football', 'shadow', 'mustang',
  'access', 'master', 'oracle', 'secret', 'security', 'system', 'root',
  // standard list of other common patterns
]);

/**
 * Checks if the password is in the common password blocklist.
 * Returns true if the password is weak and common.
 */
export function isCommonPassword(password: string): boolean {
  const normalized = password.toLowerCase().trim();
  
  // 1. Exact match in blocklist
  if (COMMON_PASSWORDS.has(normalized)) {
    return true;
  }

  // 2. Trivial patterns like repeating characters
  if (/^(.)\1{7,}$/.test(normalized)) {
    return true;
  }

  // 3. Sequential numbers or characters
  const sequentialNumbers = '01234567890123456789';
  if (normalized.length >= 8 && sequentialNumbers.includes(normalized)) {
    return true;
  }
  
  const sequentialLetters = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz';
  if (normalized.length >= 8 && sequentialLetters.includes(normalized)) {
    return true;
  }

  return false;
}
