# Phase 02: Code Modularization & Refactoring

**Date**: 2026-02-10
**Status**: Pending
**Priority**: HIGH
**Estimated Effort**: 8-12 hours

## Overview

Break down the monolithic 24,790-line `index.ts` file into maintainable, focused modules following single-responsibility principle and the 200-line file size limit.

## Context Links

- Parent plan: `plan.md`
- Depends on: `phase-01-security-critical-fixes.md`
- Architecture doc: `docs/system-architecture.md`

## Key Insights

1. **Massive File**: `index.ts` is 24,790 lines (124x the 200-line limit)
2. **Mixed Concerns**: Decoding, analysis, scoring, MCP tools all in one file
3. **Code Duplication**: Room types defined in 3+ places
4. **Hard-coded Values**: Scoring thresholds embedded throughout code
5. **Long Functions**: `analyzeTemple()` is 196 lines, `decodeTempleData()` is 112 lines

## Requirements

### Functional Requirements
- Split `index.ts` into focused, single-responsibility modules
- Extract configuration to separate layer
- Create shared types module
- Eliminate code duplication
- All existing tests must pass

### Non-Functional Requirements
- Each module file ≤ 200 lines
- Clear module boundaries and dependencies
- Maintain backward compatibility
- No performance regression

## Architecture

### Current Structure
```
poe2-temple-analyzer/src/
└── index.ts (24,790 lines)
    ├── Types & Interfaces
    ├── Room type definitions
    ├── Decoding logic
    ├── Analysis logic
    ├── Scoring logic
    ├── MCP tool handlers
    └── Server setup
```

### Target Structure
```
poe2-temple-analyzer/src/
├── index.ts (MCP server setup, ~50 lines)
├── types/
│   ├── temple-types.ts (Room, TempleData, TempleAnalysis)
│   └── scoring-types.ts (ScoreCriteria, RatingThresholds)
├── config/
│   ├── room-types.ts (Room type definitions & constants)
│   └── scoring-config.ts (Thresholds, weights, criteria)
├── core/
│   ├── decoder.ts (decodeTempleData, parseTempleArray)
│   ├── analyzer.ts (analyzeTemple, room counting)
│   └── scorer.ts (calculateScore, starRating, suggestions)
├── tools/
│   ├── analyze-temple-url.ts (MCP tool handler)
│   ├── analyze-temple-data.ts (MCP tool handler)
│   └── temple-info.ts (MCP tool handler)
└── utils/
    ├── url-parser.ts (extractShareData, validateURL)
    └── bit-ops.ts (bit manipulation utilities)
```

## Related Code Files

### Files to Create
1. `src/types/temple-types.ts` - Core data structures
2. `src/types/scoring-types.ts` - Scoring interfaces
3. `src/config/room-types.ts` - Room definitions
4. `src/config/scoring-config.ts` - Scoring configuration
5. `src/core/decoder.ts` - Temple data decoding
6. `src/core/analyzer.ts` - Temple analysis logic
7. `src/core/scorer.ts` - Scoring algorithms
8. `src/tools/analyze-temple-url.ts` - MCP tool
9. `src/tools/analyze-temple-data.ts` - MCP tool
10. `src/utils/url-parser.ts` - URL utilities

### Files to Modify
1. `src/index.ts` - Reduce to MCP server setup only
2. `src/__tests__/index.test.ts` - Update imports

### Files to Reference
1. `temple-rating.html` - Room type definitions (for consolidation)
2. `test-rating.js` - Test utilities

## Implementation Steps

### Step 1: Create Type Definitions
**File**: `src/types/temple-types.ts`

Extract all type definitions from `index.ts`:
```typescript
export interface Room {
  id: number;
  type: string;
  tier: number;
  x: number;
  y: number;
  connections: number[];
}

export interface TempleData {
  rooms: Room[];
  version: number;
  // ... other types
}

export interface TempleAnalysis {
  score: number;
  stars: number;
  suggestions: string[];
  // ... other analysis results
}
```

