/**
 * MCP Tool: Get room information
 */

import { ROOM_TYPES } from '../config/room-types';

export const name = 'get_room_info';
export const description = 'Get information about a specific room type in PoE2 Vaal Temple';

export const inputSchema = {
  type: 'object',
  properties: {
    roomType: {
      type: 'string',
      description: "The room type name (e.g., 'alchemy_lab', 'vault', 'commander')",
    },
  },
  required: ['roomType'],
} as const;

export async function handler(args: { roomType: string }): Promise<{
  content: { type: string; text: string }[];
}> {
  const roomType = args.roomType;
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
