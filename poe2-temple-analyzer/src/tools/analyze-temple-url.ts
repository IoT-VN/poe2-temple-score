/**
 * MCP Tool: Analyze temple from share URL
 */

import type { TempleAnalysis } from '../types/temple-types';
import { extractShareData } from '../utils/url-parser';
import { decodeTempleData } from '../core/decoder';
import { analyzeTemple } from '../core/analyzer';

export const name = 'analyze_temple';
export const description = 'Analyze a PoE2 Vaal Temple layout from a share URL and calculate star rating';

export const inputSchema = {
  type: 'object',
  properties: {
    shareUrl: {
      type: 'string',
      description:
        'The share URL containing temple data (e.g., http://localhost:8080/#/atziri-temple?t=...)',
    },
  },
  required: ['shareUrl'],
} as const;

export async function handler(args: { shareUrl: string }): Promise<{
  content: { type: string; text: string }[];
}> {
  const shareUrl = args.shareUrl;
  const encodedData = extractShareData(shareUrl);

  if (!encodedData) {
    throw new Error('Could not extract temple data from URL');
  }

  const templeData = decodeTempleData(encodedData);

  if (!templeData) {
    throw new Error('Failed to decode temple data');
  }

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
