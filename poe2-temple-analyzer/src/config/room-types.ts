/**
 * Room type definitions and mappings for PoE2 Temple
 */

/**
 * Room type ID to name mapping (based on PoE2 temple)
 */
export const ROOM_TYPE_IDS: { [key: number]: string } = {
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
export const ROOM_TYPES: { [key: string]: { type: string; rewardValue: number; isReward: boolean } } = {
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
 * Multiple charset versions for compatibility
 */
export const CHARSETS = [
  // Base-32 charset (newest)
  'ABCDEFHIJKMOQRSTWXYaceghijkopqwx',
  // Base-40 newest charset (2026)
  '056ABCEFGIJKMQSTWXYaceghijklnopqrwxy',
  // Base-40 newer charset
  '56ABCDEFGIJKMOQRSUWXYaceghjklpwxy',
  // Base-40 old charset (legacy)
  '56ABCDEFGHIKMQRSTWYaceghjklnopwxy',
];
