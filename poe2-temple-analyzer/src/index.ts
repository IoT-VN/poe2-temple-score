/**
 * PoE2 Temple Analyzer MCP Server
 *
 * A Model Context Protocol server for analyzing Path of Exile 2 Vaal Temple layouts
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Import all modules
// Types are re-exported from modules

// Core functionality
export { decodeTempleData, parseTempleArray } from './core/decoder';
export { analyzeTemple, filterRewardRooms, countRoomsByTier, clearAnalysisCache } from './core/analyzer';
export {
  calculateOverallScore,
  calculateStarRating,
  calculateRoomValue,
  calculateDensityScore,
  generateSuggestions,
} from './core/scorer';

// Utilities
export { extractShareData, validateShareURL } from './utils/url-parser';
export { LRUCache } from './utils/cache';

// Configuration
export * from './config/room-types';
export * from './config/scoring-config';

// Tools
import { handler as analyzeTempleUrlHandler, name as analyzeTempleUrlName, inputSchema as analyzeTempleUrlSchema } from './tools/analyze-temple-url';
import { handler as analyzeTempleDataHandler, name as analyzeTempleDataName, inputSchema as analyzeTempleDataSchema } from './tools/analyze-temple-data';
import { handler as getRoomInfoHandler, name as getRoomInfoName, inputSchema as getRoomInfoSchema } from './tools/get-room-info';
import { handler as getRatingCriteriaHandler, name as getRatingCriteriaName, inputSchema as getRatingCriteriaSchema } from './tools/get-rating-criteria';

/**
 * Create MCP Server
 */
const server = new Server(
  {
    name: 'poe2-temple-analyzer',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: analyzeTempleUrlName,
        description: 'Analyze a PoE2 Vaal Temple layout from a share URL and calculate star rating',
        inputSchema: analyzeTempleUrlSchema,
      },
      {
        name: analyzeTempleDataName,
        description: 'Analyze temple data directly from decoded JSON structure',
        inputSchema: analyzeTempleDataSchema,
      },
      {
        name: getRoomInfoName,
        description: 'Get information about a specific room type in PoE2 Vaal Temple',
        inputSchema: getRoomInfoSchema,
      },
      {
        name: getRatingCriteriaName,
        description: 'Get the criteria and formulas used for calculating star ratings',
        inputSchema: getRatingCriteriaSchema,
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(
  CallToolRequestSchema,
  async (request: { params: { name: string; arguments?: Record<string, unknown> } }) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case analyzeTempleUrlName:
          return await analyzeTempleUrlHandler(args as any);

        case analyzeTempleDataName:
          return await analyzeTempleDataHandler(args as any);

        case getRoomInfoName:
          return await getRoomInfoHandler(args as any);

        case getRatingCriteriaName:
          return await getRatingCriteriaHandler();

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

/**
 * Start server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('PoE2 Temple Analyzer MCP Server started');
}

main().catch(console.error);
