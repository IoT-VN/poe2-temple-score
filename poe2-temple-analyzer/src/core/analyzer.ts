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
  // T7 Special rooms (highest priority)
  corruption: 12,
  sacrifice: 10,

  // Top reward rooms
  viper_spymaster: 10,
  golem_works: 9,
  viper_legion_barracks: 8,
  transcendent_barracks: 7,
  vault: 6,
  reward_currency: 5,
  reward_room: 5,

  // Good reward rooms
  alchemy_lab: 4,
  flesh_surgeon: 4,
  synthflesh: 4,

  // Architect rooms (valuable for placement)
  entry: 5,
  commander: 5,
  architect: 3,

  // Standard reward rooms
  thaumaturge: 3,
  smithy: 3,
  armoury: 2,
  generator: 2,
  garrison: 2,

  // Special rooms
  sacrificial_chamber: 2,
  altar_of_sacrifice: 1,
  boss: 8,
  atziri: 15,
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
  // Moderate influence - max 18 points
  if (chainLength >= 8) return 18;
  if (chainLength >= 6) return 12;
  if (chainLength >= 4) return 8;
  if (chainLength >= 2) return 4;
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

  // Critical bonuses for 5-star quality
  if (spymasters >= 2) {
    roomScore += 40; // Huge bonus for 2+ spymasters
  } else if (spymasters === 1) {
    roomScore += 15; // Moderate bonus for 1 spymaster
  }

  if (t7Rooms >= 3) {
    roomScore += 50; // Huge bonus for 3+ T7 rooms
  } else if (t7Rooms >= 1) {
    roomScore += t7Rooms * 12; // Standard T7 scoring
  }

  roomScore += golems * 4; // golems

  // T6 rooms with higher value for quantity
  const t6Score = t6Rooms <= 2 ? t6Rooms * 4 : 8 + (t6Rooms - 2) * 3;
  roomScore += Math.min(20, t6Score);

  // High-tier density bonus
  const highTierCount = rewardRooms.filter((r) => (r.tier || 0) >= 6).length;
  if (highTierCount >= 6) roomScore += 3;

  // Exceptional T6 density bonus (5+ T6 rooms = exceptional quality)
  if (t6Rooms >= 5) {
    roomScore += 28; // Massive bonus for 5+ T6 rooms (5★ quality)
  }

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
  if (totalScore >= 80) {
    return { rating: 5, description: 'God Tier - Exceptional temple with outstanding quality' };
  }
  if (totalScore >= 55) {
    return { rating: 4, description: 'Excellent - Very strong layout with high-value rooms' };
  }
  if (totalScore >= 38) {
    return { rating: 3, description: 'Good - Solid optimization with valuable rooms' };
  }
  if (totalScore >= 35) {
    return { rating: 2, description: 'Average - Basic optimization with some value' };
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

  // Quantity score - moderate influence
  const rewardDensity = rewardRooms.length / rooms.length;
  let quantityScore;
  if (rewardDensity >= 0.8) {
    quantityScore = 12; // 80%+ reward rooms
  } else if (rewardDensity >= 0.6) {
    quantityScore = 8; // 60-79% reward rooms
  } else if (rewardDensity >= 0.5) {
    quantityScore = 5; // 50-59% reward rooms
  } else {
    quantityScore = 2; // <50% reward rooms (poor)
  }

  // Tech pattern analysis
  const techAnalysis = analyzeTechPatterns(templeData);

  // Total score: snake (18) + room (50) + quantity (12) + tech (bonus)
  const totalScore = Math.round(
    snakeScore + roomScore + quantityScore + techAnalysis.totalTechScore
  );

  // Recalculate tech analysis with total score for percentage calculation
  const techAnalysisWithPercentage = analyzeTechPatterns(templeData, totalScore);

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
    techScore: techAnalysisWithPercentage.totalTechScore,
    totalScore,
    starRating,
    ratingDescription,
    suggestions,
    decodedRooms: templeData.decodedRooms,
    techBonuses: techAnalysisWithPercentage.bonuses,
    hasRussianTech: techAnalysisWithPercentage.hasRussianTech,
    hasRomanRoad: techAnalysisWithPercentage.hasRomanRoad,
    hasDoubleTriple: techAnalysisWithPercentage.hasDoubleTriple,
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
