---
title: "Star Rating Scoring System Improvement"
description: "Redesign scoring formula and thresholds to accurately rate real PoE2 temple layouts"
status: pending
priority: P1
effort: 4h
branch: master
tags: [scoring, star-rating, accuracy, testing]
created: 2026-02-10
---

# Star Rating Scoring System Improvement Plan

**Status**: Pending
**Priority**: P1 (High)
**Effort**: 4 hours

---

## Overview

Fix the star rating scoring system to accurately rate real PoE2 temple layouts based on analysis of 6 real temple examples.

---

## Problem Statement

### Current Scoring Issues

**Real Temple Data Analysis:**

| # | Rooms | Key Features | Current Score | Current Rating | Expected Rating | Issue |
|---|-------|--------------|---------------|----------------|-----------------|-------|
| 1 | 22 | 2 T6, 1 Golem, 1 Boss | 30 pts | 3★ | 5★ | **Underrating** |
| 2 | ? | ? | 16 pts | 1★ | 1★ | ✅ Correct |
| 3 | 29 | 2 Spymasters, 1 Golem, 3 T6 | 54 pts | 4★ | 3★ | **Overrating** |
| 4 | ? | ? | ? | ? | 1★ | Need testing |
| 5 | ? | ? | 33 pts | 3★ | 3★ | ✅ Correct |
| 6 | ? | ? | ? | ? | 5★ | Need testing |

### Root Causes

1. **Thresholds too low**: 90+ for 5★ out of 475 max = only 19% (too easy)
2. **Tech bonuses oversized**: 370 bonus points vs 105 base = 3.5x multiplier
3. **Quantity vs quality imbalance**: Temple #3 (29 rooms, high quantity) overrated despite mediocre quality
4. **Missing pattern detection**: Snake chain alone doesn't capture true layout quality

---

## Implementation Phases

### Phase 1: Real Temple Data Analysis (45 min)

**Goal**: Decode and analyze all 6 temples to understand their true characteristics.

**Tasks**:
1. Create test fixture file with all 6 temple URLs
2. Decode each temple URL and extract:
   - Total room count
   - Reward room count
   - T6+ room count
   - Spymaster/Golem count
   - Snake chain length
   - Tech patterns detected
3. Document each temple's metrics in a comparison table
4. Calculate current scores vs expected ratings

**Deliverable**: `reports/real-temple-analysis.md`

**Acceptance**:
- All 6 temples decoded successfully
- Complete metrics table
- Clear gap analysis (current vs expected)

---

### Phase 2: Scoring Formula Redesign (60 min)

**Goal**: Design new scoring formula that correctly rates all temples.

**Tasks**:
1. Analyze what makes each temple its expected rating:
   - **5★**: What features define "god tier"?
   - **3★**: What's an "average" temple?
   - **1★**: What's a "poor" temple?
2. Design new formula components:
   - Base scoring (snake, room quality, quantity)
   - Tech pattern bonuses (balanced, not overwhelming)
   - Penalty system (disconnected rooms, low density)
3. Update `src/core/scorer.ts` with new formula
4. Update `src/config/scoring-config.ts` with new thresholds

**Proposed New Formula**:

```typescript
// Base Score (0-100): More balanced components
const baseScore = {
  snake: 0-25,           // Connectivity (reduced from 40)
  roomQuality: 0-50,     // High-tier rooms value
  density: 0-15,         // Reward room density
  layout: 0-10,          // Overall layout efficiency
};

// Tech Bonuses (0-50): Significantly reduced
const techBonuses = {
  russianTech: 25,       // Was 150
  romanRoad: 15,         // Was 100
  doubleTriple: 10,      // Was 120
};

// New Thresholds (out of 150 max)
const thresholds = {
  fiveStar: 120,   // 80% of max
  fourStar: 90,    // 60% of max
  threeStar: 60,   // 40% of max
  twoStar: 30,     // 20% of max
  oneStar: 0,
};
```

**Deliverable**: `reports/scoring-formula-design.md`

