// ============================================================
// DinePosAI - User Agent Parsing Utility
// ============================================================

export interface ParsedUserAgent {
  device: string;
  browser: string;
  os: string;
}

/**
 * Parses a User-Agent header string into a structured browser, OS, and device type.
 */
export function parseUserAgent(userAgentString: string | undefined): ParsedUserAgent {
  if (!userAgentString) {
    return {
      device: 'Unknown Device',
      browser: 'Unknown Browser',
      os: 'Unknown OS',
    };
  }

  let device = 'Desktop';
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  const ua = userAgentString.toLowerCase();

  // 1. Parse Device
  if (ua.includes('ipad') || (ua.includes('android') && !ua.includes('mobile'))) {
    device = 'Tablet';
  } else if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('ipod') || ua.includes('android') || ua.includes('blackberry') || ua.includes('windows phone')) {
    device = 'Mobile';
  }

  // 2. Parse OS
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    os = 'iOS';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }

  // 3. Parse Browser
  if (ua.includes('edg/')) {
    browser = 'Edge';
  } else if (ua.includes('chrome') || ua.includes('crios')) {
    // Chrome UA also contains "safari" and "like gecko"
    browser = 'Chrome';
  } else if (ua.includes('firefox') || ua.includes('fxios')) {
    browser = 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('msie') || ua.includes('trident/')) {
    browser = 'Internet Explorer';
  } else if (ua.includes('opera') || ua.includes('opr/')) {
    browser = 'Opera';
  }

  return { device, browser, os };
}
