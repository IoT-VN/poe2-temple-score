# Phase 2: Scoring Formula Redesign

**Status**: Pending
**Effort**: 60 minutes
**Priority**: P1
**Depends On**: Phase 1 (Real Temple Data Analysis)

---

## Overview

Design new scoring formula that accurately rates all 6 real temples based on Phase 1 analysis.

---

## Context

Current formula issues:
- **Base score**: 105 max (snake 40 + rooms 50 + quantity 15)
- **Tech bonuses**: 370 max (Russian 150 + Roman 100 + Double 120)
- **Total max**: 475 points
- **Problem**: Tech bonuses 3.5x larger than base score

Current thresholds:
- 5★: 90+ (19% of max)
- 4★: 50+ (11% of max)
- 3★: 25+ (5% of max)

**Issue**: Thresholds too low, tech bonuses too high, quantity overvalued.

---

## Design Principles

1. **KISS**: Keep scoring simple and explainable
2. **Balance**: Base score should be primary, bonuses secondary
3. **Intuitive**: Higher tier rooms = higher score
4. **Quality > Quantity**: 10 T6 rooms > 20 T3 rooms
5. **Connectivity matters**: Snake chain is important but not dominant

---

## Proposed New Formula

### Component Breakdown

```typescript
// Base Score (0-100 points)
const baseScore = {
  // Snake Chain (0-25): Connectivity score
  snake: calculateSnakeScore(chainLength),

  // Room Quality (0-50): High-tier room value
  roomQuality: calculateRoomQuality(rooms),

  // Density (0-15): Reward room percentage
  density: calculateDensity(rewardRooms, totalRooms),

  // Layout Efficiency (0-10): Overall layout quality
  layout: calculateLayoutScore(rooms),
};

// Tech Bonuses (0-50 points) - REDUCED
const techBonuses = {
  russianTech: 25,    // Was 150 (reduced 6x)
  romanRoad: 15,      // Was 100 (reduced 6.7x)
  doubleTriple: 10,   // Was 120 (reduced 12x)
};

// Total Max: 150 points (100 base + 50 tech)
```

### New Thresholds

```typescript
const thresholds = {
  fiveStar: 120,    // 80% of max (was 19%)
  fourStar: 90,     // 60% of max (was 11%)
  threeStar: 60,    // 40% of max (was 5%)
  twoStar: 30,      // 20% of max (was 4%)
  oneStar: 0,
};
```

---

## Detailed Scoring Logic

### 1. Snake Chain Score (0-25)

**Purpose**: Reward connected reward rooms.

```typescript
function calculateSnakeScore(chainLength: number): number {
  if (chainLength >= 10) return 25;  // Perfect chain
  if (chainLength >= 8) return 22;
  if (chainLength >= 6) return 18;
  if (chainLength >= 5) return 14;
  if (chainLength >= 4) return 10;
  if (chainLength >= 3) return 6;
  if (chainLength >= 2) return 3;
  return 1;
}
```

**Rationale**: Reduced from 40 to 25 max. Connectivity important but not dominant.

---

### 2. Room Quality Score (0-50)

**Purpose**: Value high-tier rooms and special rooms.

```typescript
function calculateRoomQuality(rooms: Room[]): number {
  let score = 0;

  // T7 rooms: 10 points each (max 30 for 3 rooms)
  const t7Count = rooms.filter(r => r.tier >= 7).length;
  score += Math.min(30, t7Count * 10);

  // T6 rooms: 3 points each (max 15 for 5 rooms)
  const t6Count = rooms.filter(r => r.tier === 6).length;
  score += Math.min(15, t6Count * 3);

  // Special rooms
  const spymasters = rooms.filter(r => r.room === 'viper_spymaster').length;
  const golems = rooms.filter(r => r.room === 'golem_works').length;

  score += spymasters * 5;  // 5 points each
  score += golems * 3;      // 3 points each

  return Math.min(50, score);
}
```

**Rationale**:
- T7 rooms are most valuable (10 pts each)
- T6 rooms are good (3 pts each)
- Special rooms add bonus value
- Capped at 50 to prevent inflation

---

### 3. Density Score (0-15)

**Purpose**: Reward temples with good reward room percentage.

```typescript
function calculateDensity(rewardRooms: number, totalRooms: number): number {
  if (totalRooms === 0) return 0;

  const density = rewardRooms / totalRooms;

  // 50%+ density = full 15 points
  // 30% density = 9 points
  // 10% density = 3 points
  return Math.min(15, Math.round(density * 30));
}
```

