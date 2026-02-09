/**
 * URL parser tests
 */

import { extractShareData, validateShareURL } from '../utils/url-parser';
import { FIXTURE_URLS } from './fixtures';

describe('URL Parser', () => {
  describe('extractShareData', () => {
    it('should extract t parameter from valid URL', () => {
      const result = extractShareData(FIXTURE_URLS.valid);
      expect(result).toBe('ABC123');
    });

    it('should return null for URL without t parameter', () => {
      const result = extractShareData(FIXTURE_URLS.missingParam);
      expect(result).toBeNull();
    });

    it('should return null for malformed URL', () => {
      const result = extractShareData(FIXTURE_URLS.malformed);
      expect(result).toBeNull();
    });

    it('should handle URLs with multiple parameters', () => {
      const url = 'http://localhost:8080/#/temple?t=ABC123&other=value';
      const result = extractShareData(url);
      expect(result).toBe('ABC123');
    });

    it('should handle empty hash', () => {
      const url = 'http://localhost:8080/#';
      const result = extractShareData(url);
      expect(result).toBeNull();
    });

    it('should handle special characters in t parameter', () => {
      const url = 'http://localhost:8080/#/temple?t=ABC-DEF_123';
      const result = extractShareData(url);
      expect(result).toBe('ABC-DEF_123');
    });
  });

  describe('validateShareURL', () => {
    it('should accept valid http URL', () => {
      const result = validateShareURL(FIXTURE_URLS.valid);
      expect(result).toBe(true);
    });

    it('should accept valid https URL', () => {
      const url = 'https://example.com/#/temple?t=ABC';
      const result = validateShareURL(url);
      expect(result).toBe(true);
    });

    it('should reject javascript protocol', () => {
      const result = validateShareURL(FIXTURE_URLS.javascriptProtocol);
      expect(result).toBe(false);
    });

    it('should reject data protocol', () => {
      const result = validateShareURL(FIXTURE_URLS.dataProtocol);
      expect(result).toBe(false);
    });

    it('should reject URL without t parameter', () => {
      const result = validateShareURL(FIXTURE_URLS.missingParam);
      expect(result).toBe(false);
    });

    it('should reject malformed URL', () => {
      const result = validateShareURL(FIXTURE_URLS.malformed);
      expect(result).toBe(false);
    });

    it('should reject ftp protocol', () => {
      const url = 'ftp://example.com/#/temple?t=ABC';
      const result = validateShareURL(url);
      expect(result).toBe(false);
    });

    it('should reject file protocol', () => {
      const url = 'file:///path/to/file';
      const result = validateShareURL(url);
      expect(result).toBe(false);
    });
  });
});
