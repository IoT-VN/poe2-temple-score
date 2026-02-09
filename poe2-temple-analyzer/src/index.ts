import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

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

// Multiple charset versions for compatibility
const CHARSETS = [
  // Base-32 charset (newest)
  'ABCDEFHIJKMOQRSTWXYaceghijkopqwx',
  // Base-40 newest charset (2026)
  '056ABCEFGIJKMQSTWXYaceghijklnopqrwxy',
  // Base-40 newer charset
  '56ABCDEFGIJKMOQRSUWXYaceghjklpwxy',
  // Base-40 old charset (legacy)
  '56ABCDEFGHIKMQRSTWYaceghjklnopwxy',
];

// Room type ID to name mapping (based on PoE2 temple)
const ROOM_TYPE_IDS: { [key: number]: string } = {
  0: 'empty',
  1: 'path',
  2: 'entry',
  3: 'boss',
  4: 'corruption',
  5: 'sacrifice',
  6: 'alchemy_lab',
  7: 'armoury',
  8: 'flesh_surgeon',
  9: 'garrison',
  10: 'generator',
  11: 'golem_works',
  12: 'reward_currency',
  13: 'smithy',
  14: 'synthflesh',
  15: 'thaumaturge',
  16: 'transcendent_barracks',
  17: 'vault',
  18: 'viper_legion_barracks',
  19: 'viper_spymaster',
  20: 'commander',
  21: 'architect',
  22: 'altar_of_sacrifice',
  23: 'sacrificial_chamber',
  24: 'reward_room',
  25: 'medallion_bonus',
  26: 'medallion_reroll',
  27: 'medallion_levelup',
  28: 'medallion_increase_max',
  29: 'medallion_prevent_delete',
  30: 'medallion_increase_tokens',
  31: 'unknown',
};

/**
 * Room type definitions with reward values
 */
const ROOM_TYPES: { [key: string]: { type: string; rewardValue: number; isReward: boolean } } = {
  alchemy_lab: { type: 'reward', rewardValue: 3, isReward: true },
  armoury: { type: 'reward', rewardValue: 2, isReward: true },
  corruption: { type: 'special', rewardValue: 1, isReward: false },
  flesh_surgeon: { type: 'reward', rewardValue: 3, isReward: true },
  garrison: { type: 'reward', rewardValue: 2, isReward: true },
  generator: { type: 'reward', rewardValue: 2, isReward: true },
  golem_works: { type: 'reward', rewardValue: 2, isReward: true },
  reward_currency: { type: 'reward', rewardValue: 4, isReward: true },
  sacrifice_room: { type: 'special', rewardValue: 0, isReward: false },
  sacrificial_chamber: { type: 'special', rewardValue: 0, isReward: false },
  smithy: { type: 'reward', rewardValue: 2, isReward: true },
  synthflesh: { type: 'reward', rewardValue: 3, isReward: true },
  thaumaturge: { type: 'reward', rewardValue: 2, isReward: true },
  transcendent_barracks: { type: 'reward', rewardValue: 2, isReward: true },
  vault: { type: 'reward', rewardValue: 4, isReward: true },
  viper_legion_barracks: { type: 'reward', rewardValue: 2, isReward: true },
  viper_spymaster: { type: 'reward', rewardValue: 3, isReward: true },
  commander: { type: 'architect', rewardValue: 0, isReward: false },
  architect: { type: 'architect', rewardValue: 0, isReward: false },
  atziri: { type: 'boss', rewardValue: 0, isReward: false },
  altar_of_sacrifice: { type: 'special', rewardValue: 0, isReward: false },
  empty: { type: 'empty', rewardValue: 0, isReward: false },
  path: { type: 'path', rewardValue: 0, isReward: false },
  reward_room: { type: 'reward', rewardValue: 3, isReward: true },
  medallion_bonus: { type: 'special', rewardValue: 0, isReward: false },
  medallion_reroll: { type: 'special', rewardValue: 0, isReward: false },
  medallion_levelup: { type: 'special', rewardValue: 0, isReward: false },
  medallion_increase_max: { type: 'special', rewardValue: 0, isReward: false },
  medallion_prevent_delete: { type: 'special', rewardValue: 0, isReward: false },
  medallion_increase_tokens: { type: 'special', rewardValue: 0, isReward: false },
  unknown: { type: 'unknown', rewardValue: 1, isReward: false },
};

