# Phase 1: Real Temple Data Analysis

**Status**: Pending
**Effort**: 45 minutes
**Priority**: P1

---

## Overview

Decode and analyze all 6 real temple URLs to understand their true characteristics and identify scoring gaps.

---

## Context

Current scoring system has accuracy issues:
- Temple #1: 30 pts → 3★ (expected 5★) - **Underrating**
- Temple #3: 54 pts → 4★ (expected 3★) - **Overrating**

Need to analyze all 6 temples to understand what features correlate with expected ratings.

---

## Temple URLs

```typescript
const realTemples = {
  temple1: {
    url: 'ACFIIUghSCFIIUhgOWA5YDlgSCE5ESkRKRE5IUhgKQCYACkySCE5EjEAeRFpIUhgcGl6cClwSCE5eXpwMRJ6IUgyaXBhOXGASCIxOWEIQGkxIg',
    expected: 5,
    notes: '22 rooms, 2 T6, 1 Golem, 1 Boss',
  },
  temple2: {
    url: 'ADAiSCIwIkgiMCIiMCJIIgAAIkhIMRIpMACYSCIiaXkRIkgAIjAwcHApESIxMCIieWoAKRJpIkhIaXAAOTFxSCIiMQAIYXqAIjFpcEEIYXBpMQ',
    expected: 1,
    notes: 'Expected 1★',
  },
  temple3: {
    url: 'AyFKIUohSiJJIkp6gnFpMQAAMiJwOjESIgCYaEp6YSkpSSIAMiJxOhESMUoiIkl6YioRaXFKSiJxOXkpEXkiITF6YHBBKRIwSmlwOWEIYTkxIuoKAggDJDAAgAAAlHB47Pk',
    expected: 3,
    notes: '29 rooms, 2 Spymasters, 1 Golem, 3 T6',
  },
  temple4: {
    url: 'AyIxIkkiMSJJIklJIjEiSQAAMSIiEioSIgCYIjEyKgAqMSIASSJqEnoSMkkiIklyKnFqanExMSKBEjFwaXkiIjF6eTlhMSJJSWlwcEEIYTkxIohGAAAIJIAAwKpWcrjp5r0',
    expected: 1,
    notes: 'Need to test',
  },
  temple5: {
    url: 'ACJIIUghSCFIIjB6gHFpMQAAMCJwESkRIgCYIkh6KQApSCIASCFwEXkSMTAiIUh6KXBpaXBISCFwEjExInkiIUhpeTlhSCIwSCIxcEEIYTkxIg',
    expected: 3,
    notes: '33 pts → 3★ (correct)',
  },
  temple6: {
    url: 'AEghSCFIIjFoMSF6cHpwaTESEkhwcGpwanApKSFpeQCYAGoSEkgyMWkAAHAxMSE5EnB6gHppaEhgKREpESlwMSE5YDlhABF5EkghSCEIQCkRKQ',
    expected: 5,
    notes: 'Need to test',
  },
};
```

---

## Implementation Steps

### Step 1: Create Test Fixture File (10 min)

Create `src/fixtures/real-temples.ts`:

```typescript
import type { TempleData } from '../types/temple-types';

export interface RealTempleFixture {
  id: string;
  url: string;
  expectedRating: number;
  notes: string;
  data?: TempleData;
}

export const REAL_TEMPLES: RealTempleFixture[] = [
  {
    id: 'temple1',
    url: 'ACFIIUghSCFIIUhgOWA5YDlgSCE5ESkRKRE5IUhgKQCYACkySCE5EjEAeRFpIUhgcGl6cClwSCE5eXpwMRJ6IUgyaXBhOXGASCIxOWEIQGkxIg',
    expectedRating: 5,
    notes: '22 rooms, 2 T6, 1 Golem, 1 Boss',
  },
  // ... rest of temples
];
```

### Step 2: Create Analysis Script (15 min)

Create `scripts/analyze-real-temples.ts`:

