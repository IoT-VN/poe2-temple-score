# Phase 5: Edge Cases & Refinement

**Status**: Pending
**Effort**: 30 minutes
**Priority**: P2
**Depends On**: Phase 4 (Testing & Validation)

---

## Overview

Handle edge cases, refine scoring, and ensure robustness.

---

## Context

After validating real temples, need to ensure system handles edge cases gracefully:
- Empty temples
- Single room temples
- Disconnected high-tier rooms
- Many low-tier rooms
- Extreme values

---

## Edge Cases to Test

### 1. Empty Temple

```typescript
const emptyTemple: TempleData = {
  grid: {}
};
```

**Expected behavior**:
- Score: 0
- Rating: 1★
- No crashes or NaN values
- Helpful suggestion: "Add rooms to the temple"

---

### 2. Single Room Temple

```typescript
const singleRoom: TempleData = {
  grid: {
    '0,0': { x: 0, y: 0, room: 'viper_spymaster', tier: 7 }
  }
};
```

**Expected behavior**:
- Score: ~15 (room quality only)
- Rating: 1★
- Snake score: 1 (single room)
- Suggestion: "Add more connected rooms"

---

### 3. All T7 But Disconnected

```typescript
const disconnectedT7: TempleData = {
  grid: {
    '0,0': { x: 0, y: 0, room: 'viper_spymaster', tier: 7 },
    '10,10': { x: 10, y: 10, room: 'viper_spymaster', tier: 7 },
    '20,20': { x: 20, y: 20, room: 'viper_spymaster', tier: 7 },
  }
};
```

**Expected behavior**:
- High room quality score (~30)
- Low snake score (~3)
- Low layout score (penalty for isolation)
- Rating: 2-3★
- Suggestion: "Connect high-tier rooms for better snake chain"

---

### 4. Many Low-Tier Connected

```typescript
const manyLowTier: TempleData = {
  grid: {
    // 15 connected T2 rooms
  }
};
```

**Expected behavior**:
- High snake score (~18)
- Low room quality score (~5)
- Moderate density score (~10)
- Rating: 2-3★
- Suggestion: "Upgrade rooms to higher tiers"

---

### 5. Extreme Values

Test with:
- 100+ rooms
- Negative coordinates
- Missing tier values
- Invalid room types
- Duplicate coordinates

---

## Implementation Steps

### Step 1: Create Edge Case Tests (15 min)

**File**: `src/__tests__/edge-cases-scoring.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import { analyzeTemple } from '../core/analyzer';
import type { TempleData } from '../types/temple-types';

describe('Edge Cases - Scoring System', () => {
  describe('Empty Temple', () => {
    it('should handle empty temple gracefully', () => {
      const temple: TempleData = { grid: {} };
      const result = analyzeTemple(temple);

      expect(result.totalScore).toBe(0);
      expect(result.starRating).toBe(1);
      expect(result.suggestions).toContain('Add rooms to the temple');
    });
  });

  describe('Single Room Temple', () => {
    it('should score single T7 room correctly', () => {
      const temple: TempleData = {
        grid: {
          '0,0': { x: 0, y: 0, room: 'viper_spymaster', tier: 7 }
        }
      };
      const result = analyzeTemple(temple);

      expect(result.snakeScore).toBe(1);
      expect(result.roomScore).toBeGreaterThan(0);
      expect(result.starRating).toBe(1);
    });
  });

  describe('Disconnected High-Tier Rooms', () => {
    it('should penalize disconnected T7 rooms', () => {
      const temple: TempleData = {
        grid: {
          '0,0': { x: 0, y: 0, room: 'viper_spymaster', tier: 7 },
          '10,10': { x: 10, y: 10, room: 'viper_spymaster', tier: 7 },
          '20,20': { x: 20, y: 20, room: 'viper_spymaster', tier: 7 },
        }
      };
      const result = analyzeTemple(temple);

      expect(result.snakeScore).toBeLessThan(10);
      expect(result.roomScore).toBeGreaterThan(20);
      expect(result.starRating).toBeLessThanOrEqual(3);
    });
  });

  describe('Many Low-Tier Connected', () => {
    it('should not overvalue quantity without quality', () => {
      const grid: any = {};
      for (let i = 0; i < 15; i++) {
        grid[`${i},0`] = { x: i, y: 0, room: 'armoury', tier: 2 };
      }
      const temple: TempleData = { grid };
      const result = analyzeTemple(temple);

      expect(result.snakeScore).toBeGreaterThan(15);
      expect(result.roomScore).toBeLessThan(15);
      expect(result.starRating).toBeLessThanOrEqual(3);
    });
  });

  describe('Invalid Data', () => {
    it('should handle missing tier values', () => {
      const temple: TempleData = {
        grid: {
          '0,0': { x: 0, y: 0, room: 'vault' } as any
        }
      };
      const result = analyzeTemple(temple);

      expect(result).toBeDefined();
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle negative coordinates', () => {
      const temple: TempleData = {
        grid: {
          '-5,-5': { x: -5, y: -5, room: 'vault', tier: 6 }
        }
      };
      const result = analyzeTemple(temple);

      expect(result).toBeDefined();
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('No NaN Values', () => {
    it('should never return NaN in scores', () => {
      const testCases = [
        { grid: {} },
        { grid: { '0,0': { x: 0, y: 0, room: 'empty', tier: 0 } } },
      ];

      testCases.forEach(temple => {
        const result = analyzeTemple(temple);

        expect(result.snakeScore).not.toBeNaN();
        expect(result.roomScore).not.toBeNaN();
        expect(result.quantityScore).not.toBeNaN();
        expect(result.techScore).not.toBeNaN();
        expect(result.totalScore).not.toBeNaN();
        expect(result.starRating).not.toBeNaN();
      });
    });
  });
});
```

