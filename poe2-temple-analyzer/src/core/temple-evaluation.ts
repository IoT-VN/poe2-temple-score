/**
 * Temple evaluation system for analyzing game mechanics impact
 *
 * Evaluates:
 * - Chained room bonuses and synergies
 * - Monster scaling and difficulty
 * - Loot modifiers and farming potential
 * - Risk vs reward assessment
 */

import type { TempleData, Room } from '../types/temple-types';

export interface ChainedRoomBonus {
  type: string;
  description: string;
  rooms: Room[];
  multiplier: number;
}

export interface StackedBonus {
  roomType: string;
  count: number;
  baseValue: number;
  actualValue: number;
  diminishingReturn: number; // Percentage of value lost to DR
}

export interface MonsterScaling {
  averageTier: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Very Hard' | 'Extreme';
  monsterDensity: number; // 0-100
  rareMonsterChance: number; // 0-100
  bossPresent: boolean;
}

export interface LootModifiers {
  currencyMultiplier: number;
  rareItemChance: number;
  uniqueItemChance: number;
  corruptionAvailable: boolean;
  sacrificeValue: number;
}

export interface FarmingAssessment {
  currencyFarming: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Outstanding';
  rareMonsterFarming: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Outstanding';
  itemFarming: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Outstanding';
  overallSuitability: string;
}

export interface RiskRewardAnalysis {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High' | 'Extreme';
  rewardPotential: 'Low' | 'Medium' | 'High' | 'Very High' | 'Exceptional';
  recommendation: string;
  timeInvestment: 'Quick' | 'Moderate' | 'Long' | 'Very Long';
}

export interface TempleEvaluation {
  chainedBonuses: ChainedRoomBonus[];
  stackedBonuses: StackedBonus[];
  monsterScaling: MonsterScaling;
  lootModifiers: LootModifiers;
  farmingAssessment: FarmingAssessment;
  riskReward: RiskRewardAnalysis;
}

/**
 * Calculate chained room bonuses
 */
function analyzeChainedRooms(rooms: Room[]): ChainedRoomBonus[] {
  const bonuses: ChainedRoomBonus[] = [];
  const highTierRooms = rooms.filter((r) => (r.tier || 0) >= 6);

  // Find connected high-tier chains
  const visited = new Set<string>();
  highTierRooms.forEach((room) => {
    const key = `${room.x},${room.y}`;
    if (visited.has(key)) return;

    const chain = findConnectedChain(highTierRooms, room, visited);
    if (chain.length >= 3) {
      const avgTier = chain.reduce((sum, r) => sum + (r.tier || 0), 0) / chain.length;
      bonuses.push({
        type: 'high_tier_chain',
        description: `${chain.length} connected T${Math.floor(avgTier)}+ rooms`,
        rooms: chain,
        multiplier: 1 + chain.length * 0.15, // 15% per room
      });
    }
  });

  return bonuses;
}

function findConnectedChain(rooms: Room[], start: Room, visited: Set<string>): Room[] {
  const chain: Room[] = [start];
  visited.add(`${start.x},${start.y}`);

  rooms.forEach((room) => {
    const key = `${room.x},${room.y}`;
    if (visited.has(key)) return;

    const isAdjacent = Math.abs(room.x - start.x) <= 1 && Math.abs(room.y - start.y) <= 1;
    if (isAdjacent) {
      chain.push(...findConnectedChain(rooms, room, visited));
    }
  });

  return chain;
}

/**
 * Calculate stacked room bonuses with diminishing returns
 */
function analyzeStackedBonuses(rooms: Room[]): StackedBonus[] {
  const bonuses: StackedBonus[] = [];
  const roomCounts = new Map<string, number>();

  // Count room types
  rooms.forEach((room) => {
    if (room.room && room.room !== 'empty' && room.room !== 'path') {
      roomCounts.set(room.room, (roomCounts.get(room.room) || 0) + 1);
    }
  });

  // Calculate bonuses with DR
  const valuableRooms = ['golem_works', 'viper_spymaster', 'thaumaturge'];
  valuableRooms.forEach((roomType) => {
    const count = roomCounts.get(roomType) || 0;
    if (count > 0) {
      const baseValue = 100;
      const drFactor = count > 1 ? Math.pow(0.7, count - 1) : 1; // 30% DR per additional room
      const actualValue = baseValue * count * drFactor;
      const drPercent = count > 1 ? (1 - drFactor) * 100 : 0;

      bonuses.push({
        roomType,
        count,
        baseValue,
        actualValue: Math.round(actualValue),
        diminishingReturn: Math.round(drPercent),
      });
    }
  });

  return bonuses;
}

