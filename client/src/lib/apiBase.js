const trimSlash = (value = '') => String(value).trim().replace(/\/$/, '');

export function getApiBase() {
  const envBase = trimSlash(import.meta.env.VITE_API_URL || '');
  if (envBase) return envBase;

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }

  // In production without VITE_API_URL, use same-origin '/api' calls.
  return '';
}