/**
 * Auto-detect charset from encoded string and decode
 * Supports all known charset versions plus auto-detection
 */
export function decodeTempleData(encoded: string): TempleData | null {
  try {
    if (!encoded) return null;

    // Generate all possible charsets by combining known patterns
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const baseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const uniqueChars = [...new Set(encoded)].sort().join('');

    // Try auto-detected charset first (from unique chars in the string)
    const charToVal: { [key: string]: number } = {};
    uniqueChars.split('').forEach((c, i) => (charToVal[c] = i));

    // Convert to 5-bit values
    const values = encoded.split('').map((c) => charToVal[c]);

    // Check if encoding is valid (all values should be 0-31 for 5-bit)
    if (!values.some((v) => v === undefined) && Math.max(...values) <= 31) {
      // Pack 5-bit values into bit string
      let bitString = '';
      values.forEach((v) => {
        bitString += v.toString(2).padStart(5, '0');
      });

      // Decode rooms
      const grid: { [key: string]: Room } = {};
      const decodedRooms: Room[] = [];
      let pos = 0;

      while (pos + 16 <= bitString.length) {
        const x = parseInt(bitString.substring(pos, pos + 4), 2);
        const y = parseInt(bitString.substring(pos + 4, pos + 8), 2);
        const roomTypeId = parseInt(bitString.substring(pos + 8, pos + 13), 2);
        const tier = parseInt(bitString.substring(pos + 13, pos + 16), 2);

        pos += 16;

        if (x < 16 && y < 16 && roomTypeId <= 31) {
          const roomName = ROOM_TYPE_IDS[roomTypeId] || 'unknown_' + roomTypeId;
          const key = `${x},${y}`;
          const room: Room = {
            x,
            y,
            room: roomName,
            tier: tier,
            roomTypeId: roomTypeId,
          };
          grid[key] = room;
          decodedRooms.push(room);
        }
      }

      // Only return if we decoded at least some valid rooms
      if (Object.keys(grid).length > 5) {
        console.log(`Auto-detected charset with ${uniqueChars.length} characters`);
        return { grid, decodedRooms: decodedRooms };
      }
    }

    // Fall back to known charsets
    for (const charset of CHARSETS) {
      const charsetCharToVal: { [key: string]: number } = {};
      charset.split('').forEach((c, i) => (charsetCharToVal[c] = i));

      const charsetValues = encoded.split('').map((c) => charsetCharToVal[c]);

      if (charsetValues.some((v) => v === undefined)) {
        continue;
      }

      let bitString = '';
      charsetValues.forEach((v) => {
        bitString += v.toString(2).padStart(5, '0');
      });

      const charsetGrid: { [key: string]: Room } = {};
      const charsetDecodedRooms: Room[] = [];
      let pos = 0;

      while (pos + 16 <= bitString.length) {
        const x = parseInt(bitString.substring(pos, pos + 4), 2);
        const y = parseInt(bitString.substring(pos + 4, pos + 8), 2);
        const roomTypeId = parseInt(bitString.substring(pos + 8, pos + 13), 2);
        const tier = parseInt(bitString.substring(pos + 13, pos + 16), 2);

        pos += 16;

        if (x < 16 && y < 16 && roomTypeId <= 31) {
          const roomName = ROOM_TYPE_IDS[roomTypeId] || 'unknown_' + roomTypeId;
          const key = `${x},${y}`;
          const room: Room = {
            x,
            y,
            room: roomName,
            tier: tier,
            roomTypeId: roomTypeId,
          };
          charsetGrid[key] = room;
          charsetDecodedRooms.push(room);
        }
      }

      if (Object.keys(charsetGrid).length > 5) {
        return { grid: charsetGrid, decodedRooms: charsetDecodedRooms };
      }
    }

    throw new Error('Could not decode temple data');
  } catch (error) {
    console.error('Error decoding temple data:', error);
    return null;
  }
}

/**
 * Extract the 't' parameter from share URL
 */
