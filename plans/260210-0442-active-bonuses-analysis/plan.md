# Active Bonuses Analysis Implementation Plan

**Date**: 2026-02-10
**Status**: 🔄 IN PROGRESS
**Priority**: High

---

## Overview

Add Active Bonuses (tech patterns) analysis and scoring to the temple rating system to improve accuracy and match database ratings.

---

## Problem Statement

**Current Issue**:
- Provided temple URL fails to decode: `AyFKIUohSiJJIkp6gnFpMQAAMiJwOjESIgCYaEp6YSkpSSIAMiJxOhESMUoiIkl6YioRaXFKSiJxOXkpEXkiITF6YHBBKRIwSmlwOWEIYTkxIuoKAggDJDAAgAAAlHB47Pk`
- Expected rating: 4 stars (from database)
- Current decoder doesn't support this encoding format
- Missing Active Bonuses/Tech pattern detection

**Active Bonuses to Detect**:
- Russian Tech
- Roman Road
- Double Triple patterns
- Other layout tech bonuses

---

## Implementation Phases

### Phase 1: Research & Decoder Fix (15 min)

**Tasks**:
1. Analyze the failed encoding format
2. Compare with working formats
3. Fix decoder to support new format
4. Test with provided URL

**Acceptance**:
- ✅ Provided URL decodes successfully
- ✅ Temple data structure is valid
- ✅ Room grid is correct

### Phase 2: Tech Pattern Detection (30 min)

**Tasks**:
1. Create `tech-detector.ts` module
2. Implement pattern detection algorithms:
   - Russian Tech: T7 rooms in specific patterns
   - Roman Road: Connected high-tier rooms
   - Double Triple: Multiple T7+ rooms
3. Add pattern scoring

**Acceptance**:
- ✅ All tech patterns detected
- ✅ Pattern scores calculated
- ✅ Tests for each pattern

### Phase 3: Scoring Integration (15 min)

**Tasks**:
1. Integrate tech bonuses into `calculateOverallScore()`
2. Update scoring weights
3. Add bonus breakdown to analysis results
4. Update star rating thresholds

**Acceptance**:
- ✅ Tech bonuses affect total score
- ✅ 4-star temple achieves expected rating
- ✅ Score breakdown includes bonuses

### Phase 4: UI Updates (15 min)

**Tasks**:
1. Update `temple-rating.html` to display:
   - Active tech bonuses detected
   - Bonus points breakdown
   - Visual indicators for patterns
2. Add bonus section to results

**Acceptance**:
- ✅ Bonuses displayed in UI
- ✅ Clear visual feedback
- ✅ Mobile responsive

### Phase 5: Testing (15 min)

**Tasks**:
1. Add tests for tech detection
2. Add tests for scoring integration
3. Test with provided temple URL
4. Verify 4-star rating achieved

**Acceptance**:
- ✅ All new tests passing
- ✅ Provided URL shows 4 stars
- ✅ Coverage maintained >80%

### Phase 6: Documentation (10 min)

**Tasks**:
1. Update API reference
2. Document tech patterns
3. Update scoring documentation
4. Add examples

**Acceptance**:
- ✅ Documentation complete
- ✅ Examples provided
- ✅ API updated

---

## Technical Details

### Tech Pattern Definitions

**Russian Tech**:
- Multiple T7 rooms connected
- Specific room combinations
- High value: 150 points

**Roman Road**:
- Linear chain of high-tier rooms
- Minimum length: 4 rooms
- High value: 100 points

**Double Triple**:
- Two triple connections of T6+ rooms
- Bonus multiplier applied
- High value: 120 points

### Scoring Integration

```typescript
interface TechBonus {
  type: string;
  detected: boolean;
  score: number;
  description: string;
}

interface TempleAnalysis {
  // ... existing fields
  techBonuses: TechBonus[];
  techScore: number; // New field
}
```

---

## File Changes

### New Files
- `src/core/tech-detector.ts` - Pattern detection
- `src/__tests__/tech-detector.test.ts` - Tests

### Modified Files
- `src/core/analyzer.ts` - Integration
- `src/core/scorer.ts` - Scoring logic
- `src/types/temple-types.ts` - Type definitions
- `temple-rating.html` - UI updates
- `docs/api-reference.md` - Documentation

---

## Success Criteria

1. ✅ Provided temple URL decodes successfully
2. ✅ Temple achieves 4-star rating
3. ✅ Active bonuses displayed in UI
4. ✅ All tests passing (145+ tests)
5. ✅ Coverage maintained >80%
6. ✅ Documentation complete

---

## Estimated Time

**Total**: 1 hour 40 minutes
- Phase 1: 15 min (decoder fix)
- Phase 2: 30 min (pattern detection)
- Phase 3: 15 min (scoring)
- Phase 4: 15 min (UI)
- Phase 5: 15 min (testing)
- Phase 6: 10 min (docs)

---

## Notes

- Current tech bonus configuration exists in `config/scoring-config.ts`
- Tech bonuses already defined: `RUSSIAN_TECH: 150`, `ROMAN_ROAD: 100`, `DOUBLE_TRIPLE: 120`
- Need to implement detection logic
- Priority: Fix decoder first, then add detection
