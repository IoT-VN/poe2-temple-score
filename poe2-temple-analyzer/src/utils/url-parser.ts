/**
 * URL parsing utilities for temple share URLs
 */

/**
 * Extract temple data from share URL
 *
 * Parses the URL hash and extracts the ?t= parameter containing encoded temple data
 *
 * @param shareUrl - The share URL (e.g., from PoE2 temple builder)
 * @returns The encoded temple data string, or null if not found
 *
 * @example
 * ```ts
 * const url = 'http://localhost:8080/#/temple?t=ABC123';
 * const data = extractShareData(url);
 * // Returns: 'ABC123'
 * ```
 */
export function extractShareData(shareUrl: string): string | null {
  try {
    const url = new URL(shareUrl);
    const hash = url.hash;

    // Check if hash contains '?t='
    const tParamMatch = hash.match(/\?t=([^&]+)/);
    if (tParamMatch) {
      return tParamMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Validate share URL for security
 *
 * Ensures URL uses HTTP/HTTPS protocol and contains temple data parameter
 * Prevents XSS attacks from javascript: and data: URLs
 *
 * @param url - The URL to validate
 * @returns true if URL is safe and valid, false otherwise
 *
 * @example
 * ```ts
 * validateShareURL('https://example.com/#/temple?t=ABC') // true
 * validateShareURL('javascript:alert(1)') // false
 * ```
 */
export function validateShareURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Validate protocol (prevent javascript:, data:, etc.)
    if (!parsed.protocol.startsWith('http')) {
      return false;
    }
    // Check for temple data parameter
    if (!parsed.hash || !parsed.hash.includes('?t=')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
