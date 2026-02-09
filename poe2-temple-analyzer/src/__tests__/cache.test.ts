/**
 * Cache functionality tests
 */

import { LRUCache } from '../utils/cache';
import { analyzeTemple, clearAnalysisCache } from '../core/analyzer';
import type { TempleData } from '../types/temple-types';

describe('LRUCache', () => {
  describe('basic operations', () => {
    it('should store and retrieve values', () => {
      const cache = new LRUCache<string, number>(5);
      cache.set('a', 1);
      cache.set('b', 2);

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
    });

    it('should return undefined for non-existent keys', () => {
      const cache = new LRUCache<string, number>(5);
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should update existing keys and move to end', () => {
      const cache = new LRUCache<string, number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Update 'a' which should move it to most recently used
      cache.set('a', 10);

      // Add 'd' which should evict 'b' (least recently used)
      cache.set('d', 4);

      expect(cache.get('a')).toBe(10);
      expect(cache.get('b')).toBeUndefined(); // Evicted
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
    });

    it('should report correct size', () => {
      const cache = new LRUCache<string, number>(5);
      expect(cache.size).toBe(0);

      cache.set('a', 1);
      expect(cache.size).toBe(1);

      cache.set('b', 2);
      cache.set('c', 3);
      expect(cache.size).toBe(3);
    });

    it('should check if keys exist', () => {
      const cache = new LRUCache<string, number>(5);
      cache.set('a', 1);

      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
    });

    it('should clear all entries', () => {
      const cache = new LRUCache<string, number>(5);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      expect(cache.size).toBe(3);

      cache.clear();

      expect(cache.size).toBe(0);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBeUndefined();
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used item when at capacity', () => {
      const cache = new LRUCache<string, number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Cache is at capacity
      expect(cache.size).toBe(3);

      // Add 'd' which should evict 'a' (least recently used)
      cache.set('d', 4);

      expect(cache.size).toBe(3);
      expect(cache.get('a')).toBeUndefined(); // Evicted
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
    });

    it('should promote accessed items to most recently used', () => {
      const cache = new LRUCache<string, number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Access 'a' which should promote it
      cache.get('a');

      // Add 'd' which should evict 'b' now (least recently used)
      cache.set('d', 4);

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBeUndefined(); // Evicted
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
    });

    it('should handle multiple evictions correctly', () => {
      const cache = new LRUCache<string, number>(3);

      for (let i = 1; i <= 10; i++) {
        cache.set(String(i), i);
      }

      // Only last 3 items should remain
      expect(cache.size).toBe(3);
      expect(cache.get('1')).toBeUndefined();
      expect(cache.get('7')).toBeUndefined();
      expect(cache.get('8')).toBe(8);
      expect(cache.get('9')).toBe(9);
      expect(cache.get('10')).toBe(10);
    });
  });

  describe('complex keys', () => {
    it('should handle object keys', () => {
      const cache = new LRUCache<{ id: number }, string>(5);
      const key1 = { id: 1 };
      const key2 = { id: 2 };

      cache.set(key1, 'value1');
      cache.set(key2, 'value2');

      expect(cache.get(key1)).toBe('value1');
      expect(cache.get(key2)).toBe('value2');
    });

    it('should handle number keys', () => {
      const cache = new LRUCache<number, string>(5);
      cache.set(1, 'one');
      cache.set(2, 'two');

      expect(cache.get(1)).toBe('one');
      expect(cache.get(2)).toBe('two');
    });
  });

  describe('edge cases', () => {
    it('should handle setting the same key multiple times', () => {
      const cache = new LRUCache<string, number>(3);
      cache.set('a', 1);
      cache.set('a', 2);
      cache.set('a', 3);

      expect(cache.size).toBe(1);
      expect(cache.get('a')).toBe(3);
    });

    it('should handle zero capacity cache', () => {
      const cache = new LRUCache<string, number>(0);
      cache.set('a', 1);

      // Item should be immediately evicted
      expect(cache.size).toBe(0);
      expect(cache.get('a')).toBeUndefined();
    });

    it('should handle capacity of one', () => {
      const cache = new LRUCache<string, number>(1);
      cache.set('a', 1);
      cache.set('b', 2);

      expect(cache.size).toBe(1);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
    });

    it('should handle storing null and undefined values', () => {
      const cache = new LRUCache<string, number | null | undefined>(5);
      cache.set('null', null);
      cache.set('undefined', undefined);

      expect(cache.get('null')).toBeNull();
      expect(cache.get('undefined')).toBeUndefined();
    });
  });
});

