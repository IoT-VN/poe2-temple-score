/**
 * Temple data decoding functionality
 */

import type { TempleData, Room } from '../types/temple-types';
import { CHARSETS, ROOM_TYPE_IDS } from '../config/room-types';

/**
 * Decode a single room from bit string
 *
 * @param bitString - The bit string to decode from
 * @param pos - Starting position in bit string
 * @returns Room object and next position, or null if invalid
 * @internal
 */
function decodeRoom(bitString: string, pos: number): { room: Room; nextPos: number } | null {
  if (pos + 16 > bitString.length) return null;

  const x = parseInt(bitString.substring(pos, pos + 4), 2);
  const y = parseInt(bitString.substring(pos + 4, pos + 8), 2);
  const roomTypeId = parseInt(bitString.substring(pos + 8, pos + 13), 2);
  const tier = parseInt(bitString.substring(pos + 13, pos + 16), 2);

  if (x >= 16 || y >= 16 || roomTypeId > 31) {
    return { room: {} as Room, nextPos: pos + 16 };
  }

  const roomName = ROOM_TYPE_IDS[roomTypeId] || `unknown_${roomTypeId}`;

  return {
    room: {
      x,
      y,
      room: roomName,
      tier,
      roomTypeId,
    },
    nextPos: pos + 16,
  };
}

/**
 * Decode all rooms from bit string
 */
function decodeRooms(bitString: string): { grid: { [key: string]: Room }; decodedRooms: Room[] } {
  const grid: { [key: string]: Room } = {};
  const decodedRooms: Room[] = [];
  let pos = 0;

  while (pos + 16 <= bitString.length) {
    const result = decodeRoom(bitString, pos);
    if (!result) break;

    const { room, nextPos } = result;
    pos = nextPos;

    if (room.x !== undefined && room.room) {
      const key = `${room.x},${room.y}`;
      grid[key] = room;
      decodedRooms.push(room);
    }
  }

  return { grid, decodedRooms };
}

/**
 * Attempt decoding with a specific charset
 */
function tryDecodeWithCharset(encoded: string, charset: string): TempleData | null {
  const charsetCharToVal: { [key: string]: number } = {};
  charset.split('').forEach((c, i) => (charsetCharToVal[c] = i));

  const values = encoded.split('').map((c) => charsetCharToVal[c]);

  if (values.some((v) => v === undefined)) {
    return null;
  }

  let bitString = '';
  values.forEach((v) => {
    bitString += v.toString(2).padStart(5, '0');
  });

  const { grid, decodedRooms } = decodeRooms(bitString);

  if (Object.keys(grid).length > 5) {
    return { grid, decodedRooms };
  }

  return null;
}

/**
 * Decode temple data from encoded share string
 *
 * Auto-detects charset and decodes bit-encoded temple layout
 *
 * @param encoded - The encoded temple string from share URL
 * @returns Decoded temple data with grid and rooms, or null if invalid
 *
 * @example
 * ```ts
 * const encoded = 'ABC123XYZ';
 * const temple = decodeTempleData(encoded);
 * if (temple) {
 *   console.log(`Decoded ${temple.decodedRooms?.length} rooms`);
 * }
 * ```
 */
export function decodeTempleData(encoded: string): TempleData | null {
  try {
    if (!encoded) return null;

    // Handle base64-encoded temple data (newer format)
    // Check if it looks like base64 (alphanumeric + /+ =)
    const looksLikeBase64 = /^[A-Za-z0-9+/=]+$/.test(encoded);

    let workingString = encoded;
    if (looksLikeBase64) {
      try {
        // Try base64 decode first
        const base64Decoded = Buffer.from(encoded, 'base64').toString('utf-8');
        if (base64Decoded && base64Decoded.length > 0) {
          workingString = base64Decoded;
          console.log('Base64 decoded temple data');
        }
      } catch (e) {
        // If base64 fails, use original string
        console.log('Not base64 encoded, using original string');
      }
    }

    // Auto-detect charset from unique characters in the string
    const uniqueChars = [...new Set(workingString)].sort().join('');

    // Try auto-detected charset first
    const charToVal: { [key: string]: number } = {};
    uniqueChars.split('').forEach((c, i) => (charToVal[c] = i));

    const values = workingString.split('').map((c) => charToVal[c]);

    // Check if encoding is valid (all values should be 0-31 for 5-bit)
    if (!values.some((v) => v === undefined) && Math.max(...values) <= 31) {
      let bitString = '';
      values.forEach((v) => {
        bitString += v.toString(2).padStart(5, '0');
      });

      const { grid, decodedRooms } = decodeRooms(bitString);

      if (Object.keys(grid).length > 5) {
        console.log(`Auto-detected charset with ${uniqueChars.length} characters`);
        return { grid, decodedRooms };
      }
    }

    // Fall back to known charsets
    for (const charset of CHARSETS) {
      const result = tryDecodeWithCharset(workingString, charset);
      if (result) {
        return result;
      }
    }

    throw new Error('Could not decode temple data');
  } catch (error) {
    console.error('Error decoding temple data:', error);
    return null;
  }
}

/**
 * Parse temple data from array format
 *
 * Common in PoE2 temple builder tools
 *
 * @param data - Array of room objects
 * @returns Temple data with populated grid
 *
 * @example
 * ```ts
 * const data = [{ x: 0, y: 0, room: 'alchemy_lab', tier: 5 }];
 * const temple = parseTempleArray(data);
 * ```
 */
export function parseTempleArray(data: any[]): TempleData {
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