**File**: `src/types/scoring-types.ts`
```typescript
export interface ScoreCriteria {
  maxScore: number;
  weights: {
    roomTiers: number;
    roomDensity: number;
    techPatterns: number;
    // ...
  };
}

export interface RatingThresholds {
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}
```

### Step 2: Extract Configuration
**File**: `src/config/room-types.ts`

Consolidate room type definitions from all sources:
```typescript
export const ROOM_TYPES = {
  MARKET: { id: 0, name: 'Market', tiers: [1, 2, 3, 4, 5, 6, 7] },
  // ... all room types
} as const;

export const ROOM_TYPE_IDS = {
  0: 'MARKET',
  // ... reverse mapping
} as const;
```

**File**: `src/config/scoring-config.ts`
```typescript
export const SCORING_THRESHOLDS: RatingThresholds = {
  fiveStar: 850,
  fourStar: 700,
  threeStar: 550,
  twoStar: 400,
  oneStar: 0,
};

export const SNAKE_SCORE_THRESHOLDS = {
  T7_MIN: 15,
  T6_MIN: 12,
  // ...
};
```

### Step 3: Extract Core Logic
**File**: `src/core/decoder.ts`

Move decoding functions:
- `decodeTempleData()` (break into smaller functions)
- `parseTempleArray()`
- `detectCharset()`
- Bit manipulation utilities

**Target**: Each function ≤ 50 lines, file ≤ 200 lines

**File**: `src/core/analyzer.ts`

Move analysis functions:
- `analyzeTemple()` (break into smaller functions)
- `countRoomsByTier()`
- `findTechPatterns()`
- `findBestChain()`
- `detectRussianTech()`

**Target**: Each function ≤ 50 lines, file ≤ 200 lines

**File**: `src/core/scorer.ts`

Move scoring functions:
- `calculateOverallScore()`
- `calculateStarRating()`
- `generateSuggestions()`
- `calculateRoomValue()`

**Target**: Each function ≤ 50 lines, file ≤ 200 lines

### Step 4: Extract MCP Tools
**File**: `src/tools/analyze-temple-url.ts`

```typescript
import { analyzeTemple } from '../core/analyzer';
import { extractShareData } from '../utils/url-parser';

export const analyzeTempleUrlTool = {
  name: 'analyze_temple',
  description: 'Analyze temple from share URL',
  handler: async (url: string) => {
    const data = extractShareData(url);
    return analyzeTemple(data);
  }
};
```

**File**: `src/tools/analyze-temple-data.ts`

Similar structure for data analysis tool.

### Step 5: Extract Utilities
**File**: `src/utils/url-parser.ts`

- `extractShareData()`
- `validateShareURL()`
- URL parsing utilities

**File**: `src/utils/bit-ops.ts`

- Bit manipulation functions
- Base-40 encoding/decoding helpers

### Step 6: Refactor Main Index
**File**: `src/index.ts`

Reduce to MCP server setup only (~50 lines):
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { analyzeTempleUrlTool } from './tools/analyze-temple-url.js';
import { analyzeTempleDataTool } from './tools/analyze-temple-data.js';
import { templeInfoTool } from './tools/temple-info.js';

// Server setup
const server = new Server({
  name: 'poe2-temple-analyzer',
  version: '1.0.0',
});

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    analyzeTempleUrlTool,
    analyzeTempleDataTool,
    templeInfoTool,
  ],
}));

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Tool routing logic
});

// Start server
async function main() {
  await stdioServerTransport(server);
}