```typescript
import { decodeTempleUrl } from '../src/core/decoder';
import { analyzeTemple } from '../src/core/analyzer';
import { REAL_TEMPLES } from '../src/fixtures/real-temples';

interface TempleMetrics {
  id: string;
  totalRooms: number;
  rewardRooms: number;
  t7Rooms: number;
  t6Rooms: number;
  spymasters: number;
  golems: number;
  snakeLength: number;
  currentScore: number;
  currentRating: number;
  expectedRating: number;
  gap: number;
  techBonuses: string[];
}

function analyzeRealTemples(): TempleMetrics[] {
  const results: TempleMetrics[] = [];

  for (const temple of REAL_TEMPLES) {
    try {
      const decoded = decodeTempleUrl(temple.url);
      const analysis = analyzeTemple(decoded);

      results.push({
        id: temple.id,
        totalRooms: analysis.roomCount,
        rewardRooms: analysis.rewardRooms,
        t7Rooms: analysis.t7Rooms,
        t6Rooms: analysis.t6Rooms,
        spymasters: analysis.spymasters,
        golems: analysis.golems,
        snakeLength: analysis.snakeScore / 5, // Approximate
        currentScore: analysis.totalScore,
        currentRating: analysis.starRating,
        expectedRating: temple.expectedRating,
        gap: analysis.starRating - temple.expectedRating,
        techBonuses: analysis.techBonuses
          .filter(b => b.detected)
          .map(b => b.name),
      });
    } catch (error) {
      console.error(`Failed to analyze ${temple.id}:`, error);
    }
  }

  return results;
}

// Run analysis
const metrics = analyzeRealTemples();
console.table(metrics);
```

### Step 3: Run Analysis (10 min)

```bash
cd poe2-temple-analyzer
npx ts-node scripts/analyze-real-temples.ts > reports/temple-metrics.txt
```

### Step 4: Create Comparison Report (10 min)

Create `reports/real-temple-analysis.md` with:

1. **Metrics Table**: All temple characteristics
2. **Gap Analysis**: Current vs expected ratings
3. **Pattern Identification**: What makes 5★ vs 3★ vs 1★
4. **Recommendations**: Formula adjustments needed

---

## Expected Metrics Table

| ID | Rooms | Reward | T7 | T6 | Spy | Golem | Snake | Score | Current★ | Expected★ | Gap |
|----|-------|--------|----|----|-----|-------|-------|-------|----------|-----------|-----|
| T1 | 22 | ? | ? | 2 | 0 | 1 | ? | 30 | 3 | 5 | -2 |
| T2 | ? | ? | ? | ? | ? | ? | ? | 16 | 1 | 1 | 0 |
| T3 | 29 | ? | ? | 3 | 2 | 1 | ? | 54 | 4 | 3 | +1 |
| T4 | ? | ? | ? | ? | ? | ? | ? | ? | ? | 1 | ? |
| T5 | ? | ? | ? | ? | ? | ? | ? | 33 | 3 | 3 | 0 |
| T6 | ? | ? | ? | ? | ? | ? | ? | ? | ? | 5 | ? |

---

## Pattern Analysis Questions

### For 5★ Temples (T1, T6)
- What's the minimum T6+ room count?
- What's the minimum snake chain length?
- Are tech bonuses required?
- What's the reward room density?

### For 3★ Temples (T3, T5)
- What differentiates "average" from "excellent"?
- Is high quantity without quality penalized?
- What's the typical score range?

### For 1★ Temples (T2, T4)
- What makes a temple "poor"?
- Is it lack of rooms, quality, or connectivity?

---

## Deliverables

1. `src/fixtures/real-temples.ts` - Temple fixture data
2. `scripts/analyze-real-temples.ts` - Analysis script
3. `reports/real-temple-analysis.md` - Comprehensive analysis report
4. `reports/temple-metrics.txt` - Raw metrics output

---

## Success Criteria

- All 6 temples decode successfully
- Complete metrics table with all data points
- Clear pattern identification for each rating tier
- Specific recommendations for formula changes

---

## Next Steps

After completing this phase:
1. Review metrics table to identify patterns
2. Determine what features correlate with expected ratings
3. Proceed to Phase 2: Scoring Formula Redesign
