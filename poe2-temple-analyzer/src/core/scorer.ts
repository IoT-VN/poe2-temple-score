/**
 * Scoring calculations for temple analysis
 */

import type { TempleAnalysis, Room } from '../types/temple-types';
import { RATING_THRESHOLDS, TIER_MULTIPLIERS } from '../config/scoring-config';

/**
 * Calculate overall score from components
 */
export function calculateOverallScore(snakeScore: number, roomScore: number, quantityScore: number): number {
  return Math.round(snakeScore + roomScore + quantityScore);
}

/**
 * Calculate star rating from total score
 */
export function calculateStarRating(totalScore: number): number {
  if (totalScore >= RATING_THRESHOLDS.fiveStar) return 5;
  if (totalScore >= RATING_THRESHOLDS.fourStar) return 4;
  if (totalScore >= RATING_THRESHOLDS.threeStar) return 3;
  if (totalScore >= RATING_THRESHOLDS.twoStar) return 2;
  return 1;
}

/**
 * Calculate room value for scoring
 */
export function calculateRoomValue(room: Room): number {
  const tier = room.tier || 0;
  const multiplier = TIER_MULTIPLIERS[tier] || 0;

  // Base room type values
  const roomTypeValues: { [key: string]: number } = {
    viper_spymaster: 10,
    golem_works: 9,
    vault: 8,
    reward_currency: 7,
    alchemy_lab: 6,
    flesh_surgeon: 6,
    synthflesh: 6,
    transcendent_barracks: 5,
    viper_legion_barracks: 5,
    thaumaturge: 4,
    smithy: 4,
    armoury: 3,
    generator: 3,
    garrison: 3,
    corruption: 2,
    reward_room: 5,
  };

  const baseValue = roomTypeValues[room.room] || 1;
  return Math.round(baseValue * multiplier);
}

/**
 * Calculate density score based on room count
 */
export function calculateDensityScore(roomCount: number, maxRooms: number = 25): number {
  return Math.min(15, (roomCount / maxRooms) * 15);
}

/**
 * Generate suggestions based on analysis
 */
export function generateSuggestions(analysis: TempleAnalysis): string[] {
  const suggestions: string[] = [];

  if (analysis.snakeScore < 25) {
    suggestions.push('Improve snake chain connectivity for better scores.');
  }

  if (analysis.t7Rooms === 0 && analysis.highTierRooms < 3) {
    suggestions.push('Add more high-tier rooms (T6-T7) for better rewards.');
  }

  if (analysis.rewardRooms < 10) {
    suggestions.push('Consider adding more reward rooms to increase value.');
  }

  if (analysis.spymasters === 0) {
    suggestions.push('Viper Spymaster rooms provide significant value.');
  }

  if (analysis.golems === 0) {
    suggestions.push('Golem Works rooms offer excellent rewards.');
  }

  return suggestions;
}
