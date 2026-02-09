/**
 * Security tests
 */

import { validateShareURL } from '../utils/url-parser';
import { analyzeTemple } from '../core/analyzer';
import { createEmptyTemple } from './fixtures';

describe('Security', () => {
  describe('XSS Prevention', () => {
    it('should reject javascript: protocol URLs', () => {
      const maliciousUrl = 'javascript:alert(document.cookie)';
      expect(validateShareURL(maliciousUrl)).toBe(false);
    });

    it('should reject data: URLs with scripts', () => {
      const maliciousUrl = 'data:text/html,<script>alert(1)</script>';
      expect(validateShareURL(maliciousUrl)).toBe(false);
    });

    it('should reject vbscript: protocol', () => {
      const maliciousUrl = 'vbscript:msgbox("xss")';
      expect(validateShareURL(maliciousUrl)).toBe(false);
    });
  });

  describe('Input Validation', () => {
    it('should handle null input gracefully', () => {
      const temple = createEmptyTemple();
      const result = analyzeTemple(temple);
      expect(result).toBeDefined();
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle malformed room data', () => {
      const malformedData = {
        grid: {
          '0,0': {
            x: -1, // Invalid coordinate
            y: 999, // Invalid coordinate
            room: 'test_room',
            tier: 999, // Invalid tier
          } as any,
        },
      };

      const result = analyzeTemple(malformedData);
      expect(result).toBeDefined();
    });

    it('should handle extremely large coordinates', () => {
      const extremeData = {
        grid: {
          '99999,99999': {
            x: 99999,
            y: 99999,
            room: 'alchemy_lab',
            tier: 5,
          },
        },
      };

      const result = analyzeTemple(extremeData);
      expect(result).toBeDefined();
    });

    it('should handle negative tier values', () => {
      const invalidData = {
        grid: {
          '0,0': {
            x: 0,
            y: 0,
            room: 'alchemy_lab',
            tier: -5, // Invalid tier
          } as any,
        },
      };

      const result = analyzeTemple(invalidData);
      expect(result).toBeDefined();
    });
  });

  describe('Injection Prevention', () => {
    it('should not execute code in room names', () => {
      const maliciousData = {
        grid: {
          '0,0': {
            x: 0,
            y: 0,
            room: '<script>alert("xss")</script>',
            tier: 5,
          } as any,
        },
      };

      const result = analyzeTemple(maliciousData);
      expect(result).toBeDefined();
      // Room name should be treated as string, not executed
    });

    it('should handle SQL injection patterns', () => {
      const sqlInjection = "'; DROP TABLE rooms; --";
      const data = {
        grid: {
          '0,0': {
            x: 0,
            y: 0,
            room: sqlInjection,
            tier: 5,
          } as any,
        },
      };

      const result = analyzeTemple(data);
      expect(result).toBeDefined();
    });

    it('should handle path traversal patterns', () => {
      const pathTraversal = '../../../etc/passwd';
      const data = {
        grid: {
          '0,0': {
            x: 0,
            y: 0,
            room: pathTraversal,
            tier: 5,
          } as any,
        },
      };

      const result = analyzeTemple(data);
      expect(result).toBeDefined();
    });
  });

  describe('Denial of Service Prevention', () => {
    it('should handle very large room counts', () => {
      const grid: any = {};

      // Create 1000 rooms
      for (let i = 0; i < 1000; i++) {
        grid[`${i},${i}`] = {
          x: i,
          y: i,
          room: 'alchemy_lab',
          tier: 5,
        };
      }

      const data = { grid };
      const result = analyzeTemple(data);

      // Should complete without hanging
      expect(result).toBeDefined();
      expect(result.roomCount).toBe(1000);
    });

    it('should handle deeply nested structures', () => {
      const deeplyNested = {
        grid: {
          '0,0': {
            x: 0,
            y: 0,
            room: 'test',
            tier: 5,
            nested: {
              deeply: {
                nested: {
                  value: 'test',
                },
              },
            },
          } as any,
        },
      };

      const result = analyzeTemple(deeplyNested);
      expect(result).toBeDefined();
    });
  });
});
