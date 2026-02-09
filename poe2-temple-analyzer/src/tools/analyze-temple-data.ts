/**
 * MCP Tool: Analyze temple from data
 */

import type { TempleAnalysis } from '../types/temple-types';
import { analyzeTemple } from '../core/analyzer';

export const name = 'analyze_temple_data';
export const description = 'Analyze temple data directly from decoded JSON structure';

export const inputSchema = {
  type: 'object',
  properties: {
    templeData: {
      type: 'object',
      description: 'The decoded temple data object with grid and room information',
    },
  },
  required: ['templeData'],
} as const;

export async function handler(args: { templeData: any }): Promise<{
  content: { type: string; text: string }[];
}> {
  const templeData = args.templeData;
  const analysis: TempleAnalysis = analyzeTemple(templeData);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(analysis, null, 2),
      },
    ],
  };
}
