/**
 * Scoring-related type definitions for PoE2 Temple Analyzer
 */

/**
 * Score calculation criteria and weights
 */
export interface ScoreCriteria {
  maxScore: number;
  weights: {
    roomTiers: number;
    roomDensity: number;
    techPatterns: number;
    layoutEfficiency: number;
    rewardDensity: number;
  };
}

/**
 * Star rating thresholds
 */
export interface RatingThresholds {
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

/**
 * Tech pattern detection result
 */
export interface TechPattern {
  name: string;
  rooms: string[];
  bonus: number;
  description: string;
}

/**
 * Room value for scoring
 */
export interface RoomValue {
  type: 'reward' | 'special' | 'architect' | 'boss' | 'empty' | 'path' | 'unknown';
  baseValue: number;
  highTierBonus: boolean;
}
