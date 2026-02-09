# Phase 4: Testing & Validation

**Status**: Pending
**Effort**: 60 minutes
**Priority**: P1
**Depends On**: Phase 3 (Implementation)

---

## Overview

Ensure all 6 real temples rate correctly and existing tests still pass.

---

## Context

After implementing new scoring, need to validate:
1. All 6 real temples rate correctly (match expected ratings)
2. Existing test suite still passes
3. Coverage maintained above 80%

---

## Test Strategy

### 1. Real Temple Validation Tests

Create dedicated test file for the 6 real temples.

### 2. Regression Tests

Run existing test suite to ensure no breakage.

### 3. Edge Case Tests

Test boundary conditions and edge cases.

---

## Implementation Steps

### Step 1: Create Real Temple Fixtures (10 min)

**File**: `src/fixtures/real-temples.ts`

```typescript
import type { TempleData, Room } from '../types/temple-types';
import { decodeTempleUrl } from '../core/decoder';

export interface RealTempleFixture {
  id: string;
  url: string;
  expectedRating: number;
  description: string;
  data: TempleData;
}

// Decode all temples at import time
const decodeAll = (): RealTempleFixture[] => {
  const temples = [
    {
      id: 'temple1',
      url: 'ACFIIUghSCFIIUhgOWA5YDlgSCE5ESkRKRE5IUhgKQCYACkySCE5EjEAeRFpIUhgcGl6cClwSCE5eXpwMRJ6IUgyaXBhOXGASCIxOWEIQGkxIg',
      expectedRating: 5,
      description: '22 rooms, 2 T6, 1 Golem, 1 Boss',
    },
    {
      id: 'temple2',
      url: 'ADAiSCIwIkgiMCIiMCJIIgAAIkhIMRIpMACYSCIiaXkRIkgAIjAwcHApESIxMCIieWoAKRJpIkhIaXAAOTFxSCIiMQAIYXqAIjFpcEEIYXBpMQ',
      expectedRating: 1,
      description: 'Poor layout',
    },
    {
      id: 'temple3',
      url: 'AyFKIUohSiJJIkp6gnFpMQAAMiJwOjESIgCYaEp6YSkpSSIAMiJxOhESMUoiIkl6YioRaXFKSiJxOXkpEXkiITF6YHBBKRIwSmlwOWEIYTkxIuoKAggDJDAAgAAAlHB47Pk',
      expectedRating: 3,
      description: '29 rooms, 2 Spymasters, 1 Golem, 3 T6',
    },
    {
      id: 'temple4',
      url: 'AyIxIkkiMSJJIklJIjEiSQAAMSIiEioSIgCYIjEyKgAqMSIASSJqEnoSMkkiIklyKnFqanExMSKBEjFwaXkiIjF6eTlhMSJJSWlwcEEIYTkxIohGAAAIJIAAwKpWcrjp5r0',
      expectedRating: 1,
      description: 'Poor layout',
    },
    {
      id: 'temple5',
      url: 'ACJIIUghSCFIIjB6gHFpMQAAMCJwESkRIgCYIkh6KQApSCIASCFwEXkSMTAiIUh6KXBpaXBISCFwEjExInkiIUhpeTlhSCIwSCIxcEEIYTkxIg',
      expectedRating: 3,
      description: 'Average temple',
    },
    {
      id: 'temple6',
      url: 'AEghSCFIIjFoMSF6cHpwaTESEkhwcGpwanApKSFpeQCYAGoSEkgyMWkAAHAxMSE5EnB6gHppaEhgKREpESlwMSE5YDlhABF5EkghSCEIQCkRKQ',
      expectedRating: 5,
      description: 'Excellent temple',
    },
  ];

  return temples.map(t => ({
    ...t,
    data: decodeTempleUrl(t.url),
  }));
};

export const REAL_TEMPLES: RealTempleFixture[] = decodeAll();
```

---

### Step 2: Create Real Temple Tests (20 min)

