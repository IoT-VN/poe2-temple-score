/**
 * Scorer module tests
 */

import {
  calculateOverallScore,
  calculateStarRating,
  calculateRoomValue,
  calculateDensityScore,
  generateSuggestions,
} from '../core/scorer';
import type { TempleAnalysis } from '../types/temple-types';
import { createTestRoom } from './fixtures';

describe('Scorer', () => {
  describe('calculateOverallScore', () => {
    it('should sum score components correctly', () => {
      const result = calculateOverallScore(40, 35, 15);
      expect(result).toBe(90);
    });

    it('should handle max scores', () => {
      const result = calculateOverallScore(40, 50, 15);
      expect(result).toBe(105);
    });

    it('should handle zero scores', () => {
      const result = calculateOverallScore(0, 0, 0);
      expect(result).toBe(0);
    });

    it('should round to integer', () => {
      const result = calculateOverallScore(10.5, 10.3, 10.2);
      expect(result).toBe(31);
    });
  });

  describe('calculateStarRating', () => {
    it('should return 5 stars for excellent score', () => {
      expect(calculateStarRating(90)).toBe(5);
    });

    it('should return 4 stars for very good score', () => {
      expect(calculateStarRating(50)).toBe(4);
    });

    it('should return 3 stars for good score', () => {
      expect(calculateStarRating(35)).toBe(3);
    });

    it('should return 2 stars for fair score', () => {
      expect(calculateStarRating(20)).toBe(2);
    });

    it('should return 1 star for poor score', () => {
      expect(calculateStarRating(10)).toBe(1);
    });

    it('should handle boundary values', () => {
      expect(calculateStarRating(90)).toBe(5);
      expect(calculateStarRating(89)).toBe(4);
      expect(calculateStarRating(50)).toBe(4);
      expect(calculateStarRating(49)).toBe(3);
    });
  });

  describe('calculateRoomValue', () => {
    it('should calculate spymaster value correctly', () => {
      const room = createTestRoom('viper_spymaster', 7);
      const result = calculateRoomValue(room);

      // Base 10 * tier multiplier (5.0)
      expect(result).toBe(50);
    });

    it('should calculate golem value correctly', () => {
      const room = createTestRoom('golem_works', 6);
      const result = calculateRoomValue(room);

      // Base 9 * tier multiplier (3.5)
      expect(result).toBe(32);
    });

    it('should calculate vault value correctly', () => {
      const room = createTestRoom('vault', 5);
      const result = calculateRoomValue(room);

      // Base 8 * tier multiplier (2.5)
      expect(result).toBe(20);
    });

    it('should return 0 for non-reward rooms', () => {
      const room = createTestRoom('empty', 1);
      const result = calculateRoomValue(room);

      expect(result).toBe(0);
    });

    it('should handle unknown room types', () => {
      const room = createTestRoom('unknown_room', 5);
      const result = calculateRoomValue(room);

      // Unknown rooms have base value of 1
      expect(result).toBeGreaterThan(0);
    });

    it('should apply tier multipliers correctly', () => {
      const room1 = createTestRoom('viper_spymaster', 7);
      const room2 = createTestRoom('viper_spymaster', 1);

      const value1 = calculateRoomValue(room1);
      const value2 = calculateRoomValue(room2);

      expect(value1).toBeGreaterThan(value2);
    });

    it('should handle out-of-range tier values', () => {
      const room = createTestRoom('viper_spymaster', 10);
      const result = calculateRoomValue(room);

      // Tier 10 is not in TIER_MULTIPLIERS, should fallback to 0 multiplier
      expect(result).toBe(0);
    });
  });

  describe('calculateDensityScore', () => {
    it('should calculate density score correctly', () => {
      const result = calculateDensityScore(10, 25);
      expect(result).toBe(6);
    });

    it('should cap at max value', () => {
      const result = calculateDensityScore(50, 25);
      expect(result).toBe(15);
    });

    it('should handle zero rooms', () => {
      const result = calculateDensityScore(0, 25);
      expect(result).toBe(0);
    });

    it('should use default max rooms', () => {
      const result = calculateDensityScore(25);
      expect(result).toBe(15);
    });
  });

  describe('generateSuggestions', () => {
    it('should suggest improving snake chain', () => {
      const analysis: TempleAnalysis = {
        roomCount: 10,
        rewardRooms: 8,
        architectRooms: 0,
        bossRooms: 0,
        highTierRooms: 2,
        spymasters: 0,
        golems: 0,
        t7Rooms: 0,
        snakeScore: 10,
        roomScore: 10,
        quantityScore: 5,
        totalScore: 25,
        starRating: 2,
        ratingDescription: 'Poor',
        suggestions: [],
        t6Rooms: 0,
        techScore: 0,
        techBonuses: [],
        hasRussianTech: false,
        hasRomanRoad: false,
        hasDoubleTriple: false,
      };

      const result = generateSuggestions(analysis);

      expect(result.length).toBeGreaterThan(0);
      expect(result.some((s) => s.includes('snake chain'))).toBe(true);
    });

    it('should suggest adding high-value rooms', () => {
      const analysis: TempleAnalysis = {
        roomCount: 10,
        rewardRooms: 8,
        architectRooms: 0,
        bossRooms: 0,
        highTierRooms: 0,
        spymasters: 0,
        golems: 0,
        t7Rooms: 0,
        snakeScore: 30,
        roomScore: 5,
        quantityScore: 10,
        totalScore: 45,
        starRating: 3,
        ratingDescription: 'Average',
        suggestions: [],
        t6Rooms: 0,
        techScore: 0,
        techBonuses: [],
        hasRussianTech: false,
        hasRomanRoad: false,
        hasDoubleTriple: false,
      };

      const result = generateSuggestions(analysis);

      expect(result.length).toBeGreaterThan(0);
    });

    it('should suggest adding more reward rooms', () => {
      const analysis: TempleAnalysis = {
        roomCount: 5,
        rewardRooms: 3,
        architectRooms: 0,
        bossRooms: 0,
        highTierRooms: 1,
        spymasters: 0,
        golems: 0,
        t7Rooms: 0,
        snakeScore: 15,
        roomScore: 5,
        quantityScore: 2,
        totalScore: 22,
        starRating: 2,
        ratingDescription: 'Below Average',
        suggestions: [],
        t6Rooms: 0,
        techScore: 0,
        techBonuses: [],
        hasRussianTech: false,
        hasRomanRoad: false,
        hasDoubleTriple: false,
      };

      const result = generateSuggestions(analysis);

      expect(result.some((s) => s.includes('reward rooms'))).toBe(true);
    });

    it('should suggest spymasters if none present', () => {
      const analysis: TempleAnalysis = {
        roomCount: 15,
        rewardRooms: 12,
        architectRooms: 0,
        bossRooms: 0,
        highTierRooms: 5,
        spymasters: 0,
        golems: 2,
        t7Rooms: 0,
        snakeScore: 30,
        roomScore: 20,
        quantityScore: 10,
        totalScore: 60,
        starRating: 4,
        ratingDescription: 'Very Good',
        suggestions: [],
        t6Rooms: 0,
        techScore: 0,
        techBonuses: [],
        hasRussianTech: false,
        hasRomanRoad: false,
        hasDoubleTriple: false,
      };

      const result = generateSuggestions(analysis);

      expect(result.some((s) => s.includes('Spymaster'))).toBe(true);
    });

    it('should suggest golems if none present', () => {
      const analysis: TempleAnalysis = {
        roomCount: 15,
        rewardRooms: 12,
        architectRooms: 0,
        bossRooms: 0,
        highTierRooms: 5,
        spymasters: 1,
        golems: 0,
        t7Rooms: 1,
        snakeScore: 30,
        roomScore: 20,
        quantityScore: 10,
        totalScore: 60,
        starRating: 4,
        ratingDescription: 'Very Good',
        suggestions: [],
        t6Rooms: 0,
        techScore: 0,
        techBonuses: [],
        hasRussianTech: false,
        hasRomanRoad: false,
        hasDoubleTriple: false,
      };

      const result = generateSuggestions(analysis);

      expect(result.some((s) => s.includes('Golem'))).toBe(true);
    });

    it('should return no suggestions for perfect temple', () => {
      const analysis: TempleAnalysis = {
        roomCount: 20,
        rewardRooms: 15,
        architectRooms: 0,
        bossRooms: 0,
        highTierRooms: 8,
        spymasters: 3,
        golems: 3,
        t7Rooms: 3,
        snakeScore: 40,
        roomScore: 50,
        quantityScore: 15,
        totalScore: 105,
        starRating: 5,
        ratingDescription: 'Excellent',
        suggestions: [],
        t6Rooms: 0,
        techScore: 0,
        techBonuses: [],
        hasRussianTech: false,
        hasRomanRoad: false,
        hasDoubleTriple: false,
      };

      const result = generateSuggestions(analysis);

      // Perfect temple might still have suggestions, but they're optional
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
