/**
 * Tech detector tests
 */

import { analyzeTechPatterns } from '../core/tech-detector';
import type { TempleData } from '../types/temple-types';

describe('Tech Detector', () => {
  describe('analyzeTechPatterns', () => {
    it('should handle empty temple', () => {
      const templeData: TempleData = { grid: {} };
      const result = analyzeTechPatterns(templeData);

      expect(result.totalTechScore).toBe(0);
      expect(result.hasRussianTech).toBe(false);
      expect(result.hasRomanRoad).toBe(false);
      expect(result.hasDoubleTriple).toBe(false);
      expect(result.bonuses).toHaveLength(3);
    });

    it('should detect Russian Tech with 3+ T7 rooms', () => {
      const templeData: TempleData = {
        grid: {
          '0,0': { x: 0, y: 0, room: 'viper_spymaster', tier: 7 },
          '1,0': { x: 1, y: 0, room: 'golem_works', tier: 7 },
          '1,1': { x: 1, y: 1, room: 'vault', tier: 7 },
        },
      };

      const result = analyzeTechPatterns(templeData);

      expect(result.hasRussianTech).toBe(true);
      expect(result.totalTechScore).toBe(150);
      expect(result.bonuses[0].detected).toBe(true);
    });

    it('should not detect Russian Tech with less than 3 T7 rooms', () => {
      const templeData: TempleData = {
        grid: {
          '0,0': { x: 0, y: 0, room: 'viper_spymaster', tier: 7 },
          '2,2': { x: 2, y: 2, room: 'golem_works', tier: 7 },
        },
      };

      const result = analyzeTechPatterns(templeData);

      expect(result.hasRussianTech).toBe(false);
    });

    it('should detect Roman Road with 4+ high-tier rooms in line', () => {
      const templeData: TempleData = {
        grid: {
          '0,0': { x: 0, y: 0, room: 'viper_spymaster', tier: 6 },
          '0,1': { x: 0, y: 1, room: 'golem_works', tier: 6 },
          '0,2': { x: 0, y: 2, room: 'viper_spymaster', tier: 6 },
          '0,3': { x: 0, y: 3, room: 'golem_works', tier: 6 },
        },
      };

      const result = analyzeTechPatterns(templeData);

      expect(result.hasRomanRoad).toBe(true);
      expect(result.totalTechScore).toBe(100);
    });

    it('should detect Double Triple with multiple T6+ clusters', () => {
      const templeData: TempleData = {
        grid: {
          // First triple
          '0,0': { x: 0, y: 0, room: 'viper_spymaster', tier: 6 },
          '1,0': { x: 1, y: 0, room: 'golem_works', tier: 6 },
          '1,1': { x: 1, y: 1, room: 'vault', tier: 6 },
          // Second triple
          '5,5': { x: 5, y: 5, room: 'viper_spymaster', tier: 6 },
          '6,5': { x: 6, y: 5, room: 'golem_works', tier: 6 },
          '6,6': { x: 6, y: 6, room: 'vault', tier: 6 },
        },
      };

      const result = analyzeTechPatterns(templeData);

      expect(result.hasDoubleTriple).toBe(true);
      expect(result.totalTechScore).toBeGreaterThanOrEqual(120);
    });

    it('should calculate combined tech score correctly', () => {
      const templeData: TempleData = {
        grid: {
          // Russian Tech setup
          '0,0': { x: 0, y: 0, room: 'viper_spymaster', tier: 7 },
          '1,0': { x: 1, y: 0, room: 'golem_works', tier: 7 },
          '1,1': { x: 1, y: 1, room: 'vault', tier: 7 },
        },
      };

      const result = analyzeTechPatterns(templeData);

      // Should have Russian Tech (150) but not others
      expect(result.totalTechScore).toBe(150);
      expect(result.hasRussianTech).toBe(true);
      expect(result.hasRomanRoad).toBe(false);
      expect(result.hasDoubleTriple).toBe(false);
    });

    it('should return all bonus types in analysis', () => {
      const templeData: TempleData = {
        grid: {
          '0,0': { x: 0, y: 0, room: 'alchemy_lab', tier: 5 },
        },
      };

      const result = analyzeTechPatterns(templeData);

      expect(result.bonuses).toHaveLength(3);
      expect(result.bonuses[0].type).toBe('russian_tech');
      expect(result.bonuses[1].type).toBe('roman_road');
      expect(result.bonuses[2].type).toBe('double_triple');
    });
  });
});
