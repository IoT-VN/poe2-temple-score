/**
 * Temple analysis functionality
 */

import type { TempleData, TempleAnalysis, Room } from '../types/temple-types';
import { LRUCache } from '../utils/cache';
import { analyzeTechPatterns } from './tech-detector';

/**
 * Room rarity for snake scoring
 */
const ROOM_RARITY: { [key: string]: number } = {
  viper_spymaster: 10,
  golem_works: 9,
  viper_legion_barracks: 8,
  transcendent_barracks: 7,
  vault: 6,
  reward_currency: 5,
  reward_room: 5,
  alchemy_lab: 4,
  flesh_surgeon: 4,
  synthflesh: 4,
  thaumaturge: 3,
  smithy: 3,
  armoury: 2,
  generator: 2,
  garrison: 2,
};

// Create cache instance (100 temples)
const analysisCache = new LRUCache<string, TempleAnalysis>(100);

/**
 * Clear the analysis cache
 */
export function clearAnalysisCache(): void {
  analysisCache.clear();
}

/**
 * Filter unique reward rooms from grid
 *
 * Removes empty/path rooms and duplicates based on coordinates
 *
 * @param rooms - Array of rooms to filter
 * @returns Array of unique reward rooms
 *
 * @example
 * ```ts
 * const rooms = [{ x: 0, y: 0, room: 'alchemy_lab', tier: 5 }];
 * const rewards = filterRewardRooms(rooms);
 * // Returns: [{ x: 0, y: 0, room: 'alchemy_lab', tier: 5 }]
 * ```
 */
export function filterRewardRooms(rooms: Room[]): Room[] {
  const rewardRooms: Room[] = [];
  const seenRooms = new Set<string>();

  rooms.forEach((room) => {
    if (room.room === 'empty' || room.room === 'path') return;

    const key = `${room.y},${room.x},${room.room}`;
    if (seenRooms.has(key)) return;
    seenRooms.add(key);

    if (ROOM_RARITY[room.room] > 0) {
      rewardRooms.push(room);
    }
  });

  return rewardRooms;
}

/**
 * Find the best connected snake chain
 */
