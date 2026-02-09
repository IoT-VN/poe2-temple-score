/**
 * Core type definitions for PoE2 Temple Analyzer
 */

/**
 * Room types in PoE2 Vaal Temple
 */
export interface Room {
  x: number;
  y: number;
  room: string;
  tier?: number;
  connections?: string[];
  roomTypeId?: number;
}

/**
 * Temple layout data structure
 */
export interface TempleData {
  grid: { [key: string]: Room };
  dimensions?: { width: number; height: number };
  entry?: { x: number; y: number };
  boss?: { x: number; y: number };
  sacrificeUsed?: boolean;
  altarOfCorruption?: boolean;
  architectUsed?: boolean;
  medallionTokensUsed?: number;
  decodedRooms?: Room[];
}

/**
 * Detected tech bonus with details
 */
export interface TechBonus {
  type: string;
  name: string;
  description: string;
  score: number;
  detected: boolean;
  rooms?: Room[];
}

/**
 * Temple analysis result
 */
export interface TempleAnalysis {
  roomCount: number;
  rewardRooms: number;
  architectRooms: number;
  bossRooms: number;
  highTierRooms: number;
  spymasters: number;
  golems: number;
  t7Rooms: number;
  t6Rooms: number;
  snakeScore: number;
  roomScore: number;
  quantityScore: number;
  techScore: number;
  totalScore: number;
  starRating: number;
  ratingDescription: string;
  suggestions: string[];
  decodedRooms?: Room[];
  techBonuses: TechBonus[];
  hasRussianTech: boolean;
  hasRomanRoad: boolean;
  hasDoubleTriple: boolean;
}
