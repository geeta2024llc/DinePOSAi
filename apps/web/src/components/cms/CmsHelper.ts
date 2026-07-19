'use client';

import { CmsConfig, defaultCmsConfig } from './CmsDefaults';
export type { CmsConfig };
export { defaultCmsConfig };

// Simple in-memory cache to prevent parsing localStorage on every single render/call
let cachedCmsConfig: CmsConfig | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('dinepos_cms_update', () => {
    cachedCmsConfig = null; // Invalidate cache on update
  });
  window.addEventListener('storage', (e) => {
    if (e.key === 'dinepos_cms_config') {
      cachedCmsConfig = null; // Invalidate cache on cross-tab storage changes
    }
  });
}

export const getCmsConfig = (): CmsConfig => {
  if (typeof window === 'undefined') return defaultCmsConfig;
  if (cachedCmsConfig) return cachedCmsConfig;

  try {
    const stored = localStorage.getItem('dinepos_cms_config');
    if (stored) {
      const parsed = JSON.parse(stored);
      
      const mergeSection = <T extends object>(defaultSection: T, parsedSection: any): T => {
        const result = { ...defaultSection };
        if (!parsedSection) return result;
        for (const key of Object.keys(defaultSection) as Array<keyof T>) {
          const val = parsedSection[key];
          if (val !== undefined && val !== null && val !== '') {
            result[key] = val;
          }
        }
        return result;
      };

      cachedCmsConfig = {
        homepage: mergeSection(defaultCmsConfig.homepage, parsed.homepage),
        pricing: mergeSection(defaultCmsConfig.pricing, parsed.pricing),
        support: mergeSection(defaultCmsConfig.support, parsed.support),
        partners: mergeSection(defaultCmsConfig.partners, parsed.partners),
        auth: mergeSection(defaultCmsConfig.auth, parsed.auth),
        legal: mergeSection(defaultCmsConfig.legal, parsed.legal),
      };
      return cachedCmsConfig;
    }
  } catch (e) {
    console.error('Failed to parse CMS config from localStorage:', e);
  }
  
  cachedCmsConfig = defaultCmsConfig;
  return cachedCmsConfig;
};

export const saveCmsConfig = (config: CmsConfig): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('dinepos_cms_config', JSON.stringify(config));
    cachedCmsConfig = config; // Update cache immediately
    // Dispatch custom event to notify other components/tabs
    window.dispatchEvent(new Event('dinepos_cms_update'));
  } catch (e) {
    console.error('Failed to save CMS config to localStorage:', e);
  }
};