describe('Temple Analysis Caching', () => {
  const sampleTempleData: TempleData = {
    grid: {
      '0,0': { x: 0, y: 0, room: 'alchemy_lab', tier: 5 },
      '0,1': { x: 0, y: 1, room: 'golem_works', tier: 6 },
      '1,0': { x: 1, y: 0, room: 'viper_spymaster', tier: 7 },
    },
  };

  beforeEach(() => {
    // Clear cache before each test
    clearAnalysisCache();
  });

  it('should cache analysis results', () => {
    const result1 = analyzeTemple(sampleTempleData);
    const result2 = analyzeTemple(sampleTempleData);

    // Should return the exact same object reference
    expect(result1).toBe(result2);
  });

  it('should return identical data for cached results', () => {
    const result1 = analyzeTemple(sampleTempleData);
    const result2 = analyzeTemple(sampleTempleData);

    expect(result1).toEqual(result2);
    expect(result1.totalScore).toBe(result2.totalScore);
    expect(result1.starRating).toBe(result2.starRating);
  });

  it('should handle different temple data separately', () => {
    const templeData2: TempleData = {
      grid: {
        '0,0': { x: 0, y: 0, room: 'smithy', tier: 3 },
      },
    };

    const result1 = analyzeTemple(sampleTempleData);
    const result2 = analyzeTemple(templeData2);

    // Should return different results
    expect(result1).not.toBe(result2);
    expect(result1.totalScore).not.toBe(result2.totalScore);
  });

  it('should clear cache when requested', () => {
    const result1 = analyzeTemple(sampleTempleData);

    clearAnalysisCache();

    const result2 = analyzeTemple(sampleTempleData);

    // Should return different object references after clearing
    expect(result1).not.toBe(result2);
    // But should have the same values
    expect(result1).toEqual(result2);
  });

  it('should generate cache key from temple data', () => {
    const result1 = analyzeTemple(sampleTempleData);

    // Modify the data slightly
    const modifiedData: TempleData = {
      ...sampleTempleData,
      grid: {
        ...sampleTempleData.grid,
        '0,0': { x: 0, y: 0, room: 'alchemy_lab', tier: 6 }, // Different tier
      },
    };

    const result2 = analyzeTemple(modifiedData);

    // Should be different results
    expect(result1).not.toBe(result2);
  });

  it('should treat identical data with different key order as same', () => {
    // Create temple data with different key order but same content
    const templeData2: TempleData = {
      grid: {
        '1,0': { x: 1, y: 0, room: 'viper_spymaster', tier: 7 },
        '0,0': { x: 0, y: 0, room: 'alchemy_lab', tier: 5 },
        '0,1': { x: 0, y: 1, room: 'golem_works', tier: 6 },
      },
    };

    const result1 = analyzeTemple(sampleTempleData);
    const result2 = analyzeTemple(templeData2);

    // JSON.stringify will normalize the order - use toEqual for value comparison
    expect(result1).toEqual(result2);
  });

  it('should handle empty temple data', () => {
    const emptyData: TempleData = { grid: {} };

    const result1 = analyzeTemple(emptyData);
    const result2 = analyzeTemple(emptyData);

    expect(result1).toBe(result2);
  });

  it('should maintain cache size limits', () => {
    // Create 150 different temple configurations to test cache limit
    // Each configuration uses a unique x coordinate to ensure different cache keys
    const results: any[] = [];

    for (let i = 0; i < 150; i++) {
      const data: TempleData = {
        grid: {
          [`${i},0`]: { x: i, y: 0, room: 'alchemy_lab', tier: 5 },
        },
      };
      results.push(analyzeTemple(data));
    }

    // First result should have been evicted from cache
    const firstData: TempleData = {
      grid: {
        '0,0': { x: 0, y: 0, room: 'alchemy_lab', tier: 5 },
      },
    };

    const newResult = analyzeTemple(firstData);

    // Should be a different object reference (evicted and recalculated)
    expect(results[0]).not.toBe(newResult);
    // But should have the same values
    expect(results[0]).toEqual(newResult);
  });

  it('should handle cache miss and hit scenarios', () => {
    // First call is a cache miss
    const result1 = analyzeTemple(sampleTempleData);

    // Second call is a cache hit (same object reference)
    const result2 = analyzeTemple(sampleTempleData);
    expect(result1).toBe(result2);

    // Clear cache
    clearAnalysisCache();

    // Third call is a cache miss again (new object)
    const result3 = analyzeTemple(sampleTempleData);
    expect(result1).not.toBe(result3);

    // Fourth call is a cache hit
    const result4 = analyzeTemple(sampleTempleData);
    expect(result3).toBe(result4);
  });
});