/**
 * Analyze monster scaling and difficulty
 */
function analyzeMonsterScaling(rooms: Room[]): MonsterScaling {
  const rewardRooms = rooms.filter((r) => r.room !== 'empty' && r.room !== 'path');
  const avgTier =
    rewardRooms.reduce((sum, r) => sum + (r.tier || 0), 0) / (rewardRooms.length || 1);

  const t7Count = rooms.filter((r) => (r.tier || 0) >= 7).length;
  const t6Count = rooms.filter((r) => (r.tier || 0) === 6).length;
  const bossPresent = rooms.some((r) => r.room === 'boss' || r.room === 'atziri');

  // Calculate difficulty
  let difficulty: MonsterScaling['difficulty'] = 'Easy';
  if (avgTier >= 6.5 || t7Count >= 3) difficulty = 'Extreme';
  else if (avgTier >= 6 || t7Count >= 2) difficulty = 'Very Hard';
  else if (avgTier >= 5 || t6Count >= 4) difficulty = 'Hard';
  else if (avgTier >= 4) difficulty = 'Moderate';

  // Monster density based on room count and tier
  const monsterDensity = Math.min(100, (rewardRooms.length / 25) * 100 + avgTier * 5);

  // Rare monster chance increases with tier
  const rareMonsterChance = Math.min(100, avgTier * 12 + t7Count * 10);

  return {
    averageTier: Math.round(avgTier * 10) / 10,
    difficulty,
    monsterDensity: Math.round(monsterDensity),
    rareMonsterChance: Math.round(rareMonsterChance),
    bossPresent,
  };
}

/**
 * Calculate loot modifiers
 */
function analyzeLootModifiers(rooms: Room[]): LootModifiers {
  const t7Count = rooms.filter((r) => (r.tier || 0) >= 7).length;
  const t6Count = rooms.filter((r) => (r.tier || 0) === 6).length;
  const hasCorruption = rooms.some((r) => r.room === 'corruption');
  const hasSacrifice = rooms.some(
    (r) => r.room === 'sacrifice' || r.room === 'sacrificial_chamber'
  );
  const currencyRooms = rooms.filter(
    (r) => r.room === 'reward_currency' || r.room === 'vault'
  ).length;

  const currencyMultiplier = 1 + t7Count * 0.3 + t6Count * 0.15 + currencyRooms * 0.25;
  const rareItemChance = Math.min(100, 20 + t7Count * 15 + t6Count * 8);
  const uniqueItemChance = Math.min(50, 5 + t7Count * 8 + t6Count * 3);
  const sacrificeValue = hasSacrifice ? (t7Count + t6Count) * 10 : 0;

  return {
    currencyMultiplier: Math.round(currencyMultiplier * 100) / 100,
    rareItemChance: Math.round(rareItemChance),
    uniqueItemChance: Math.round(uniqueItemChance),
    corruptionAvailable: hasCorruption,
    sacrificeValue,
  };
}

/**
 * Assess farming suitability
 */