export function extractShareData(shareUrl: string): string | null {
  try {
    const url = new URL(shareUrl);
    const hash = url.hash;

    // Check if hash contains '?t='
    const tParamMatch = hash.match(/\?t=([^&]+)/);
    if (tParamMatch) {
      return tParamMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Parse temple data from array format (common in PoE2 temple builders)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
function parseTempleArray(data: any[]): TempleData {
  const grid: { [key: string]: Room } = {};

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      if (item && typeof item === 'object') {
        const x = item.x !== undefined ? item.x : index % 10;
        const y = item.y !== undefined ? item.y : Math.floor(index / 10);
        const room = item.room || item.type || item.name || 'empty';

        const key = `${x},${y}`;
        grid[key] = { x, y, room, tier: item.tier };
      }
    });
  }

  return { grid };
}

/**
 * Calculate distance between two points
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Check if a path is a straight line
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isStraightLine(path: { x: number; y: number }[]): boolean {
  if (path.length < 2) return false;

  const first = path[0];
  const last = path[path.length - 1];

  // Check if all intermediate points are on the line between first and last
  for (let i = 1; i < path.length - 1; i++) {
    const point = path[i];

    // Calculate the area of the triangle formed by the three points
    const area = Math.abs(
      (last.x - first.x) * (point.y - first.y) - (last.y - first.y) * (point.x - first.x)
    );

    if (area > 0.01) {
      return false;
    }
  }

  return true;
}

/**
 * Find path using BFS
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findPath(
  grid: { [key: string]: Room },
  start: { x: number; y: number },
  end: { x: number; y: number }
): { x: number; y: number }[] {
  const visited = new Set<string>();
  const queue: { pos: { x: number; y: number }; path: { x: number; y: number }[] }[] = [];

  const startKey = `${start.x},${start.y}`;
  const endKey = `${end.x},${end.y}`;

  queue.push({ pos: start, path: [start] });
  visited.add(startKey);

  const directions = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 }, // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 }, // right
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = `${current.pos.x},${current.pos.y}`;

    if (currentKey === endKey) {
      return current.path;
    }

    for (const dir of directions) {
      const nextX = current.pos.x + dir.x;
      const nextY = current.pos.y + dir.y;
      const nextKey = `${nextX},${nextY}`;

      if (!visited.has(nextKey) && grid[nextKey] && grid[nextKey].room !== 'empty') {
        visited.add(nextKey);
        queue.push({
          pos: { x: nextX, y: nextY },
          path: [...current.path, { x: nextX, y: nextY }],
        });
      }
    }
  }

  return [];
}

/**
 * Analyze temple layout and calculate star rating
 * Based on: Snake Chain + Rarity + Quantity
 */
