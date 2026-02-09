# Phase 3: Implementation

**Status**: Pending
**Effort**: 45 minutes
**Priority**: P1
**Depends On**: Phase 2 (Scoring Formula Redesign)

---

## Overview

Implement the new scoring system in the codebase.

---

## Context

Phase 2 designed a new scoring formula:
- Base score: 0-100 points (snake 25 + quality 50 + density 15 + layout 10)
- Tech bonuses: 0-50 points (Russian 25 + Roman 15 + Double 10)
- Total max: 150 points
- New thresholds: 120/90/60/30 for 5★/4★/3★/2★

---

## Files to Modify

### 1. `src/config/scoring-config.ts`

Update constants and thresholds.

### 2. `src/core/scorer.ts`

Refactor scoring functions with new formula.

### 3. `src/core/analyzer.ts`

Update integration with new scoring.

### 4. `src/types/scoring-types.ts`

Add new type definitions if needed.

---

## Implementation Steps

### Step 1: Update Scoring Config (10 min)

**File**: `src/config/scoring-config.ts`

```typescript
/**
 * Scoring configuration and thresholds for PoE2 Temple Analyzer
 */

import type { RatingThresholds, ScoreCriteria } from '../types/scoring-types.js';

/**
 * Star rating thresholds (based on max score of 150)
 */
export const RATING_THRESHOLDS: RatingThresholds = {
  fiveStar: 120,   // 80% of max
  fourStar: 90,    // 60% of max
  threeStar: 60,   // 40% of max
  twoStar: 30,     // 20% of max
  oneStar: 0,
};

/**
 * Score calculation criteria and weights
 */
export const SCORE_CRITERIA: ScoreCriteria = {
  maxScore: 150, // Base 100 (snake 25 + quality 50 + density 15 + layout 10) + Tech 50
  weights: {
    snake: 25,
    roomQuality: 50,
    density: 15,
    layout: 10,
  },
};

/**
 * Tech pattern bonuses (reduced from previous values)
 */
export const TECH_BONUSES = {
  RUSSIAN_TECH: 25,    // Was 150 - 3+ connected T7 rooms
  ROMAN_ROAD: 15,      // Was 100 - 4+ connected T6+ rooms in line
  DOUBLE_TRIPLE: 10,   // Was 120 - 2+ clusters of 3+ T6+ rooms
};

/**
 * Snake score thresholds
 */
export const SNAKE_THRESHOLDS = {
  T10: 25,
  T8: 22,
  T6: 18,
  T5: 14,
  T4: 10,
  T3: 6,
  T2: 3,
  T1: 1,
};

/**
 * Room scoring values
 */
export const ROOM_VALUES = {
  T7_ROOM: 10,
  T6_ROOM: 3,
  SPYMASTER: 5,
  GOLEM: 3,
  T5_ROOM: 1,
};

/**
 * Density multiplier
 */
export const DENSITY_MULTIPLIER = 30; // density * 30 = score
```

---

### Step 2: Update Scorer Functions (25 min)

**File**: `src/core/scorer.ts`

#### 2.1 Update `calculateOverallScore()`

```typescript
export function calculateOverallScore(
  snakeScore: number,
  roomQualityScore: number,
  densityScore: number,
  layoutScore: number,
  techScore: number
): number {
  return Math.round(snakeScore + roomQualityScore + densityScore + layoutScore + techScore);
}
```

#### 2.2 Update `calculateStarRating()`

```typescript
export function calculateStarRating(totalScore: number): number {
  if (totalScore >= RATING_THRESHOLDS.fiveStar) return 5;
  if (totalScore >= RATING_THRESHOLDS.fourStar) return 4;
  if (totalScore >= RATING_THRESHOLDS.threeStar) return 3;
  if (totalScore >= RATING_THRESHOLDS.twoStar) return 2;
  return 1;
}
```

#### 2.3 Update `calculateSnakeScore()`

```typescript
import { SNAKE_THRESHOLDS } from '../config/scoring-config';

export function calculateSnakeScore(chainLength: number): number {
  if (chainLength >= 10) return SNAKE_THRESHOLDS.T10;
  if (chainLength >= 8) return SNAKE_THRESHOLDS.T8;
  if (chainLength >= 6) return SNAKE_THRESHOLDS.T6;
  if (chainLength >= 5) return SNAKE_THRESHOLDS.T5;
  if (chainLength >= 4) return SNAKE_THRESHOLDS.T4;
  if (chainLength >= 3) return SNAKE_THRESHOLDS.T3;
  if (chainLength >= 2) return SNAKE_THRESHOLDS.T2;
  return SNAKE_THRESHOLDS.T1;
}
```

#### 2.4 New: `calculateRoomQualityScore()`

