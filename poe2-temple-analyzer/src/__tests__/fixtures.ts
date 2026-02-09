/**
 * Test fixtures for temple analyzer tests
 */

import type { TempleData, Room } from '../types/temple-types';

/**
 * Valid share URLs for testing
 */
export const FIXTURE_URLS = {
  valid: 'http://localhost:8080/#/atziri-temple?t=ABC123',
  missingParam: 'http://localhost:8080/#/atziri-temple',
  malformed: 'not-a-url',
  javascriptProtocol: 'javascript:alert(1)',
  dataProtocol: 'data:text/html,<script>alert(1)</script>',
};

/**
 * Sample temple data for testing
 */
export const createEmptyTemple = (): TempleData => ({
  grid: {},
});

export const createSingleRoomTemple = (): TempleData => ({
  grid: {
    '0,0': {
      x: 0,
      y: 0,
      room: 'alchemy_lab',
      tier: 5,
    },
  },
});

export const createMultiRoomTemple = (): TempleData => {
  const grid: { [key: string]: Room } = {};

  // Create 5 connected alchemy labs (good snake)
  for (let i = 0; i < 5; i++) {
    grid[`${i},${i}`] = {
      x: i,
      y: i,
      room: 'alchemy_lab',
      tier: 5,
    };
  }

  return { grid };
};

export const createHighValueTemple = (): TempleData => {
  const grid: { [key: string]: Room } = {};

  // 3 T7 spymasters connected
  for (let i = 0; i < 3; i++) {
    grid[`${i},0`] = {
      x: i,
      y: 0,
      room: 'viper_spymaster',
      tier: 7,
    };
  }

  // Add some T6 rooms
  for (let i = 0; i < 3; i++) {
    grid[`${i},1`] = {
      x: i,
      y: 1,
      room: 'golem_works',
      tier: 6,
    };
  }

  return { grid };
};

export const createPoorTemple = (): TempleData => ({
  grid: {
    '0,0': {
      x: 0,
      y: 0,
      room: 'empty',
      tier: 1,
    },
    '5,5': {
      x: 5,
      y: 5,
      room: 'path',
      tier: 1,
    },
  },
});

/**
 * Temple with duplicate rooms (should be filtered)
 */
export const createTempleWithDuplicates = (): TempleData => {
  const grid: { [key: string]: Room } = {};

  // Same room type at same coordinates
  grid['0,0'] = {
    x: 0,
    y: 0,
    room: 'alchemy_lab',
    tier: 5,
  };

  grid['1,0'] = {
    x: 1,
    y: 0,
    room: 'alchemy_lab',
    tier: 5,
  };

  return { grid };
};

/**
 * Temple with all room types
 */
export const createCompleteTemple = (): TempleData => {
  const roomTypes = [
    'alchemy_lab',
    'armoury',
    'corruption',
    'vault',
    'viper_spymaster',
    'golem_works',
  ];

  const grid: { [key: string]: Room } = {};

  roomTypes.forEach((room, i) => {
    grid[`${i},0`] = {
      x: i,
      y: 0,
      room,
      tier: 5 + (i % 3),
    };
  });

  return { grid };
};

/**
 * Test room for scoring
 */
export const createTestRoom = (
  room: string,
  tier: number,
  x: number = 0,
  y: number = 0
): Room => ({
  x,
  y,
  room,
  tier,
});

/**
 * Expected scores for different room types
 */
export const EXPECTED_ROOM_VALUES = {
  viper_spymaster: 50, // base 10 * tier 5 multiplier
  golem_works: 36, // base 9 * tier 4 multiplier
  vault: 32, // base 8 * tier 4 multiplier
  reward_currency: 28, // base 7 * tier 4 multiplier
  alchemy_lab: 24, // base 6 * tier 4 multiplier
};