function assessFarming(loot: LootModifiers, scaling: MonsterScaling): FarmingAssessment {
  const ratings = ['Poor', 'Fair', 'Good', 'Excellent', 'Outstanding'] as const;

  // Currency farming based on multiplier
  const currencyRating =
    loot.currencyMultiplier >= 2.5
      ? 4
      : loot.currencyMultiplier >= 2.0
        ? 3
        : loot.currencyMultiplier >= 1.5
          ? 2
          : loot.currencyMultiplier >= 1.2
            ? 1
            : 0;

  // Rare monster farming based on chance and density
  const rareScore = (scaling.rareMonsterChance + scaling.monsterDensity) / 2;
  const rareRating =
    rareScore >= 80 ? 4 : rareScore >= 60 ? 3 : rareScore >= 40 ? 2 : rareScore >= 20 ? 1 : 0;

  // Item farming based on rare/unique chances
  const itemScore = loot.rareItemChance + loot.uniqueItemChance;
  const itemRating =
    itemScore >= 100 ? 4 : itemScore >= 70 ? 3 : itemScore >= 40 ? 2 : itemScore >= 20 ? 1 : 0;

  const suitability =
    currencyRating >= 3 && rareRating >= 3
      ? 'Excellent all-around farming temple'
      : currencyRating >= 3
        ? 'Best for currency farming'
        : rareRating >= 3
          ? 'Best for rare monster farming'
          : itemRating >= 3
            ? 'Best for item farming'
            : 'Moderate farming potential';

  return {
    currencyFarming: ratings[currencyRating],
    rareMonsterFarming: ratings[rareRating],
    itemFarming: ratings[itemRating],
    overallSuitability: suitability,
  };
}

/**
 * Analyze risk vs reward
 */
function analyzeRiskReward(
  scaling: MonsterScaling,
  loot: LootModifiers,
  rooms: Room[]
): RiskRewardAnalysis {
  const riskLevels = ['Low', 'Medium', 'High', 'Very High', 'Extreme'] as const;
  const rewardLevels = ['Low', 'Medium', 'High', 'Very High', 'Exceptional'] as const;

  // Risk based on difficulty and boss
  let riskIndex =
    scaling.difficulty === 'Easy'
      ? 0
      : scaling.difficulty === 'Moderate'
        ? 1
        : scaling.difficulty === 'Hard'
          ? 2
          : scaling.difficulty === 'Very Hard'
            ? 3
            : 4;
  if (scaling.bossPresent) riskIndex = Math.min(4, riskIndex + 1);

  // Reward based on loot multipliers
  const rewardScore =
    loot.currencyMultiplier + loot.rareItemChance / 50 + loot.uniqueItemChance / 25;
  const rewardIndex =
    rewardScore >= 4.5
      ? 4
      : rewardScore >= 3.5
        ? 3
        : rewardScore >= 2.5
          ? 2
          : rewardScore >= 1.5
            ? 1
            : 0;

  // Time investment based on room count and difficulty
  const roomCount = rooms.filter((r) => r.room !== 'empty' && r.room !== 'path').length;
  const timeInvestment =
    roomCount >= 20 && riskIndex >= 3
      ? 'Very Long'
      : roomCount >= 15 || riskIndex >= 3
        ? 'Long'
        : roomCount >= 10
          ? 'Moderate'
          : 'Quick';

  // Recommendation
  const recommendation =
    rewardIndex > riskIndex + 1
      ? 'Highly recommended - great rewards for the risk'
      : rewardIndex > riskIndex
        ? 'Recommended - good risk/reward balance'
        : rewardIndex === riskIndex
          ? 'Balanced - moderate risk and reward'
          : 'Challenging - high risk, consider your build strength';

  return {
    riskLevel: riskLevels[riskIndex],
    rewardPotential: rewardLevels[rewardIndex],
    recommendation,
    timeInvestment,
  };
}

/**
 * Evaluate temple comprehensively
 */
export function evaluateTemple(templeData: TempleData): TempleEvaluation {
  const rooms = Object.values(templeData.grid || {});

  const chainedBonuses = analyzeChainedRooms(rooms);
  const stackedBonuses = analyzeStackedBonuses(rooms);
  const monsterScaling = analyzeMonsterScaling(rooms);
  const lootModifiers = analyzeLootModifiers(rooms);
  const farmingAssessment = assessFarming(lootModifiers, monsterScaling);
  const riskReward = analyzeRiskReward(monsterScaling, lootModifiers, rooms);

  return {
    chainedBonuses,
    stackedBonuses,
    monsterScaling,
    lootModifiers,
    farmingAssessment,
    riskReward,
  };
}