**Acceptance**:
- New formula documented with rationale
- All 6 test temples rate correctly
- Formula is explainable and intuitive

---

### Phase 3: Implementation (45 min)

**Goal**: Implement the new scoring system.

**Files to Modify**:
1. `src/core/scorer.ts` - Core scoring logic
2. `src/core/analyzer.ts` - Integration with analysis
3. `src/config/scoring-config.ts` - Thresholds and weights
4. `src/types/temple-types.ts` - Type definitions if needed

**Implementation Steps**:
1. Update scoring constants in `scoring-config.ts`
2. Refactor `calculateSnakeScore()` with new weights
3. Refactor `calculateRoomScore()` with new room values
4. Update `calculateStarRating()` with new thresholds
5. Add penalty scoring for poor layouts

**Acceptance**:
- All code compiles without errors
- New scoring values match design document
- Backward compatibility maintained

---

### Phase 4: Testing & Validation (60 min)

**Goal**: Ensure all 6 real temples rate correctly.

**Tasks**:
1. Create `src/__tests__/real-temples.test.ts` with all 6 test cases
2. Add assertions for each temple's expected rating
3. Run tests and adjust scoring if needed
4. Ensure existing tests still pass
5. Verify coverage >80%

**Test Structure**:
```typescript
describe('Real Temple Scoring', () => {
  it('should rate Temple #1 as 5 stars', () => {
    const result = analyzeTemple(temple1Data);
    expect(result.starRating).toBeGreaterThanOrEqual(4.5);
  });

  it('should rate Temple #2 as 1 star', () => {
    const result = analyzeTemple(temple2Data);
    expect(result.starRating).toBeLessThan(2);
  });

  // ... etc for all 6 temples
});
```

**Acceptance**:
- All 6 temples rate correctly
- Existing tests pass
- Coverage maintained >80%

---

### Phase 5: Edge Cases & Refinement (30 min)

**Goal**: Handle edge cases and refine scoring.

**Tasks**:
1. Test edge cases:
   - Empty temples
   - Single room temples
   - All T7 but disconnected
   - Many low-tier rooms connected
2. Adjust scoring for edge cases
3. Add suggestions for improvement
4. Verify no regression

**Acceptance**:
- Edge cases handled gracefully
- No crashes or NaN values
- Helpful suggestions generated

---

### Phase 6: Documentation (30 min)

**Goal**: Update documentation to reflect new scoring.

**Tasks**:
1. Update `README.md` with new scoring formula
2. Update `docs/api-reference.md` with score breakdown
3. Add examples with real temple data
4. Document the decision-making process

**Acceptance**:
- Documentation accurate and complete
- Examples demonstrate new system
- Rationale clearly explained

---

## Related Code Files

### Files to Modify
- `src/core/scorer.ts` - Core scoring functions
- `src/core/analyzer.ts` - Analysis integration
- `src/config/scoring-config.ts` - Constants and thresholds

### Files to Create
- `src/__tests__/real-temples.test.ts` - Real temple validation tests
- `src/fixtures/real-temples.ts` - Real temple test data

### Files to Update
- `README.md` - Scoring documentation
- `docs/api-reference.md` - API docs

---

## Success Criteria

1. All 6 real temples rate correctly (match expected ratings)
2. Scoring formula is explainable and intuitive
3. Existing tests still pass
4. Coverage maintained >80%
5. Documentation updated

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| New formula breaks existing tests | High | Run tests after each change |
| Real temples can't be decoded | Medium | Have backup synthetic temples |
| Formula becomes too complex | Medium | Keep it simple, document well |
| Tech detection still inaccurate | Low | Phase 1 analysis will reveal |

---

## Unresolved Questions

1. What are the actual decoded characteristics of temples #4 and #6?
2. Are there additional tech patterns not currently detected?
3. Should we consider room placement (corners, edges) in scoring?
4. Is the current snake chain algorithm accurate?
5. What weight should density have vs quality?

---

## Next Steps

1. Start Phase 1: Decode and analyze all 6 temples
2. Create comparison table with actual metrics
3. Proceed to Phase 2 once analysis complete
