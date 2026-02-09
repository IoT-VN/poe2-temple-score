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
  grid: {
    [key: string]: Room;
  };
  dimensions?: {
    width: number;
    height: number;
  };
  entry?: {
    x: number;
    y: number;
  };
  boss?: {
    x: number;
    y: number;
  };
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
/**
 * Auto-detect charset from encoded string and decode
 * Supports all known charset versions plus auto-detection
 */
export declare function decodeTempleData(encoded: string): TempleData | null;
/**
 * Extract the 't' parameter from share URL
 */
export declare function extractShareData(shareUrl: string): string | null;
/**
 * Analyze temple layout and calculate star rating
 * Based on: Snake Chain + Rarity + Quantity
 */
export declare function analyzeTemple(templeData: TempleData): TempleAnalysis;
//# sourceMappingURL=index.d.ts.map
