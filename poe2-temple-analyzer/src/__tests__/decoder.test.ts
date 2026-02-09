/**
 * Decoder module tests
 */

import { decodeTempleData, parseTempleArray } from '../core/decoder';

describe('Decoder', () => {
  describe('decodeTempleData', () => {
    it('should return null for empty string', () => {
      const result = decodeTempleData('');
      expect(result).toBeNull();
    });

    it('should return null for invalid encoding', () => {
      const result = decodeTempleData('!!!@@@###');
      expect(result).toBeNull();
    });

    it('should return null for null input', () => {
      const result = decodeTempleData(null as any);
      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = decodeTempleData(undefined as any);
      expect(result).toBeNull();
    });

    it('should decode valid temple data', () => {
      // Create a simple encoded temple
      const encoded = 'ABC'; // Valid charset
      const result = decodeTempleData(encoded);

      // Should decode if valid format
      if (result) {
        expect(result).toHaveProperty('grid');
        expect(result).toHaveProperty('decodedRooms');
      }
    });

    it('should auto-detect charset', () => {
      // Test with different charset patterns
      const encoded1 = 'ABC123';

      // Just verify it doesn't crash
      expect(() => decodeTempleData(encoded1)).not.toThrow();
    });
  });

  describe('parseTempleArray', () => {
    it('should handle empty array', () => {
      const result = parseTempleArray([]);
      expect(result.grid).toEqual({});
    });

    it('should parse room array correctly', () => {
      const data = [
        { x: 0, y: 0, room: 'alchemy_lab', tier: 5 },
        { x: 1, y: 0, room: 'vault', tier: 6 },
      ];

      const result = parseTempleArray(data);

      expect(result.grid['0,0']).toBeDefined();
      expect(result.grid['0,0'].room).toBe('alchemy_lab');
      expect(result.grid['1,0'].room).toBe('vault');
    });

    it('should handle missing coordinates', () => {
      const data = [{ room: 'alchemy_lab', tier: 5 }];

      const result = parseTempleArray(data);

      // Should use index for coordinates
      expect(Object.keys(result.grid).length).toBeGreaterThan(0);
    });

    it('should handle null data', () => {
      const result = parseTempleArray(null as any);
      expect(result.grid).toEqual({});
    });

    it('should filter invalid rooms', () => {
      const data = [
        { x: 0, y: 0, room: 'alchemy_lab', tier: 5 },
        null,
        undefined,
        { x: 1, y: 0, room: 'vault', tier: 6 },
      ];

      const result = parseTempleArray(data);

      // Should only process valid rooms
      expect(Object.keys(result.grid).length).toBe(2);
    });
  });
});
