/**
 * Analyzer module tests
 */

import {
  analyzeTemple,
  filterRewardRooms,
  countRoomsByTier,
} from '../core/analyzer';
import type { Room } from '../types/temple-types';
import {
  createEmptyTemple,
  createSingleRoomTemple,
  createMultiRoomTemple,
  createHighValueTemple,
  createPoorTemple,
  createTempleWithDuplicates,
  createCompleteTemple,
  createTestRoom,
} from './fixtures';

describe('Analyzer', () => {
  describe('analyzeTemple', () => {
    it('should calculate correct metrics for empty temple', () => {
      const templeData = createEmptyTemple();
      const result = analyzeTemple(templeData);

      expect(result.roomCount).toBe(0);
      expect(result.rewardRooms).toBe(0);
      expect(result.starRating).toBe(1);
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });

    it('should calculate metrics for single room', () => {
      const templeData = createSingleRoomTemple();
      const result = analyzeTemple(templeData);

      expect(result.roomCount).toBe(1);
      expect(result.rewardRooms).toBe(1);
      expect(result.starRating).toBeGreaterThan(0);
    });

    it('should identify reward rooms correctly', () => {
      const templeData = createCompleteTemple();
      const result = analyzeTemple(templeData);

      expect(result.rewardRooms).toBeGreaterThan(0);
      expect(result.architectRooms).toBe(0);
    });

    it('should calculate high star rating for excellent temple', () => {
      const templeData = createHighValueTemple();
      const result = analyzeTemple(templeData);

      expect(result.starRating).toBeGreaterThanOrEqual(4);
      expect(result.spymasters).toBe(3);
      expect(result.golems).toBe(3);
    });

    it('should provide suggestions for poor layouts', () => {
      const templeData = createPoorTemple();
      const result = analyzeTemple(templeData);

      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should handle duplicate rooms correctly', () => {
      const templeData = createTempleWithDuplicates();
      const result = analyzeTemple(templeData);

      // Duplicates should be filtered
      expect(result.rewardRooms).toBeLessThanOrEqual(2);
    });

    it('should calculate T7 room count correctly', () => {
      const templeData = createHighValueTemple();
      const result = analyzeTemple(templeData);

      expect(result.t7Rooms).toBe(3);
    });

    it('should calculate high tier rooms correctly', () => {
      const templeData = createHighValueTemple();
      const result = analyzeTemple(templeData);

      expect(result.highTierRooms).toBeGreaterThanOrEqual(3);
    });

    it('should calculate snake score', () => {
      const templeData = createMultiRoomTemple();
      const result = analyzeTemple(templeData);

      expect(result.snakeScore).toBeGreaterThan(0);
      expect(result.snakeScore).toBeLessThanOrEqual(40);
    });

    it('should calculate room score', () => {
      const templeData = createHighValueTemple();
      const result = analyzeTemple(templeData);

      expect(result.roomScore).toBeGreaterThan(0);
    });

    it('should calculate quantity score', () => {
      const templeData = createMultiRoomTemple();
      const result = analyzeTemple(templeData);

      expect(result.quantityScore).toBeGreaterThan(0);
      expect(result.quantityScore).toBeLessThanOrEqual(15);
    });

    it('should include decodedRooms in result', () => {
      const templeData = {
        grid: {},
        decodedRooms: [createTestRoom('alchemy_lab', 5)],
      };

      const result = analyzeTemple(templeData);

      expect(result.decodedRooms).toBeDefined();
      expect(result.decodedRooms).toHaveLength(1);
    });

    it('should generate appropriate suggestions', () => {
      const templeData = createPoorTemple();
      const result = analyzeTemple(templeData);

      // Poor temple should have suggestions
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should handle temples with no reward rooms', () => {
      const templeData = {
        grid: {
          '0,0': { x: 0, y: 0, room: 'empty', tier: 1 },
          '1,1': { x: 1, y: 1, room: 'path', tier: 1 },
        },
      };

      const result = analyzeTemple(templeData);

      expect(result.rewardRooms).toBe(0);
      expect(result.starRating).toBe(1);
    });

    it('should handle boss rooms', () => {
      const templeData = {
        grid: {
          '0,0': { x: 0, y: 0, room: 'boss', tier: 7 },
          '1,0': { x: 1, y: 0, room: 'atziri', tier: 7 },
        },
      };

      const result = analyzeTemple(templeData);

      expect(result.bossRooms).toBe(2);
    });
  });

  describe('filterRewardRooms', () => {
    it('should filter out empty rooms', () => {
      const rooms: Room[] = [
        createTestRoom('empty', 1),
        createTestRoom('alchemy_lab', 5),
      ];

      const result = filterRewardRooms(rooms);

      expect(result).toHaveLength(1);
      expect(result[0].room).toBe('alchemy_lab');
    });

    it('should filter out path rooms', () => {
      const rooms: Room[] = [
        createTestRoom('path', 1),
        createTestRoom('vault', 6),
      ];

      const result = filterRewardRooms(rooms);

      expect(result).toHaveLength(1);
      expect(result[0].room).toBe('vault');
    });

    it('should remove duplicate rooms', () => {
      const rooms: Room[] = [
        createTestRoom('alchemy_lab', 5, 0, 0),
        createTestRoom('alchemy_lab', 5, 0, 0),
        createTestRoom('alchemy_lab', 5, 1, 0),
      ];

      const result = filterRewardRooms(rooms);

      // First two are duplicates, should only have 2
      expect(result).toHaveLength(2);
    });

    it('should include all reward room types', () => {
      const rooms: Room[] = [
        createTestRoom('viper_spymaster', 7),
        createTestRoom('golem_works', 6),
        createTestRoom('vault', 6),
        createTestRoom('alchemy_lab', 5),
      ];

      const result = filterRewardRooms(rooms);

      expect(result).toHaveLength(4);
    });
  });

  describe('countRoomsByTier', () => {
    it('should count rooms by tier correctly', () => {
      const rooms: Room[] = [
        createTestRoom('alchemy_lab', 7),
        createTestRoom('alchemy_lab', 7),
        createTestRoom('vault', 6),
        createTestRoom('golem_works', 5),
      ];

      const result = countRoomsByTier(rooms);

      expect(result[7]).toBe(2);
      expect(result[6]).toBe(1);
      expect(result[5]).toBe(1);
    });

    it('should handle rooms without tier', () => {
      const rooms: Room[] = [
        createTestRoom('empty', 0),
        { x: 0, y: 0, room: 'test' } as Room,
      ];

      const result = countRoomsByTier(rooms);

      expect(result[0]).toBeDefined();
    });

    it('should return empty object for no rooms', () => {
      const result = countRoomsByTier([]);

      expect(Object.keys(result)).toHaveLength(0);
    });
  });
});
