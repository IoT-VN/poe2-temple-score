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
  snakeScore: number;
  roomScore: number;
  quantityScore: number;
  totalScore: number;
  starRating: number;
  ratingDescription: string;
  suggestions: string[];
  decodedRooms?: Room[];
}