```typescript
import { ROOM_VALUES } from '../config/scoring-config';

export function calculateRoomQualityScore(rooms: Room[]): number {
  let score = 0;

  // T7 rooms: 10 points each (max 30)
  const t7Count = rooms.filter(r => (r.tier || 0) >= 7).length;
  score += Math.min(30, t7Count * ROOM_VALUES.T7_ROOM);

  // T6 rooms: 3 points each (max 15)
  const t6Count = rooms.filter(r => (r.tier || 0) === 6).length;
  score += Math.min(15, t6Count * ROOM_VALUES.T6_ROOM);

  // Special rooms
  const spymasters = rooms.filter(r => r.room === 'viper_spymaster').length;
  const golems = rooms.filter(r => r.room === 'golem_works').length;

  score += spymasters * ROOM_VALUES.SPYMASTER;
  score += golems * ROOM_VALUES.GOLEM;

  // T5 rooms: 1 point each (max 5)
  const t5Count = rooms.filter(r => (r.tier || 0) === 5).length;
  score += Math.min(5, t5Count * ROOM_VALUES.T5_ROOM);

  return Math.min(50, score);
}
```

#### 2.5 New: `calculateDensityScore()`

```typescript
import { DENSITY_MULTIPLIER } from '../config/scoring-config';

export function calculateDensityScore(rewardRooms: number, totalRooms: number): number {
  if (totalRooms === 0) return 0;

  const density = rewardRooms / totalRooms;
  const score = Math.round(density * DENSITY_MULTIPLIER);

  return Math.min(15, score);
}
```

#### 2.6 New: `calculateLayoutScore()`

```typescript
export function calculateLayoutScore(rooms: Room[]): number {
  let score = 0;

  const highTierRooms = rooms.filter(r => (r.tier || 0) >= 6);
  if (highTierRooms.length < 2) return 0;

  // Find clusters of adjacent high-tier rooms
  const clusters = findConnectedClusters(highTierRooms);
  score += Math.min(5, clusters.length * 2);

  // Penalty for isolated high-tier rooms
  const isolated = findIsolatedRooms(highTierRooms, clusters);
  score -= Math.min(3, isolated.length);

  return Math.max(0, Math.min(10, score));
}

function findConnectedClusters(rooms: Room[]): Room[][] {
  const clusters: Room[][] = [];
  const visited = new Set<string>();

  for (const room of rooms) {
    const key = `${room.x},${room.y}`;
    if (visited.has(key)) continue;

    const cluster = getConnectedRooms(rooms, room, visited);
    if (cluster.length >= 2) {
      clusters.push(cluster);
    }
  }

  return clusters;
}

function getConnectedRooms(rooms: Room[], start: Room, visited: Set<string>): Room[] {
  const cluster: Room[] = [];
  const queue = [start];
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    cluster.push(current);

    for (const room of rooms) {
      const key = `${room.x},${room.y}`;
      if (visited.has(key)) continue;

      const dx = Math.abs(room.x - current.x);
      const dy = Math.abs(room.y - current.y);

      if (dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0)) {
        visited.add(key);
        queue.push(room);
      }
    }
  }

  return cluster;
}

function findIsolatedRooms(rooms: Room[], clusters: Room[][]): Room[] {
  const clusteredRooms = new Set(
    clusters.flatMap(c => c.map(r => `${r.x},${r.y}`))
  );

  return rooms.filter(r => !clusteredRooms.has(`${r.x},${r.y}`));
}
```

---

### Step 3: Update Analyzer (10 min)

**File**: `src/core/analyzer.ts`

Update `analyzeTemple()` function:

```typescript
export function analyzeTemple(templeData: TempleData): TempleAnalysis {
  // ... existing code ...

  // Calculate metrics
  const chainLength = bestChain.length;
  const snakeScore = calculateSnakeScore(chainLength);

  // NEW: Use separate scoring functions
  const roomQualityScore = calculateRoomQualityScore(rewardRooms);
  const densityScore = calculateDensityScore(rewardRooms.length, rooms.length);
  const layoutScore = calculateLayoutScore(rewardRooms);

  // Tech pattern analysis
  const techAnalysis = analyzeTechPatterns(templeData);

  // Total score (0-150): base (100) + tech (50)
  const totalScore = calculateOverallScore(
    snakeScore,
    roomQualityScore,
    densityScore,
    layoutScore,
    techAnalysis.totalTechScore
  );

  // ... rest of function ...
}
```

---

## Build Verification

After implementation, verify build succeeds:

```bash
cd poe2-temple-analyzer
npm run build
```

Expected: No TypeScript errors, dist folder generated.

---

## Success Criteria

- All code compiles without errors
- New scoring values match Phase 2 design
- No breaking changes to public API
- Backward compatibility maintained

---

## Next Steps

1. Complete implementation
2. Run build to verify no errors
3. Proceed to Phase 4: Testing & Validation