export function analyzeTemple(templeData: TempleData): TempleAnalysis {
  const grid = templeData.grid || {};
  const rooms = Object.values(grid);

  // Room rarity for snake scoring (higher = better)
  const ROOM_RARITY: { [key: string]: number } = {
    viper_spymaster: 10,
    golem_works: 9,
    viper_legion_barracks: 8,
    transcendent_barracks: 7,
    vault: 6,
    reward_currency: 5,
    reward_room: 5,
    alchemy_lab: 4,
    flesh_surgeon: 4,
    synthflesh: 4,
    thaumaturge: 3,
    smithy: 3,
    armoury: 2,
    generator: 2,
    garrison: 2,
  };

  // Filter to unique reward rooms
  const rewardRooms: Room[] = [];
  const seenRooms = new Set<string>();

  rooms.forEach((room) => {
    if (room.room === 'empty' || room.room === 'path') return;

    const key = room.y + ',' + room.x + ',' + room.room;
    if (seenRooms.has(key)) return;
    seenRooms.add(key);

    if (ROOM_RARITY[room.room] > 0) {
      rewardRooms.push(room);
    }
  });

  // Find the best connected snake chain
  function findBestChain(rooms: Room[]): Room[] {
    let bestChain: Room[] = [];
    const visited = new Set<string>();

    rooms.forEach((startRoom) => {
      const key = startRoom.y + ',' + startRoom.x;
      if (visited.has(key)) return;

      const chain: Room[] = [startRoom];
      visited.add(key);
      let current = startRoom;

      // Extend chain forward
      let extending = true;
      while (extending) {
        let bestNext: Room | null = null;
        let bestDist = 999;

        rooms.forEach((r) => {
          if (chain.includes(r)) return;
          const dist = Math.abs(current.x - r.x) + Math.abs(current.y - r.y);
          if (dist <= 1 && dist < bestDist) {
            bestDist = dist;
            bestNext = r;
          }
        });

        if (bestNext) {
          chain.push(bestNext);
          visited.add((bestNext as Room).y + ',' + (bestNext as Room).x);
          current = bestNext as Room;
        } else {
          extending = false;
        }
      }

      if (chain.length > bestChain.length) bestChain = chain;
    });

    return bestChain;
  }

  const bestChain = findBestChain(rewardRooms);

  // Calculate metrics
  const chainLength = bestChain.length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const chainTierSum = bestChain.reduce((sum, r) => sum + (r.tier || 0), 0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const chainAvgTier = chainLength > 0 ? chainTierSum / chainLength : 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const chainRaritySum = bestChain.reduce((sum, r) => sum + (ROOM_RARITY[r.room] || 0), 0);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const highTierRooms = rewardRooms.filter((r) => (r.tier || 0) >= 6).length;

  // ==========================================
  // NEW BALANCED SCORING (Snake + Room Quality + Density)
  // ==========================================

  // 1. Snake Score (0-40)
  let snakeScore = 0;
  if (chainLength >= 8) snakeScore = 40;
  else if (chainLength >= 6) snakeScore = 35;
  else if (chainLength >= 5) snakeScore = 30;
  else if (chainLength >= 4) snakeScore = 25;
  else if (chainLength >= 3) snakeScore = 15;
  else if (chainLength >= 2) snakeScore = 6;
  else snakeScore = 2;

  // 2. Room Quality Score
  const spymasters = rewardRooms.filter((r) => r.room === 'viper_spymaster').length;
  const golems = rewardRooms.filter((r) => r.room === 'golem_works').length;
  const t7Rooms = rewardRooms.filter((r) => (r.tier || 0) >= 7).length;
  const t6Rooms = rewardRooms.filter((r) => (r.tier || 0) === 6).length;

  let roomScore = 0;
  roomScore += spymasters * 10;
  roomScore += golems * 8;
  roomScore += t7Rooms * 30;
  roomScore += Math.min(15, t6Rooms * 3);

  // Bonus for MANY T6+ rooms
  const highTierCount = rewardRooms.filter((r) => (r.tier || 0) >= 6).length;
  if (highTierCount >= 5) roomScore += 10;

  // 3. Quantity Score - High density bonus
  const quantityScore = Math.min(15, rewardRooms.length * 0.8);

  // Total score (0-100)
  const totalScore = Math.round(snakeScore + roomScore + quantityScore);

  // Star rating
  let starRating: number;
  let ratingDescription: string;

  if (totalScore >= 75) {
    starRating = 5;
    ratingDescription = 'God Tier - Exceptional temple with outstanding quality';
  } else if (totalScore >= 60) {
    starRating = 4.5;
    ratingDescription = 'Excellent - Very strong layout with high-value rooms';
  } else if (totalScore >= 50) {
    starRating = 4;
    ratingDescription = 'Very Good - Strong snake chain and good rewards';
  } else if (totalScore >= 38) {
    starRating = 3.5;
    ratingDescription = 'Good - Decent snake chain with valuable rooms';
  } else if (totalScore >= 26) {
    starRating = 3;
    ratingDescription = 'Average - Basic optimization with some value';
  } else if (totalScore >= 16) {
    starRating = 2;
    ratingDescription = 'Below Average - Weak snake chain, limited rewards';
  } else {
    starRating = 1;
    ratingDescription = 'Poor - Broken snake chain, no optimization';
  }

  // Suggestions
  const suggestions: string[] = [];

  if (chainLength < 4) {
    suggestions.push(
      `Snake chain is only ${chainLength} rooms. Aim for 4+ connected reward rooms.`
    );
  }

  if (spymasters === 0 && t7Rooms === 0 && t6Rooms < 3) {
    suggestions.push(
      'Consider adding more high-value rooms (Spymasters, T7 rooms, or multiple T6 rooms).'
    );
  }

  if (rewardRooms.length < 10) {
    suggestions.push('Consider adding more reward rooms to the temple.');
  }

  return {
    roomCount: rooms.length,
    rewardRooms: rewardRooms.length,
    architectRooms: rooms.filter((r) => r.room === 'architect').length,
    bossRooms: rooms.filter((r) => r.room === 'boss' || r.room === 'atziri').length,
    highTierRooms: highTierCount,
    spymasters: spymasters,
    golems: golems,
    t7Rooms: t7Rooms,
    snakeScore: snakeScore,
    roomScore: roomScore,
    quantityScore: quantityScore,
    totalScore,
    starRating,
    ratingDescription,
    suggestions,
    decodedRooms: templeData.decodedRooms,
  };
}

// Create MCP Server
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

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'analyze_temple',
        description: 'Analyze a PoE2 Vaal Temple layout from a share URL and calculate star rating',
        inputSchema: {
          type: 'object',
          properties: {
            shareUrl: {
              type: 'string',
              description:
                'The share URL containing temple data (e.g., http://localhost:8080/#/atziri-temple?t=...)',
            },
          },
          required: ['shareUrl'],
        },
      },
      {
        name: 'analyze_temple_data',
        description: 'Analyze temple data directly from decoded JSON structure',
        inputSchema: {
          type: 'object',
          properties: {
            templeData: {
              type: 'object',
              description: 'The decoded temple data object with grid and room information',
            },
          },
          required: ['templeData'],
        },
      },
      {
        name: 'get_room_info',
        description: 'Get information about a specific room type in PoE2 Vaal Temple',
        inputSchema: {
          type: 'object',
          properties: {
            roomType: {
              type: 'string',
              description: "The room type name (e.g., 'alchemy_lab', 'vault', 'commander')",
            },
          },
          required: ['roomType'],
        },
      },
      {
        name: 'get_rating_criteria',
        description: 'Get the criteria and formulas used for calculating star ratings',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(
  CallToolRequestSchema,
  async (request: { params: { name: string; arguments?: Record<string, unknown> } }) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'analyze_temple': {
          const shareUrl = args?.shareUrl as string;
          const encodedData = extractShareData(shareUrl);

          if (!encodedData) {
            throw new Error('Could not extract temple data from URL');
          }

          const templeData = decodeTempleData(encodedData);

          if (!templeData) {
            throw new Error('Failed to decode temple data');
          }

          const analysis = analyzeTemple(templeData);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(analysis, null, 2),
              },
            ],
          };
        }

        case 'analyze_temple_data': {
          const templeData = args?.templeData as TempleData;
          const analysis = analyzeTemple(templeData);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(analysis, null, 2),
              },
            ],
          };
        }

        case 'get_room_info': {
          const roomType = args?.roomType as string;
          const roomInfo = ROOM_TYPES[roomType];

          if (!roomInfo) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Room type '${roomType}' not found in database`,
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(roomInfo, null, 2),
              },
            ],
          };
        }

        case 'get_rating_criteria': {
          const criteria = {
            description: 'Star rating is calculated based on two main factors:',
            rewardLayoutScore: {
              maxPoints: 40,
              description:
                'Based on reward room density (percentage of total rooms that are reward rooms)',
              formula: 'min(40, rewardDensity * 0.8)',
            },
            techScore: {
              maxPoints: 60,
              breakdown: {
                russianTech: {
                  points: 30,
                  condition: 'Perfect straight line path from entry to boss (deviation <= 0.5)',
                },
                romanRoad: {
                  points: 20,
                  condition: 'Near-straight path from entry to boss (deviation <= 1.5)',
                },
                straightLinePath: {
                  points: 10,
                  condition: 'Basic straight line path detected',
                },
                highRewardDensity: {
                  points: '10-20',
                  condition: '50%+ reward density bonus',
                },
                architectPlacement: {
                  points: 10,
                  condition: '2+ architect rooms',
                },
              },
            },
            totalScore: 'rewardLayoutScore + techScore (max 100)',
            starRating: {
              criteria: {
                '5 stars': '90-100 points',
                '4.5 stars': '75-89 points',
                '4 stars': '60-74 points',
                '3.5 stars': '45-59 points',
                '3 stars': '30-44 points',
                '2.5 stars': '15-29 points',
                '2 stars': '0-14 points',
              },
            },
            encoding: {
              format: 'Base-40 with 5-bit values',
              charset: CHARSETS[0],
              roomEncoding:
                '16 bits per room: 4 bits x + 4 bits y + 5 bits room type + 3 bits tier',
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

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('PoE2 Temple Analyzer MCP Server started');
}

main().catch(console.error);