---

### Step 2: Add Defensive Checks (10 min)

Update scoring functions with defensive checks:

**File**: `src/core/scorer.ts`

```typescript
export function calculateRoomQualityScore(rooms: Room[]): number {
  if (!rooms || rooms.length === 0) return 0;

  let score = 0;

  // Defensive: filter out invalid rooms
  const validRooms = rooms.filter(r => r && typeof r.tier === 'number');

  // ... rest of function
}

export function calculateDensityScore(rewardRooms: number, totalRooms: number): number {
  if (totalRooms === 0 || rewardRooms < 0) return 0;
  if (rewardRooms > totalRooms) return 0; // Invalid state

  // ... rest of function
}
```

---

### Step 3: Improve Suggestions (5 min)

**File**: `src/core/analyzer.ts`

Update `generateSuggestions()` to handle edge cases:

```typescript
function generateSuggestions(
  chainLength: number,
  metrics: RoomMetrics,
  rewardRoomsCount: number
): string[] {
  const suggestions: string[] = [];

  // Empty temple
  if (rewardRoomsCount === 0) {
    suggestions.push('Add reward rooms to the temple.');
    return suggestions;
  }

  // Single room
  if (rewardRoomsCount === 1) {
    suggestions.push('Add more rooms and connect them for a snake chain.');
    return suggestions;
  }

  // Poor connectivity
  if (chainLength < 4) {
    suggestions.push(
      `Snake chain is only ${chainLength} rooms. Aim for 4+ connected reward rooms.`
    );
  }

  // Low quality
  if (metrics.spymasters === 0 && metrics.t7Rooms === 0 && metrics.t6Rooms < 3) {
    suggestions.push(
      'Consider adding more high-value rooms (Spymasters, T7 rooms, or multiple T6 rooms).'
    );
  }

  // Low quantity
  if (rewardRoomsCount < 10) {
    suggestions.push('Consider adding more reward rooms to the temple.');
  }

  // Disconnected high-tier rooms
  if (metrics.t6Rooms + metrics.t7Rooms >= 3 && chainLength < 5) {
    suggestions.push('Connect your high-tier rooms for a better snake chain.');
  }

  return suggestions;
}
```

---

## Success Criteria

- All edge cases handled gracefully
- No crashes or NaN values
- Helpful suggestions for all scenarios
- Defensive checks in place

---

## Next Steps

After completing edge case handling:
1. Run full test suite
2. Verify all tests pass
3. Proceed to Phase 6: Documentation
