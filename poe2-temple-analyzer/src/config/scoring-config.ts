/**
 * Scoring configuration and thresholds for PoE2 Temple Analyzer
 */

import type { RatingThresholds, ScoreCriteria } from '../types/scoring-types.js';

/**
 * Star rating thresholds
 */
export const RATING_THRESHOLDS: RatingThresholds = {
  fiveStar: 90,
  fourStar: 50,
  threeStar: 25,
  twoStar: 18,
  oneStar: 0,
};

/**
 * Score calculation criteria and weights
 */
export const SCORE_CRITERIA: ScoreCriteria = {
  maxScore: 475, // Base 105 (snake 40 + rooms 50 + quantity 15) + Tech 370
  weights: {
    roomTiers: 0.4,
    roomDensity: 0.15,
    techPatterns: 0.25,
    layoutEfficiency: 0.1,
    rewardDensity: 0.1,
  },
};

/**
 * Snake score thresholds
 */
export const SNAKE_THRESHOLDS = {
  T7_MIN: 15,
  T6_MIN: 12,
  T5_MIN: 10,
};

/**
 * Tech pattern bonuses
 */
export const TECH_BONUSES = {
  RUSSIAN_TECH: 150,
  ROMAN_ROAD: 100,
  DOUBLE_TRIPLE: 120,
};

/**
 * Minimum rooms for each tier
 */
export const MIN_ROOMS = {
  T7: 3,
  T6: 5,
  T5: 8,
};

/**
 * Room tier multipliers for scoring
 */
export const TIER_MULTIPLIERS: { [tier: number]: number } = {
  7: 5.0,
  6: 3.5,
  5: 2.5,
  4: 1.5,
  3: 1.0,
  2: 0.5,
  1: 0.2,
  0: 0.0,
};
