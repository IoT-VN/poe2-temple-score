/**
 * Tech pattern detection for temple layouts
 *
 * Identifies valuable tech patterns:
 * - Russian Tech: Multiple T7 rooms connected
 * - Roman Road: Linear chain of high-tier rooms
 * - Double Triple: Two triple connections of T6+ rooms
 */

import type { TempleData, Room } from '../types/temple-types';
import { TECH_BONUSES } from '../config/scoring-config';

/**
 * Detected tech bonus with details
 */
export interface TechBonus {
  type: string;
  name: string;
  description: string;
  score: number;
  percentage: number; // Percentage of total score contribution
  detected: boolean;
  rooms?: Room[];
}

/**
 * Analysis result with tech bonuses
 */
export interface TechAnalysis {
  bonuses: TechBonus[];
  totalTechScore: number;
  hasRussianTech: boolean;
  hasRomanRoad: boolean;
  hasDoubleTriple: boolean;
}

/**
 * Find connected rooms starting from a given room using BFS
 */
function findConnectedRooms(rooms: Room[], startRoom: Room, minTier: number = 0): Room[] {
  const visited = new Set<string>();
  const queue: Room[] = [startRoom];
  const connected: Room[] = [];
  const tierFilter = minTier;

  visited.add(`${startRoom.x},${startRoom.y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if ((current.tier || 0) >= tierFilter) {
      connected.push(current);
    }

    // Find adjacent rooms
    rooms.forEach((room) => {
      const key = `${room.x},${room.y}`;
      if (visited.has(key)) return;

      const dx = Math.abs(room.x - current.x);
      const dy = Math.abs(room.y - current.y);

      // Check if adjacent (including diagonals)
      if (dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0)) {
        visited.add(key);
        queue.push(room);
      }
    });
  }

  return connected;
}

/**
 * Detect Russian Tech pattern
 *
 * Russian Tech: Multiple T7 rooms connected together
 * Value: 150 points
 */
function detectRussianTech(rooms: Room[]): TechBonus {
  const t7Rooms = rooms.filter((r) => (r.tier || 0) >= 7);

  if (t7Rooms.length < 2) {
    return {
      type: 'russian_tech',
      name: 'Russian Tech',
      description: 'Multiple T7 rooms connected',
      score: 0,
      percentage: 0,
      detected: false,
    };
  }

  // Find largest connected component of T7 rooms
  let maxConnected: Room[] = [];
  const visited = new Set<string>();

  for (const room of t7Rooms) {
    const key = `${room.x},${room.y}`;
    if (visited.has(key)) continue;

    const connected = findConnectedRooms(t7Rooms, room, 7);
    connected.forEach((r) => visited.add(`${r.x},${r.y}`));

    if (connected.length > maxConnected.length) {
      maxConnected = connected;
    }
  }

  if (maxConnected.length >= 3) {
    return {
      type: 'russian_tech',
      name: 'Russian Tech',
      description: `${maxConnected.length} connected T7 rooms`,
      score: TECH_BONUSES.RUSSIAN_TECH,
      percentage: 0, // Will be calculated after total score is known
      detected: true,
      rooms: maxConnected,
    };
  }

  return {
    type: 'russian_tech',
    name: 'Russian Tech',
    description: 'Multiple T7 rooms connected',
    score: 0,
    percentage: 0,
    detected: false,
  };
}

/**
 * Detect Roman Road pattern
 *
 * Roman Road: Linear chain of 4+ high-tier rooms (T6+)
 * Value: 100 points
 */
function detectRomanRoad(rooms: Room[]): TechBonus {
  const highTierRooms = rooms.filter((r) => (r.tier || 0) >= 6);

  if (highTierRooms.length < 4) {
    return {
      type: 'roman_road',
      name: 'Roman Road',
      description: 'Linear chain of high-tier rooms',
      score: 0,
      percentage: 0,
      detected: false,
    };
  }

  // Find longest linear path
  let maxPathLength = 0;
  let bestPath: Room[] = [];

  highTierRooms.forEach((startRoom) => {
    const visited = new Set<string>();
    const path = findLongestPath(highTierRooms, startRoom, visited, []);

    if (path.length > maxPathLength) {
      maxPathLength = path.length;
      bestPath = path;
    }
  });

  if (maxPathLength >= 4) {
    return {
      type: 'roman_road',
      name: 'Roman Road',
      description: `${maxPathLength} high-tier rooms in a line`,
      score: TECH_BONUSES.ROMAN_ROAD,
      percentage: 0,
      detected: true,
      rooms: bestPath,
    };
  }

  return {
    type: 'roman_road',
    name: 'Roman Road',
    description: 'Linear chain of high-tier rooms',
    score: 0,
    percentage: 0,
    detected: false,
  };
}

/**
 * Find longest path from room using DFS
 */
function findLongestPath(rooms: Room[], current: Room, visited: Set<string>, path: Room[]): Room[] {
  const key = `${current.x},${current.y}`;
  visited.add(key);
  path.push(current);

  let longestPath = [...path];

  // Find adjacent unvisited rooms
  rooms.forEach((room) => {
    const roomKey = `${room.x},${room.y}`;
    if (visited.has(roomKey)) return;

    const dx = Math.abs(room.x - current.x);
    const dy = Math.abs(room.y - current.y);

    if (dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0)) {
      const newPath = findLongestPath(rooms, room, visited, [...path]);
      if (newPath.length > longestPath.length) {
        longestPath = newPath;
      }
    }
  });

  return longestPath;
}

/**
 * Detect Double Triple pattern
 *
 * Double Triple: Two separate triple connections of T6+ rooms
 * Value: 120 points
 */
function detectDoubleTriple(rooms: Room[]): TechBonus {
  const t6PlusRooms = rooms.filter((r) => (r.tier || 0) >= 6);

  if (t6PlusRooms.length < 6) {
    return {
      type: 'double_triple',
      name: 'Double Triple',
      description: 'Two triple connections of T6+ rooms',
      score: 0,
      percentage: 0,
      detected: false,
    };
  }

  // Find all triple connections (3 rooms connected to each other)
  const triples: Room[][] = [];
  const visited = new Set<string>();

  t6PlusRooms.forEach((startRoom) => {
    const key = `${startRoom.x},${startRoom.y}`;
    if (visited.has(key)) return;

    const connected = findConnectedRooms(t6PlusRooms, startRoom, 6);

    // Mark all as visited
    connected.forEach((r) => visited.add(`${r.x},${r.y}`));

    if (connected.length >= 3) {
      triples.push(connected);
    }
  });

  // Check if we have at least 2 triples
  const validTriples = triples.filter((t) => t.length >= 3);

  if (validTriples.length >= 2) {
    const totalRooms = validTriples.reduce((sum, t) => sum + t.length, 0);

    return {
      type: 'double_triple',
      name: 'Double Triple',
      description: `${validTriples.length} clusters with ${totalRooms} T6+ rooms`,
      score: TECH_BONUSES.DOUBLE_TRIPLE,
      percentage: 0,
      detected: true,
      rooms: validTriples.flatMap((t) => t),
    };
  }

  return {
    type: 'double_triple',
    name: 'Double Triple',
    description: 'Two triple connections of T6+ rooms',
    score: 0,
    percentage: 0,
    detected: false,
  };
}

/**
 * Analyze temple for tech patterns and bonuses
 *
 * @param templeData - The temple data to analyze
 * @param totalScore - Total temple score for percentage calculation
 * @returns Tech analysis with detected bonuses and scores
 *
 * @example
 * ```ts
 * const templeData = { grid: { '0,0': { x: 0, y: 0, room: 'viper_spymaster', tier: 7 } } };
 * const techAnalysis = analyzeTechPatterns(templeData, 100);
 * console.log(techAnalysis.totalTechScore);
 * ```
 */
export function analyzeTechPatterns(templeData: TempleData, totalScore: number = 0): TechAnalysis {
  const rooms = Object.values(templeData.grid || {});

  const russianTech = detectRussianTech(rooms);
  const romanRoad = detectRomanRoad(rooms);
  const doubleTriple = detectDoubleTriple(rooms);

  const bonuses: TechBonus[] = [russianTech, romanRoad, doubleTriple];
  const detectedBonuses = bonuses.filter((b) => b.detected);
  const totalTechScore = detectedBonuses.reduce((sum, b) => sum + b.score, 0);

  // Calculate percentage contribution for each bonus
  const bonusesWithPercentage = bonuses.map((bonus) => ({
    ...bonus,
    percentage: totalScore > 0 ? Math.round((bonus.score / totalScore) * 100) : 0,
  }));

  return {
    bonuses: bonusesWithPercentage,
    totalTechScore,
    hasRussianTech: russianTech.detected,
    hasRomanRoad: romanRoad.detected,
    hasDoubleTriple: doubleTriple.detected,
  };
}
