/**
 * Scoring configuration and thresholds for PoE2 Temple Analyzer
 */

import type { RatingThresholds, ScoreCriteria } from '../types/scoring-types.js';

/**
 * Star rating thresholds
 */
export const RATING_THRESHOLDS: RatingThresholds = {
  fiveStar: 850,
  fourStar: 700,
  threeStar: 550,
  twoStar: 400,
  oneStar: 0,
};

/**
 * Score calculation criteria and weights
 */
export const SCORE_CRITERIA: ScoreCriteria = {
  maxScore: 1000,
  weights: {
    roomTiers: 0.40,
    roomDensity: 0.15,
    techPatterns: 0.25,
    layoutEfficiency: 0.10,
    rewardDensity: 0.10,
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