**Rationale**: Density matters but shouldn't dominate. 50% density is excellent.

---

### 4. Layout Efficiency Score (0-10)

**Purpose**: Reward well-organized layouts.

```typescript
function calculateLayoutScore(rooms: Room[]): number {
  let score = 0;

  // Bonus for clustered high-tier rooms
  const highTierClusters = findClusters(rooms, 6);
  score += Math.min(5, highTierClusters.length * 2);

  // Penalty for isolated high-value rooms
  const isolated = findIsolatedRooms(rooms, 6);
  score -= isolated.length;

  return Math.max(0, Math.min(10, score));
}
```

**Rationale**: Reward good organization, penalize poor layouts.

---

### 5. Tech Bonuses (0-50)

**Reduced significantly** to prevent overwhelming base score.

```typescript
const TECH_BONUSES = {
  RUSSIAN_TECH: 25,    // 3+ connected T7 rooms
  ROMAN_ROAD: 15,      // 4+ connected T6+ rooms in line
  DOUBLE_TRIPLE: 10,   // 2+ clusters of 3+ T6+ rooms
};
```

**Rationale**: Tech patterns are bonuses, not the primary score driver.

---

## Expected Outcomes

### Temple #1 (Expected 5★)
- 22 rooms, 2 T6, 1 Golem, 1 Boss
- **Estimated new score**:
  - Snake: ~14 (5-room chain)
  - Room Quality: ~15 (2 T6 + 1 Golem)
  - Density: ~10 (good density)
  - Layout: ~5
  - Tech: ~0
  - **Total: ~44** → **Still too low!**

**Issue**: Need to re-evaluate what makes this temple 5★. May need to check if analysis is correct.

### Temple #3 (Expected 3★)
- 29 rooms, 2 Spymasters, 1 Golem, 3 T6
- **Estimated new score**:
  - Snake: ~18 (6-8 room chain)
  - Room Quality: ~29 (3 T6 + 2 Spy + 1 Golem)
  - Density: ~12 (high density)
  - Layout: ~5
  - Tech: ~0
  - **Total: ~64** → **3★** ✅

---

## Implementation Plan

### Step 1: Update Scoring Config (15 min)

File: `src/config/scoring-config.ts`

```typescript
export const RATING_THRESHOLDS: RatingThresholds = {
  fiveStar: 120,
  fourStar: 90,
  threeStar: 60,
  twoStar: 30,
  oneStar: 0,
};

export const SCORE_CRITERIA: ScoreCriteria = {
  maxScore: 150,
  weights: {
    snake: 25,
    roomQuality: 50,
    density: 15,
    layout: 10,
  },
};

export const TECH_BONUSES = {
  RUSSIAN_TECH: 25,
  ROMAN_ROAD: 15,
  DOUBLE_TRIPLE: 10,
};
```

### Step 2: Update Scorer Functions (30 min)

File: `src/core/scorer.ts`

Implement:
- `calculateSnakeScore()` - New thresholds
- `calculateRoomQuality()` - New room values
- `calculateDensity()` - New formula
- `calculateLayoutScore()` - New function
- `calculateOverallScore()` - Integrate all components

### Step 3: Update Analyzer (15 min)

File: `src/core/analyzer.ts`

Update `analyzeTemple()` to use new scoring functions.

---

## Testing Strategy

1. **Unit tests**: Test each scoring function independently
2. **Integration tests**: Test with real temple data
3. **Regression tests**: Ensure existing tests still pass
4. **Validation**: All 6 temples rate correctly

---

## Success Criteria

- New formula documented with clear rationale
- All 6 test temples rate correctly (±0.5 stars)
- Formula is explainable in plain English
- Code is clean and maintainable

---

## Unresolved Questions

1. **Temple #1 mystery**: Why is it expected 5★ with only 2 T6 and 1 Golem?
   - Need to verify the actual temple data
   - May have tech patterns not detected
   - May have T7 rooms not counted

2. **Layout efficiency**: How to measure "good organization"?
   - Clustering algorithm needed
   - Isolation detection needed

3. **Density threshold**: What's the ideal reward room percentage?
   - 50% seems high
   - 30% may be more realistic

---

## Next Steps

1. Complete Phase 1 analysis to verify temple characteristics
2. Adjust formula based on actual data
3. Implement new scoring functions
4. Test with all 6 temples
5. Iterate until all temples rate correctly
