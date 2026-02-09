/**
 * MCP Tool: Get rating criteria
 */

import { CHARSETS } from '../config/room-types';
import { SCORE_CRITERIA, RATING_THRESHOLDS } from '../config/scoring-config';

export const name = 'get_rating_criteria';
export const description = 'Get the criteria and formulas used for calculating star ratings';

export const inputSchema = {
  type: 'object',
  properties: {},
} as const;

export async function handler(): Promise<{
  content: { type: string; text: string }[];
}> {
  const criteria = {
    description: 'Star rating is calculated based on three main factors:',
    scoring: {
      snakeScore: {
        maxPoints: 40,
        description: 'Based on longest connected chain of reward rooms',
        breakdown: {
          '8+ rooms': 40,
          '6-7 rooms': 35,
          '5 rooms': 30,
          '4 rooms': 25,
          '3 rooms': 15,
          '2 rooms': 6,
          '0-1 rooms': 2,
        },
      },
      roomQualityScore: {
        maxPoints: 50,
        description: 'Based on high-value room types and tiers',
        formula: 'Spymasters × 10 + Golems × 8 + T7 × 30 + min(T6 × 3, 15) + highTierBonus',
      },
      quantityScore: {
        maxPoints: 15,
        description: 'Reward room density bonus',
        formula: 'min(15, rewardRooms × 0.8)',
      },
    },
    totalScore: 'snakeScore + roomQualityScore + quantityScore (max 105)',
    starRating: RATING_THRESHOLDS,
    weights: SCORE_CRITERIA.weights,
    encoding: {
      format: 'Base-40 with 5-bit values',
      charset: CHARSETS[0],
      roomEncoding: '16 bits per room: 4 bits x + 4 bits y + 5 bits room type + 3 bits tier',
    },
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(criteria, null, 2),
      },
    ],
  };
}