**File**: `src/__tests__/real-temples.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import { analyzeTemple } from '../core/analyzer';
import { REAL_TEMPLES } from '../fixtures/real-temples';

describe('Real Temple Scoring Validation', () => {
  describe('Expected Rating Validation', () => {
    it.each(REAL_TEMPLES.map(
      t => [t.id, t.expectedRating, t.description]
    ))(
      'should rate %s correctly (expected %d★: %s)',
      (id: string, expected: number, _description: string) => {
        const temple = REAL_TEMPLES.find(t => t.id === id);
        expect(temple).toBeDefined();

        const result = analyzeTemple(temple!.data);

        // Allow 0.5 star tolerance
        expect(result.starRating).toBeGreaterThanOrEqual(expected - 0.5);
        expect(result.starRating).toBeLessThanOrEqual(expected + 0.5);
      }
    );
  });

  describe('5 Star Temples', () => {
    const fiveStarTemples = REAL_TEMPLES.filter(t => t.expectedRating === 5);

    it('should have high scores (90+)', () => {
      fiveStarTemples.forEach(temple => {
        const result = analyzeTemple(temple.data);
        expect(result.totalScore).toBeGreaterThanOrEqual(90);
      });
    });

    it('should have good connectivity', () => {
      fiveStarTemples.forEach(temple => {
        const result = analyzeTemple(temple.data);
        expect(result.snakeScore).toBeGreaterThanOrEqual(15);
      });
    });
  });

  describe('3 Star Temples', () => {
    const threeStarTemples = REAL_TEMPLES.filter(t => t.expectedRating === 3);

    it('should have moderate scores (50-80)', () => {
      threeStarTemples.forEach(temple => {
        const result = analyzeTemple(temple.data);
        expect(result.totalScore).toBeGreaterThanOrEqual(50);
        expect(result.totalScore).toBeLessThan(90);
      });
    });
  });

  describe('1 Star Temples', () => {
    const oneStarTemples = REAL_TEMPLES.filter(t => t.expectedRating === 1);

    it('should have low scores (<40)', () => {
      oneStarTemples.forEach(temple => {
        const result = analyzeTemple(temple.data);
        expect(result.totalScore).toBeLessThan(40);
      });
    });
  });

  describe('Score Breakdown', () => {
    it('should provide detailed score components', () => {
      const temple = REAL_TEMPLES[0];
      const result = analyzeTemple(temple.data);

      expect(result).toHaveProperty('snakeScore');
      expect(result).toHaveProperty('roomScore');
      expect(result).toHaveProperty('quantityScore');
      expect(result).toHaveProperty('techScore');
      expect(result).toHaveProperty('totalScore');
    });
  });
});
```

---

### Step 3: Update Existing Tests (15 min)

Check and update tests that may be affected by scoring changes:

**Files to review**:
- `src/__tests__/scorer.test.ts`
- `src/__tests__/analyzer.test.ts`
- `src/__tests__/index.test.ts`

**Updates needed**:
1. Adjust expected score values
2. Update threshold assertions
3. Fix any hardcoded score expectations

---

### Step 4: Run Test Suite (10 min)

```bash
cd poe2-temple-analyzer

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- real-temples
```

**Expected results**:
- All tests passing
- Coverage >80%
- No failing assertions

---

### Step 5: Debug Failed Tests (5 min)

If tests fail:

1. **Identify failing test**: Which temple/feature?
2. **Check expected rating**: Is it correct?
3. **Analyze score components**: Where is the discrepancy?
4. **Adjust formula**: If rating is wrong, adjust scoring
5. **Re-run**: Verify fix

---

## Test Coverage Requirements

| Component | Target | Notes |
|-----------|--------|-------|
| Scorer functions | 90%+ | Core scoring logic |
| Analyzer | 85%+ | Main analysis function |
| Tech detector | 85%+ | Pattern detection |
| Decoder | 85%+ | URL decoding |
| Overall | 80%+ | Project minimum |

---

## Validation Checklist

- [ ] All 6 real temples rate correctly (±0.5 stars)
- [ ] Temple #1: 5★ (currently underrating)
- [ ] Temple #2: 1★ (currently correct)
- [ ] Temple #3: 3★ (currently overrating)
- [ ] Temple #4: 1★ (needs testing)
- [ ] Temple #5: 3★ (currently correct)
- [ ] Temple #6: 5★ (needs testing)
- [ ] Existing tests still pass
- [ ] Coverage maintained >80%
- [ ] No TypeScript errors

---

## Success Criteria

1. All 6 real temple tests pass
2. Existing test suite passes
3. Coverage maintained above 80%
4. No regression in functionality

---

## Next Steps

After passing tests:
1. Document results in test report
2. Proceed to Phase 5: Edge Cases & Refinement
