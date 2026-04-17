import { useCallback, useEffect, useState } from 'react';
import { getApiBase } from './apiBase';

const SETTINGS_UPDATED_EVENT = 'site-settings-updated';
const SETTINGS_UPDATED_KEY = 'site-settings-updated-at';

const FALLBACK_SETTINGS = {
  siteTitle: 'The Wall Street Investor',
  newsletterTitle: 'Morning Briefing',
  newsletterSubtitle: 'Five financial insights in your inbox every morning. No noise, no spam.',
  footerBrandText: 'Quality over quantity. Depth over virality. Every article is chosen because it has something meaningful to offer.',
  copyrightText: 'All rights reserved.',
  socialLinks: {
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
    rss: '/rss.xml',
  },
  privacyPolicySummary: 'Privacy Policy',
  privacyPolicyUrl: '/privacy',
  termsOfServiceSummary: 'Terms of Service',
  termsOfServiceUrl: '/terms',
  cookiePolicySummary: 'Cookie Policy',
  cookiePolicyUrl: '/cookies',
  disclaimerSummary: 'Disclaimer',
  disclaimerUrl: '/disclaimer',
};

export function normalizeSiteSettings(data = {}) {
  return {
    ...FALLBACK_SETTINGS,
    ...data,
    socialLinks: {
      ...FALLBACK_SETTINGS.socialLinks,
      ...(data.socialLinks || {}),
    },
  };
}

export const getSettingsApiBase = () => getApiBase();

export async function fetchSiteSettings() {
  const apiBase = getSettingsApiBase();
  const response = await fetch(`${apiBase}/api/settings`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export function notifySiteSettingsUpdated() {
  const stamp = String(Date.now());
  try {
    localStorage.setItem(SETTINGS_UPDATED_KEY, stamp);
  } catch {
    // Ignore storage failures and fall back to the custom event.
  }
  window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchSiteSettings();
      setSettings(normalizeSiteSettings(data));
    } catch {
      setSettings(FALLBACK_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const handleUpdate = () => load();
    const handleFocus = () => load();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        load();
      }
    };
    const handleStorage = (event) => {
      if (event.key === SETTINGS_UPDATED_KEY) {
        load();
      }
    };

    window.addEventListener(SETTINGS_UPDATED_EVENT, handleUpdate);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [load]);

  return { settings, loading, refresh: load };
}