function findBestChain(rooms: Room[]): Room[] {
  let bestChain: Room[] = [];
  const visited = new Set<string>();

  rooms.forEach((startRoom) => {
    const key = `${startRoom.y},${startRoom.x}`;
    if (visited.has(key)) return;

    const chain: Room[] = [startRoom];
    visited.add(key);
    let current = startRoom;

    // Extend chain forward
    let extending = true;
    while (extending) {
      let bestNext: Room | null = null;
      let bestDist = 999;

      rooms.forEach((r) => {
        if (chain.includes(r)) return;
        const dist = Math.abs(current.x - r.x) + Math.abs(current.y - r.y);
        if (dist <= 1 && dist < bestDist) {
          bestDist = dist;
          bestNext = r;
        }
      });

      if (!bestNext) {
        extending = false;
        break;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { x, y } = bestNext;
      chain.push(bestNext);
      visited.add(`${y},${x}`);
      current = bestNext;
    }

    if (chain.length > bestChain.length) bestChain = chain;
  });

  return bestChain;
}

/**
 * Calculate snake score based on chain length
 */
function calculateSnakeScore(chainLength: number): number {
  if (chainLength >= 8) return 40;
  if (chainLength >= 6) return 35;
  if (chainLength >= 5) return 30;
  if (chainLength >= 4) return 25;
  if (chainLength >= 3) return 15;
  if (chainLength >= 2) return 6;
  return 2;
}

/**
 * Calculate room quality score
 */
function calculateRoomScore(rewardRooms: Room[]): { score: number; metrics: RoomMetrics } {
  const spymasters = rewardRooms.filter((r) => r.room === 'viper_spymaster').length;
  const golems = rewardRooms.filter((r) => r.room === 'golem_works').length;
  const t7Rooms = rewardRooms.filter((r) => (r.tier || 0) >= 7).length;
  const t6Rooms = rewardRooms.filter((r) => (r.tier || 0) === 6).length;

  let roomScore = 0;
  roomScore += spymasters * 10;
  roomScore += golems * 8;
  roomScore += t7Rooms * 30;
  roomScore += Math.min(15, t6Rooms * 3);

  // Bonus for MANY T6+ rooms
  const highTierCount = rewardRooms.filter((r) => (r.tier || 0) >= 6).length;
  if (highTierCount >= 5) roomScore += 10;

  return {
    score: roomScore,
    metrics: {
      spymasters,
      golems,
      t7Rooms,
      t6Rooms,
      highTierRooms: highTierCount,
    },
  };
}

interface RoomMetrics {
  spymasters: number;
  golems: number;
  t7Rooms: number;
  t6Rooms: number;
  highTierRooms: number;
}

/**
 * Calculate star rating and description
 */
function calculateStarRating(totalScore: number): { rating: number; description: string } {
  if (totalScore >= 90) {
    return { rating: 5, description: 'God Tier - Exceptional temple with outstanding quality' };
  }
  if (totalScore >= 75) {
    return { rating: 4.5, description: 'Excellent - Very strong layout with high-value rooms' };
  }
  if (totalScore >= 50) {
    return { rating: 4, description: 'Very Good - Strong snake chain and good rewards' };
  }
  if (totalScore >= 40) {
    return { rating: 3.5, description: 'Good - Decent snake chain with valuable rooms' };
  }
  if (totalScore >= 25) {
    return { rating: 3, description: 'Average - Basic optimization with some value' };
  }
  if (totalScore >= 18) {
    return { rating: 2, description: 'Below Average - Weak snake chain, limited rewards' };
  }
  return { rating: 1, description: 'Poor - Broken snake chain, no optimization' };
}

/**
 * Generate improvement suggestions
 */
function generateSuggestions(
  chainLength: number,
  metrics: RoomMetrics,
  rewardRoomsCount: number
): string[] {
  const suggestions: string[] = [];

  if (chainLength < 4) {
    suggestions.push(
      `Snake chain is only ${chainLength} rooms. Aim for 4+ connected reward rooms.`
    );
  }

  if (metrics.spymasters === 0 && metrics.t7Rooms === 0 && metrics.t6Rooms < 3) {
    suggestions.push(
      'Consider adding more high-value rooms (Spymasters, T7 rooms, or multiple T6 rooms).'
    );
  }

  if (rewardRoomsCount < 10) {
    suggestions.push('Consider adding more reward rooms to the temple.');
  }

  return suggestions;
}

/**
 * Analyze temple layout and calculate quality metrics
 *
 * Main analysis function that calculates scores, star ratings, and suggestions
 *
 * @param templeData - The temple data to analyze
 * @returns Analysis results including score (0-105), stars (1-5), and suggestions
 *
 * @example
 * ```ts
 * const templeData = { grid: { '0,0': { x: 0, y: 0, room: 'alchemy_lab', tier: 5 } } };
 * const analysis = analyzeTemple(templeData);
 * console.log(`Score: ${analysis.totalScore}, Stars: ${analysis.starRating}`);
 * ```
 *
 * @throws {Error} If temple data structure is invalid
 */
export function analyzeTemple(templeData: TempleData): TempleAnalysis {
  // Generate cache key from temple data
  const cacheKey = JSON.stringify(templeData);

  // Check cache
  const cached = analysisCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const grid = templeData.grid || {};
  const rooms = Object.values(grid);
  const rewardRooms = filterRewardRooms(rooms);
  const bestChain = findBestChain(rewardRooms);

  // Calculate metrics
  const chainLength = bestChain.length;
  const snakeScore = calculateSnakeScore(chainLength);

  const { score: roomScore, metrics } = calculateRoomScore(rewardRooms);
  const quantityScore = Math.min(15, rewardRooms.length * 0.8);

  // Tech pattern analysis
  const techAnalysis = analyzeTechPatterns(templeData);

  // Total score (0-105): snake (40) + room (50) + quantity (15) + tech (bonus)
  const totalScore = Math.round(
    snakeScore + roomScore + quantityScore + techAnalysis.totalTechScore
  );

  // Star rating
  const { rating: starRating, description: ratingDescription } = calculateStarRating(totalScore);

  // Suggestions
  const suggestions = generateSuggestions(chainLength, metrics, rewardRooms.length);

  const result = {
    roomCount: rooms.length,
    rewardRooms: rewardRooms.length,
    architectRooms: rooms.filter((r) => r.room === 'architect').length,
    bossRooms: rooms.filter((r) => r.room === 'boss' || r.room === 'atziri').length,
    highTierRooms: metrics.highTierRooms,
    spymasters: metrics.spymasters,
    golems: metrics.golems,
    t7Rooms: metrics.t7Rooms,
    t6Rooms: metrics.t6Rooms,
    snakeScore,
    roomScore,
    quantityScore,
    techScore: techAnalysis.totalTechScore,
    totalScore,
    starRating,
    ratingDescription,
    suggestions,
    decodedRooms: templeData.decodedRooms,
    techBonuses: techAnalysis.bonuses,
    hasRussianTech: techAnalysis.hasRussianTech,
    hasRomanRoad: techAnalysis.hasRomanRoad,
    hasDoubleTriple: techAnalysis.hasDoubleTriple,
  };

  // Cache result
  analysisCache.set(cacheKey, result);

  return result;
}

/**
 * Count rooms by their tier level
 *
 * @param rooms - Array of rooms to count
 * @returns Object mapping tier numbers to room counts
 *
 * @example
 * ```ts
 * const rooms = [
 *   { x: 0, y: 0, room: 'lab', tier: 7 },
 *   { x: 1, y: 0, room: 'lab', tier: 7 }
 * ];
 * const counts = countRoomsByTier(rooms);
 * // Returns: { 7: 2 }
 * ```
 */
export function countRoomsByTier(rooms: Room[]): Record<number, number> {
  const counts: Record<number, number> = {};

  rooms.forEach((room) => {
    const tier = room.tier || 0;
    counts[tier] = (counts[tier] || 0) + 1;
  });

  return counts;
}
