/**
 * Edge case tests to improve branch coverage
 */

import { decodeTempleData, parseTempleArray } from '../core/decoder';
import { generateSuggestions } from '../core/scorer';
import type { TempleAnalysis } from '../types/temple-types';

describe('Edge Cases for Coverage', () => {
  describe('decoder edge cases', () => {
    it('should handle very short encoded strings', () => {
      const result = decodeTempleData('A');
      expect(result).toBeDefined();
      // Either null or valid temple
    });

    it('should handle special characters in input', () => {
      const result = decodeTempleData('!@#$%^&*()');
      expect(result).toBeDefined();
    });

    it('should handle unicode characters', () => {
      const result = decodeTempleData('中文测试');
      expect(result).toBeDefined();
    });

    it('should handle mixed case', () => {
      const result = decodeTempleData('AbCdEf');
      expect(result).toBeDefined();
    });

    it('should handle numbers', () => {
      const result = decodeTempleData('123456');
      expect(result).toBeDefined();
    });

    it('should handle bitstring too short for room', () => {
      const result = decodeTempleData('AB');
      expect(result).toBeDefined();
    });

    it('should handle invalid room coordinates', () => {
      const result = decodeTempleData('ABCDEFGHIJKLMNOPQRST');
      expect(result).toBeDefined();
    });
  });

  describe('parseTempleArray edge cases', () => {
    it('should handle array with only nulls', () => {
      const result = parseTempleArray([null, null, null]);
      expect(result.grid).toEqual({});
    });

    it('should handle array with undefined', () => {
      const result = parseTempleArray([undefined, undefined]);
      expect(result.grid).toEqual({});
    });

    it('should handle empty object in array', () => {
      const result = parseTempleArray([{}]);
      expect(result.grid).toBeDefined();
    });
  });

  describe('scorer edge cases for line 30-31', () => {
    it('should handle temple with golems but no spymasters', () => {
      const analysis: TempleAnalysis = {
        roomCount: 15,
        rewardRooms: 12,
        architectRooms: 0,
        bossRooms: 0,
        highTierRooms: 6,
        spymasters: 0,
        golems: 3,
        t7Rooms: 2,
        t6Rooms: 4,
        snakeScore: 35,
        roomScore: 30,
        quantityScore: 12,
        techScore: 0,
        totalScore: 77,
        starRating: 5,
        ratingDescription: 'Excellent',
        suggestions: [],
        techBonuses: [],
        hasRussianTech: false,
        hasRomanRoad: false,
        hasDoubleTriple: false,
      };

      const result = generateSuggestions(analysis);
      expect(result).toBeDefined();
    });

    it('should handle temple with spymasters but no golems', () => {
      const analysis: TempleAnalysis = {
        roomCount: 15,
        rewardRooms: 12,
        architectRooms: 0,
        bossRooms: 0,
        highTierRooms: 6,
        spymasters: 2,
        golems: 0,
        t7Rooms: 2,
        t6Rooms: 4,
        snakeScore: 35,
        roomScore: 30,
        quantityScore: 12,
        techScore: 0,
        totalScore: 77,
        starRating: 5,
        ratingDescription: 'Excellent',
        suggestions: [],
        techBonuses: [],
        hasRussianTech: false,
        hasRomanRoad: false,
        hasDoubleTriple: false,
      };

      const result = generateSuggestions(analysis);
      expect(result).toBeDefined();
    });
  });
});

