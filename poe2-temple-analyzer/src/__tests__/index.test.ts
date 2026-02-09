import { analyzeTemple, decodeTempleData, extractShareData } from '../index';
import type { TempleData } from '../index';

describe('Temple Analyzer', () => {
  describe('extractShareData', () => {
    it('should extract t parameter from valid share URL', () => {
      const url = 'http://localhost:8080/#/atziri-temple?t=ABC123';
      const result = extractShareData(url);
      expect(result).toBe('ABC123');
    });

    it('should return null for invalid URL', () => {
      const url = 'http://localhost:8080/#/atziri-temple';
      const result = extractShareData(url);
      expect(result).toBeNull();
    });

    it('should return null for malformed URL', () => {
      const result = extractShareData('not-a-url');
      expect(result).toBeNull();
    });
  });

  describe('decodeTempleData', () => {
    it('should return null for empty string', () => {
      const result = decodeTempleData('');
      expect(result).toBeNull();
    });

    it('should return null for invalid encoding', () => {
      const result = decodeTempleData('!!!@@@###');
      expect(result).toBeNull();
    });
  });

  describe('analyzeTemple', () => {
    it('should calculate correct metrics for empty temple', () => {
      const templeData: TempleData = {
        grid: {},
      };

      const result = analyzeTemple(templeData);

      expect(result.roomCount).toBe(0);
      expect(result.rewardRooms).toBe(0);
      expect(result.starRating).toBe(1);
      // Empty temple gets minimum score based on algorithm
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });

    it('should calculate correct metrics for single room', () => {
      const templeData: TempleData = {
        grid: {
          '0,0': { x: 0, y: 0, room: 'entry' },
        },
      };

      const result = analyzeTemple(templeData);

      expect(result.roomCount).toBe(1);
      expect(result.rewardRooms).toBe(0);
    });

    it('should identify reward rooms correctly', () => {
      const templeData: TempleData = {
        grid: {
          '0,0': { x: 0, y: 0, room: 'entry' },
          '1,0': { x: 1, y: 0, room: 'vault', tier: 3 },
          '2,0': { x: 2, y: 0, room: 'alchemy_lab', tier: 2 },
        },
      };

      const result = analyzeTemple(templeData);

      expect(result.rewardRooms).toBe(2);
      expect(result.roomCount).toBe(3);
    });

    it('should calculate high star rating for excellent temple', () => {
      const templeData: TempleData = {
        grid: {
          '0,0': { x: 0, y: 0, room: 'entry' },
          '1,0': { x: 1, y: 0, room: 'viper_spymaster', tier: 7 },
          '2,0': { x: 2, y: 0, room: 'vault', tier: 7 },
          '3,0': { x: 3, y: 0, room: 'alchemy_lab', tier: 6 },
          '4,0': { x: 4, y: 0, room: 'flesh_surgeon', tier: 6 },
          '5,0': { x: 5, y: 0, room: 'synthflesh', tier: 6 },
          '6,0': { x: 6, y: 0, room: 'reward_currency', tier: 6 },
          '7,0': { x: 7, y: 0, room: 'thaumaturge', tier: 6 },
          '8,0': { x: 8, y: 0, room: 'smithy', tier: 6 },
        },
      };

      const result = analyzeTemple(templeData);

      expect(result.starRating).toBeGreaterThanOrEqual(4);
      expect(result.spymasters).toBe(1);
      expect(result.t7Rooms).toBe(2);
      expect(result.highTierRooms).toBeGreaterThanOrEqual(5);
    });

    it('should provide suggestions for poor layouts', () => {
      const templeData: TempleData = {
        grid: {
          '0,0': { x: 0, y: 0, room: 'entry' },
          '1,0': { x: 1, y: 0, room: 'path' },
        },
      };

      const result = analyzeTemple(templeData);

      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should handle duplicate rooms correctly', () => {
      const templeData: TempleData = {
        grid: {
          '0,0': { x: 0, y: 0, room: 'vault', tier: 3 },
          '0,1': { x: 0, y: 1, room: 'vault', tier: 3 },
        },
      };

      const result = analyzeTemple(templeData);

      expect(result.rewardRooms).toBe(2);
    });
  });
});
