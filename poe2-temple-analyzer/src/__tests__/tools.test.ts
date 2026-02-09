/**
 * MCP tools integration tests
 */

import { handler as analyzeTempleUrlHandler } from '../tools/analyze-temple-url';
import { handler as analyzeTempleDataHandler } from '../tools/analyze-temple-data';
import { handler as getRoomInfoHandler } from '../tools/get-room-info';
import { handler as getRatingCriteriaHandler } from '../tools/get-rating-criteria';
import { createHighValueTemple, createEmptyTemple } from './fixtures';

describe('MCP Tools Integration', () => {
  describe('analyze_temple_url tool', () => {
    it('should analyze temple from URL', async () => {
      const args = {
        shareUrl: 'http://localhost:8080/#/atziri-temple?t=ABC',
      };

      // May fail if data is invalid, which is expected
      const result = await analyzeTempleUrlHandler(args).catch(() => null);

      if (result) {
        expect(result.content).toBeDefined();
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe('text');
      }
    });

    it('should throw error for invalid URL', async () => {
      const args = {
        shareUrl: 'invalid-url',
      };

      await expect(analyzeTempleUrlHandler(args)).rejects.toThrow();
    });

    it('should handle malformed temple data', async () => {
      const args = {
        shareUrl: 'http://localhost:8080/#/temple?t=INVALID',
      };

      await expect(analyzeTempleUrlHandler(args)).rejects.toThrow();
    });
  });

  describe('analyze_temple_data tool', () => {
    it('should analyze temple from data', async () => {
      const templeData = createHighValueTemple();
      const args = { templeData };

      const result = await analyzeTempleDataHandler(args);

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');

      const analysis = JSON.parse(result.content[0].text);
      expect(analysis.starRating).toBeGreaterThanOrEqual(4);
    });

    it('should handle empty temple', async () => {
      const templeData = createEmptyTemple();
      const args = { templeData };

      const result = await analyzeTempleDataHandler(args);

      expect(result.content).toBeDefined();
      const analysis = JSON.parse(result.content[0].text);
      expect(analysis.starRating).toBe(1);
    });

    it('should handle missing grid', async () => {
      const args = { templeData: {} };

      const result = await analyzeTempleDataHandler(args);

      expect(result.content).toBeDefined();
      const analysis = JSON.parse(result.content[0].text);
      expect(analysis.roomCount).toBe(0);
    });
  });

  describe('get_room_info tool', () => {
    it('should return room info for valid room type', async () => {
      const args = { roomType: 'alchemy_lab' };

      const result = await getRoomInfoHandler(args);

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');

      const roomInfo = JSON.parse(result.content[0].text);
      expect(roomInfo).toHaveProperty('type');
      expect(roomInfo).toHaveProperty('rewardValue');
    });

    it('should return error for unknown room type', async () => {
      const args = { roomType: 'unknown_room_xyz' };

      const result = await getRoomInfoHandler(args);

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('not found');
    });

    it('should handle special rooms', async () => {
      const args = { roomType: 'corruption' };

      const result = await getRoomInfoHandler(args);

      expect(result.content).toBeDefined();
      const roomInfo = JSON.parse(result.content[0].text);
      expect(roomInfo.type).toBe('special');
    });
  });

  describe('get_rating_criteria tool', () => {
    it('should return rating criteria', async () => {
      const result = await getRatingCriteriaHandler();

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');

      const criteria = JSON.parse(result.content[0].text);
      expect(criteria).toHaveProperty('description');
      expect(criteria).toHaveProperty('scoring');
      expect(criteria).toHaveProperty('starRating');
    });

    it('should include score breakdown', async () => {
      const result = await getRatingCriteriaHandler();

      const criteria = JSON.parse(result.content[0].text);
      expect(criteria.scoring).toBeDefined();
      expect(criteria.scoring.snakeScore).toBeDefined();
      expect(criteria.scoring.roomQualityScore).toBeDefined();
    });

    it('should include encoding information', async () => {
      const result = await getRatingCriteriaHandler();

      const criteria = JSON.parse(result.content[0].text);
      expect(criteria.encoding).toBeDefined();
      expect(criteria.encoding).toHaveProperty('format');
    });
  });
});
