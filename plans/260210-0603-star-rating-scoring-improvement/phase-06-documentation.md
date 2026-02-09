# Phase 6: Documentation

**Status**: Pending
**Effort**: 30 minutes
**Priority**: P2
**Depends On**: Phase 5 (Edge Cases & Refinement)

---

## Overview

Update documentation to reflect the new scoring system.

---

## Files to Update

### 1. README.md

Update scoring section with new formula.

### 2. docs/api-reference.md

Update API documentation with new score breakdown.

### 3. CHANGELOG.md

Add entry for scoring system changes.

---

## Implementation Steps

### Step 1: Update README.md (15 min)

**File**: `README.md`

Replace the "Rating Criteria" section:

```markdown
## Rating Criteria

The star rating is calculated based on multiple factors with a maximum score of 150 points.

### Scoring Components

#### 1. Snake Chain Score (0-25 points)
Rewards connected reward rooms forming a "snake chain".

| Chain Length | Points |
|--------------|--------|
| 10+ rooms | 25 |
| 8-9 rooms | 22 |
| 6-7 rooms | 18 |
| 5 rooms | 14 |
| 4 rooms | 10 |
| 3 rooms | 6 |
| 2 rooms | 3 |
| 1 room | 1 |

#### 2. Room Quality Score (0-50 points)
Based on high-tier rooms and special room types.

| Room Type | Points | Max |
|-----------|--------|-----|
| T7 rooms | 10 each | 30 |
| T6 rooms | 3 each | 15 |
| Spymasters | 5 each | - |
| Golems | 3 each | - |
| T5 rooms | 1 each | 5 |

**Total capped at 50 points**

#### 3. Density Score (0-15 points)
Reward room percentage of total rooms.

- Formula: `(rewardRooms / totalRooms) * 30`
- Capped at 15 points
- 50%+ density = full 15 points

#### 4. Layout Efficiency Score (0-10 points)
Rewards well-organized layouts with clustered high-tier rooms.

- Clustered high-tier rooms: +2 per cluster (max 5)
- Isolated high-tier rooms: -1 per room (max -3)

#### 5. Tech Pattern Bonuses (0-50 points)
Special layout patterns provide bonus points.

| Tech Pattern | Points | Condition |
|--------------|--------|-----------|
| Russian Tech | 25 | 3+ connected T7 rooms |
| Roman Road | 15 | 4+ connected T6+ rooms in line |
| Double Triple | 10 | 2+ clusters of 3+ T6+ rooms |

### Star Rating Thresholds

| Stars | Score Range | Description |
|-------|-------------|-------------|
| ⭐⭐⭐⭐⭐ | 120-150 | God Tier - Exceptional temple |
| ⭐⭐⭐⭐ | 90-119 | Excellent - Very strong layout |
| ⭐⭐⭐ | 60-89 | Good - Solid temple |
| ⭐⭐ | 30-59 | Below Average - Needs improvement |
| ⭐ | 0-29 | Poor - Significant issues |

### Scoring Philosophy

The new scoring system prioritizes:
1. **Quality over Quantity**: High-tier rooms are more valuable than many low-tier rooms
2. **Connectivity**: Snake chains are important but not dominant
3. **Balance**: Base score (100) is primary, tech bonuses (50) are secondary
4. **Intuitive**: Higher scores correlate with better temples
```

---

### Step 2: Update API Reference (10 min)

**File**: `docs/api-reference.md`

Add new section:

```markdown
## Scoring System

### Score Breakdown

The `TempleAnalysis` object includes detailed score components:

```typescript
interface TempleAnalysis {
  // Score components
  snakeScore: number;        // 0-25: Snake chain connectivity
  roomScore: number;         // 0-50: Room quality
  quantityScore: number;     // 0-15: Reward room density
  layoutScore: number;       // 0-10: Layout efficiency
  techScore: number;         // 0-50: Tech pattern bonuses
  totalScore: number;        // 0-150: Total score
  starRating: number;        // 1-5: Star rating