main().catch(console.error);
```

### Step 7: Update Tests
**File**: `src/__tests__/index.test.ts`

Update imports to use new module structure:
```typescript
import { decodeTempleData } from '../core/decoder';
import { analyzeTemple } from '../core/analyzer';
import { calculateOverallScore } from '../core/scorer';
```

### Step 8: Remove Code Duplication
Update `temple-rating.html` to use shared definitions (future: create shared package).

### Step 9: Verify All Tests Pass
```bash
cd poe2-temple-analyzer
npm run lint
npm test
npm run build
npm start
```

### Step 10: Update Documentation
- Update `AGENTS.md` with new structure
- Update imports in examples
- Document module responsibilities

## Todo List

### Foundation
- [ ] Create types directory structure
- [ ] Create config directory structure
- [ ] Create core directory structure
- [ ] Create tools directory structure
- [ ] Create utils directory structure

### Type Definitions
- [ ] Extract temple-types.ts
- [ ] Extract scoring-types.ts
- [ ] Verify all types exported

### Configuration
- [ ] Create room-types.ts
- [ ] Create scoring-config.ts
- [ ] Consolidate duplicate definitions
- [ ] Verify config completeness

### Core Logic
- [ ] Extract decoder.ts (break down decodeTempleData)
- [ ] Extract analyzer.ts (break down analyzeTemple)
- [ ] Extract scorer.ts (break down scoring functions)
- [ ] Verify each file ≤ 200 lines

### MCP Tools
- [ ] Extract analyze-temple-url.ts
- [ ] Extract analyze-temple-data.ts
- [ ] Extract temple-info.ts
- [ ] Verify tool registration

### Utilities
- [ ] Extract url-parser.ts
- [ ] Extract bit-ops.ts
- [ ] Add JSDoc comments

### Integration
- [ ] Refactor main index.ts
- [ ] Update test imports
- [ ] Update AGENTS.md
- [ ] Run full test suite
- [ ] Verify build succeeds
- [ ] Manual MCP server testing

## Success Criteria

- [ ] `src/index.ts` ≤ 200 lines (ideally ≤ 100)
- [ ] All module files ≤ 200 lines
- [ ] Zero code duplication for room types
- [ ] All existing tests pass
- [ ] Linter shows zero warnings
- [ ] MCP server functions correctly
- [ ] No performance regression
- [ ] Clear module dependencies documented

## Risk Assessment

### High Risk
- **Breaking Changes**: Refactoring may break tests or MCP integration
  - **Mitigation**: Run tests after each module extraction
  - **Rollback**: Git revert if critical failures

### Medium Risk
- **Circular Dependencies**: New modules may create circular imports
  - **Mitigation**: Carefully design dependency graph, use dependency injection
  - **Detection**: Run `madge --circular src/`

### Low Risk
- **File Organization**: May need restructuring during implementation
  - **Mitigation**: Iterative refinement allowed

## Security Considerations

- Maintain input validation in new modules
- Keep error handling consistent
- No sensitive data in config files
- Validate all external inputs

## Next Steps

### Immediate (This Phase)
1. Create directory structure
2. Extract types (no functional changes)
3. Extract config (no functional changes)
4. Extract core logic incrementally
5. Test after each extraction

### Following Phases
- **Phase 03**: Add comprehensive tests for new modules
- **Phase 04**: Update documentation with new architecture

### Dependencies
- Depends on Phase 01 (clean codebase)
- Phase 03 depends on modular structure
- Phase 04 depends on final structure

## Module Dependency Graph

```
index.ts (MCP server)
  ↓
tools/ (MCP tool handlers)
  ↓
core/ (business logic)
  ↓
utils/ (utilities) + types/ + config/
```

## Refactoring Strategy

1. **Bottom-Up Approach**: Start with types/config (no dependencies)
2. **Incremental Extraction**: Extract one module at a time
3. **Continuous Testing**: Run tests after each change
4. **Keep Commits Small**: One module per commit
5. **Preserve Functionality**: No behavioral changes

## Performance Considerations

- Monitor bundle size after refactoring
- Check for performance regression in analysis
- Optimize imports (tree-shaking)
- Consider lazy loading for config

## Notes

- **Take time to do this right** - rushed refactoring creates technical debt
- **Document module responsibilities** in file headers
- **Keep functions pure** where possible for easier testing
- **Use TypeScript strict mode** to catch issues early
- **Consider future extensibility** when designing module interfaces
