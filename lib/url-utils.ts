/**
 * URL Utilities
 * Environment-aware URL generation
 * Automatically adapts to dev/staging/production domains
 */

/**
 * Get the base URL for the application
 * Works across all environments without code changes
 * 
 * Priority:
 * 1. NEXT_PUBLIC_BASE_URL environment variable (if set)
 * 2. Vercel URL (auto-detected in production)
 * 3. Request headers (for server-side)
 * 4. Localhost fallback (development)
 */
export function getBaseUrl(): string {
  // Priority 1: Use explicit environment variable
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // Priority 2: Vercel auto-detection
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Priority 3: Check if we're in browser and can use window.location
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Priority 4: Development fallback
  return 'http://localhost:3000';
}

/**
 * Generate a full URL for a given path
 * @param path Path starting with / (e.g., /payments/registration/token)
 * @returns Full URL with domain
 */
export function getFullUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Get the current environment
 */
export function getEnvironment(): 'development' | 'production' | 'preview' {
  if (process.env.NODE_ENV === 'production') {
    // Check if it's Vercel preview deployment
    if (process.env.VERCEL_ENV === 'preview') {
      return 'preview';
    }
    return 'production';
  }
  return 'development';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

/**
 * Get domain name only (without protocol)
 */
export function getDomainName(): string {
  const baseUrl = getBaseUrl();
  return baseUrl.replace(/^https?:\/\//, '');
}
