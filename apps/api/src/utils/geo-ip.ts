// ============================================================
// DinePosAI - IP Geolocation Utility
// ============================================================

import { logger } from './logger.js';

export interface GeoLocation {
  country: string | null;
  city: string | null;
}

// In-memory cache for IP geolocations to prevent redundant network requests and maximize login speed
const geoCache = new Map<string, GeoLocation>();

/**
 * Resolves an IP address to a country and city using a free, lightweight geolocation API.
 * Includes a strict 500ms timeout and in-memory caching to ensure login requests are extremely fast.
 */
export async function geolocateIp(ip: string | undefined): Promise<GeoLocation> {
  const localResult: GeoLocation = { country: 'Local Network', city: 'Local' };

  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
    return localResult;
  }

  // Check for private network IPs
  const isPrivate = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(ip);
  if (isPrivate) {
    return localResult;
  }

  // Check cache first
  if (geoCache.has(ip)) {
    return geoCache.get(ip)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 500); // Strict 500ms max timeout for fast logins

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json() as any;
      if (data && data.status === 'success') {
        const result: GeoLocation = {
          country: data.country || 'Unknown Country',
          city: data.city || 'Unknown City',
        };
        geoCache.set(ip, result);
        return result;
      }
    }
  } catch (err: any) {
    logger.warn(`IP geolocation failed for IP ${ip}: ${err.message || err}`);
  }

  // Cache fallback to avoid retrying slow/failed requests for the same IP
  const fallbackResult: GeoLocation = { country: 'Unknown Country', city: 'Unknown City' };
  geoCache.set(ip, fallbackResult);
  return fallbackResult;
}
