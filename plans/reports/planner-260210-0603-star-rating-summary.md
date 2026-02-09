# Star Rating Scoring Improvement - Implementation Plan Summary

**Date**: 2026-02-10
**Status**: Ready for Implementation
**Priority**: P1 (High)
**Estimated Effort**: 4 hours

---

## Plan Location

`D:\CURSOR\sulozor.github.io-gh-pages\plans\260210-0603-star-rating-scoring-improvement\`

---

## Problem Statement

Current star rating scoring system has accuracy issues with real PoE2 temple layouts:

| Temple | Current Score | Current Rating | Expected Rating | Issue |
|--------|---------------|----------------|-----------------|-------|
| #1 (22 rooms, 2 T6, 1 Golem) | 30 pts | 3★ | 5★ | **Underrating** |
| #3 (29 rooms, 2 Spy, 1 Golem, 3 T6) | 54 pts | 4★ | 3★ | **Overrating** |

**Root Causes**:
1. Tech bonuses oversized (370 vs 105 base = 3.5x multiplier)
2. Thresholds too low (5★ = 90+ is only 19% of 475 max)
3. Quantity overvalued vs quality
4. Formula doesn't match player expectations

---

## Proposed Solution

### New Scoring Formula

```typescript
// Base Score (0-100): Primary score driver
const baseScore = {
  snake: 0-25,       // Connectivity (reduced from 40)
  roomQuality: 0-50, // High-tier room value (increased focus)
  density: 0-15,     // Reward room percentage
  layout: 0-10,      // NEW: Layout efficiency
};

// Tech Bonuses (0-50): Significantly reduced
const techBonuses = {
  russianTech: 25,   // Was 150 (6x reduction)
  romanRoad: 15,     // Was 100 (6.7x reduction)
  doubleTriple: 10,  // Was 120 (12x reduction)
};

// Total Max: 150 points (100 base + 50 tech)
```

### New Thresholds

```typescript
const thresholds = {
  fiveStar: 120,   // 80% of max (was 19%)
  fourStar: 90,    // 60% of max (was 11%)
  threeStar: 60,   // 40% of max (was 5%)
  twoStar: 30,     // 20% of max (was 4%)
  oneStar: 0,
};
```

---

## Implementation Phases

### Phase 1: Real Temple Data Analysis (45 min)
- Decode all 6 temple URLs
- Extract metrics (rooms, tiers, snake length)
- Create comparison table
- Identify patterns for each rating tier

**Deliverable**: `reports/real-temple-analysis.md`

### Phase 2: Scoring Formula Redesign (60 min)
- Analyze what makes each tier (5★/3★/1★)
- Design new formula with balanced components
- Document rationale for each component
- Calculate expected scores for test temples

**Deliverable**: `reports/scoring-formula-design.md`

### Phase 3: Implementation (45 min)
- Update `scoring-config.ts` with new thresholds
- Refactor `scorer.ts` with new functions
- Update `analyzer.ts` integration
- Verify build succeeds

**Files Modified**:
- `src/config/scoring-config.ts`
- `src/core/scorer.ts`
- `src/core/analyzer.ts`

### Phase 4: Testing & Validation (60 min)
- Create `real-temples.test.ts` with all 6 temples
- Run full test suite
- Debug and adjust scoring until temples rate correctly
- Verify coverage >80%

**Deliverable**: `src/__tests__/real-temples.test.ts`

### Phase 5: Edge Cases & Refinement (30 min)
- Test edge cases (empty, single room, disconnected)
- Add defensive checks
- Improve suggestions
- Verify no regression

**Deliverable**: `src/__tests__/edge-cases-scoring.test.ts`

### Phase 6: Documentation (30 min)
- Update `README.md` with new scoring section
- Update `docs/api-reference.md` with examples
- Update `CHANGELOG.md` with version entry

---

## Files to Create

1. `src/fixtures/real-temples.ts` - Temple test data
2. `src/__tests__/real-temples.test.ts` - Validation tests
3. `src/__tests__/edge-cases-scoring.test.ts` - Edge case tests
4. `reports/real-temple-analysis.md` - Analysis report
5. `reports/scoring-formula-design.md` - Design document

## Files to Modify

1. `src/config/scoring-config.ts` - Thresholds and constants
2. `src/core/scorer.ts` - Scoring functions
3. `src/core/analyzer.ts` - Integration
4. `README.md` - Scoring documentation
5. `docs/api-reference.md` - API docs
6. `CHANGELOG.md` - Version history

---

## Success Criteria

1. All 6 real temples rate correctly (match expected ratings ±0.5★)
2. Existing test suite passes
3. Coverage maintained >80%
4. No TypeScript errors
5. Documentation complete

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| New formula breaks existing tests | High | Run tests after each change |
| Real temples can't be decoded | Medium | Have backup synthetic temples |
| Formula becomes too complex | Medium | Keep it simple (KISS) |
| Tech detection still inaccurate | Low | Phase 1 analysis will reveal |

---

## Unresolved Questions

1. What are the actual decoded characteristics of temples #4 and #6?
2. Are there additional tech patterns not currently detected?
3. Should we consider room placement (corners, edges) in scoring?
4. Is the current snake chain algorithm accurate?
5. What weight should density have vs quality?

*These will be answered during Phase 1 analysis.*

---

## Next Steps

1. Start Phase 1: Decode and analyze all 6 temples
2. Create comparison table with actual metrics
3. Proceed to Phase 2 once analysis complete

---

## Quick Reference

| Component | Old Range | New Range | Change |
|-----------|-----------|-----------|--------|
| Snake | 0-40 | 0-25 | -37.5% |
| Room Quality | 0-50 | 0-50 | - |
| Quantity | 0-15 | 0-15 (Density) | - |
| Layout | - | 0-10 | NEW |
| Tech | 0-370 | 0-50 | -86.5% |
| **Total Max** | 475 | 150 | -68.4% |

| Rating | Old Threshold | % of Max | New Threshold | % of Max |
|--------|---------------|----------|---------------|----------|
| 5★ | 90 | 19% | 120 | 80% |
| 4★ | 50 | 11% | 90 | 60% |
| 3★ | 25 | 5% | 60 | 40% |
| 2★ | 18 | 4% | 30 | 20% |
| 1★ | 0 | 0% | 0 | 0% |