  // Metrics
  rewardRooms: number;
  highTierRooms: number;
  spymasters: number;
  golems: number;
  t7Rooms: number;
  t6Rooms: number;

  // Tech patterns
  techBonuses: TechBonus[];
  hasRussianTech: boolean;
  hasRomanRoad: boolean;
  hasDoubleTriple: boolean;

  // Suggestions
  suggestions: string[];
}
```

### Example Analysis

```typescript
const result = analyzeTemple(templeData);

console.log(`Total Score: ${result.totalScore}/150`);
console.log(`Star Rating: ${result.starRating}★`);
console.log(`\nScore Breakdown:`);
console.log(`  Snake Chain: ${result.snakeScore}/25`);
console.log(`  Room Quality: ${result.roomScore}/50`);
console.log(`  Density: ${result.quantityScore}/15`);
console.log(`  Layout: ${result.layoutScore}/10`);
console.log(`  Tech Bonuses: ${result.techScore}/50`);

if (result.techBonuses.some(b => b.detected)) {
  console.log(`\nTech Patterns Detected:`);
  result.techBonuses
    .filter(b => b.detected)
    .forEach(b => console.log(`  - ${b.name}: +${b.score} pts`));
}

console.log(`\nSuggestions:`);
result.suggestions.forEach(s => console.log(`  - ${s}`));
```
```

---

### Step 3: Update CHANGELOG.md (5 min)

**File**: `CHANGELOG.md`

Add new entry:

```markdown
## [2.0.0] - 2026-02-10

### Changed

**BREAKING: Scoring System Redesign**

Completely redesigned the star rating scoring system for improved accuracy based on real temple data analysis.

#### New Scoring Formula

- **Total Max Score**: 150 points (was 475)
- **Base Score**: 100 points (snake 25 + quality 50 + density 15 + layout 10)
- **Tech Bonuses**: 50 points (Russian 25 + Roman 15 + Double 10)

#### New Thresholds

- 5★: 120+ (80% of max) - was 90+ (19% of max)
- 4★: 90+ (60% of max) - was 50+ (11% of max)
- 3★: 60+ (40% of max) - was 25+ (5% of max)
- 2★: 30+ (20% of max) - was 18+ (4% of max)
- 1★: 0-29 - was 0-17

#### Key Changes

1. **Reduced tech bonus impact**: Tech bonuses reduced from 370 to 50 max (6-12x reduction)
2. **Balanced components**: Base score is now primary driver, not tech bonuses
3. **Quality over quantity**: High-tier rooms weighted more heavily
4. **Layout efficiency**: New component rewards clustered high-tier rooms
5. **Realistic thresholds**: 5★ now requires 80% of max score (was 19%)

#### Validation

Tested against 6 real temple layouts:
- Temple #1: Now correctly rates 5★ (was 3★)
- Temple #3: Now correctly rates 3★ (was 4★)
- All other temples rate correctly

### Added

- New `layoutScore` component (0-10 points)
- Clustering algorithm for high-tier rooms
- Isolation penalty for disconnected high-tier rooms
- Improved suggestions for edge cases

### Fixed

- Underrating of high-quality temples with fewer rooms
- Overrating of high-quantity temples with mediocre quality
- NaN values in edge cases (empty temples, single rooms)
```

---

## Success Criteria

- README.md updated with new scoring formula
- API reference includes score breakdown examples
- CHANGELOG.md documents breaking changes
- All documentation accurate and complete

---

## Deliverables

1. Updated `README.md` with new scoring section
2. Updated `docs/api-reference.md` with examples
3. Updated `CHANGELOG.md` with version entry
4. All documentation reviewed for accuracy

---

## Next Steps

After completing documentation:
1. Final review of all changes
2. Create summary report
3. Mark plan as complete
