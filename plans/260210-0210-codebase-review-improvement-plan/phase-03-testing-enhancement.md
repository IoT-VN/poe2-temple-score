# Phase 03: Testing Enhancement

**Date**: 2026-02-10
**Status**: Pending
**Priority**: HIGH
**Estimated Effort**: 6-8 hours

## Overview

Establish comprehensive test coverage with focus on security scenarios, edge cases, integration tests, and achieving 80%+ code coverage.

## Context Links

- Parent plan: `plan.md`
- Depends on: `phase-02-modularization-refactoring.md`
- Current tests: `poe2-temple-analyzer/src/__tests__/index.test.ts`

## Key Insights

1. **Unknown Coverage**: Current test coverage percentage not measured
2. **Missing Test Types**: No integration tests, error handling tests, performance tests
3. **Limited Edge Cases**: Missing tests for unusual temple configurations
4. **No Security Tests**: XSS attempts, malicious input not tested
5. **~16 Tests Only**: Insufficient for complex analysis logic

## Requirements

### Functional Requirements
- Achieve 80%+ code coverage
- Add integration tests with real temple URLs
- Add comprehensive error handling tests
- Add security-focused tests (XSS, injection)
- Add performance benchmarks
- Add edge case tests

### Non-Functional Requirements
- Tests must run in < 30 seconds
- No external dependencies for unit tests
- Mock external dependencies (URLs, etc.)
- Clear test names and descriptions

## Architecture

### Current Test Structure
```
poe2-temple-analyzer/src/__tests__/
└── index.test.ts (~16 tests)
    ├── URL extraction tests
    ├── Decoding tests
    ├── Analysis tests
    └── Basic edge cases
```

### Target Test Structure
```
poe2-temple-analyzer/src/__tests__/
├── unit/
│   ├── decoder.test.ts (decode functions)
│   ├── analyzer.test.ts (analysis logic)
│   ├── scorer.test.ts (scoring algorithms)
│   ├── url-parser.test.ts (URL utilities)
│   └── bit-ops.test.ts (bit manipulation)
├── integration/
│   ├── mcp-tools.test.ts (MCP tool integration)
│   ├── end-to-end.test.ts (full workflow)
│   └── real-urls.test.ts (actual temple URLs)
├── security/
│   ├── xss.test.ts (XSS attempts)
│   ├── injection.test.ts (malicious input)
│   └── validation.test.ts (input validation)
├── performance/
│   ├── benchmark.test.ts (performance tests)
│   └── load.test.ts (large datasets)
└── fixtures/
    ├── sample-urls.json (test URLs)
    ├── malformed-urls.json (invalid inputs)
    └── temple-data.json (sample temples)
```

## Related Code Files

### Files to Create
1. `src/__tests__/unit/decoder.test.ts`
2. `src/__tests__/unit/analyzer.test.ts`
3. `src/__tests__/unit/scorer.test.ts`
4. `src/__tests__/integration/mcp-tools.test.ts`
5. `src/__tests__/security/xss.test.ts`
6. `src/__tests__/security/injection.test.ts`
7. `src/__tests__/performance/benchmark.test.ts`
8. `src/__tests__/fixtures/sample-urls.json`

### Files to Modify
1. `src/__tests__/index.test.ts` - Refactor into unit tests
2. `poe2-temple-analyzer/package.json` - Add test scripts
3. `jest.config.js` - Configure coverage thresholds

### Files to Reference
1. `src/core/decoder.ts` - Test decode functions
2. `src/core/analyzer.ts` - Test analysis logic
3. `src/core/scorer.ts` - Test scoring algorithms

## Implementation Steps

### Step 1: Configure Jest Coverage
**File**: `poe2-temple-analyzer/jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};
```

### Step 2: Create Test Fixtures
**File**: `src/__tests__/fixtures/sample-urls.json`

```json
{
  "validUrls": [
    "https://www.pathofexile.com/passive-skill-tree/?t=...",
    "https://poe2temple.com/?t=..."
  ],
  "malformedUrls": [
    "not-a-url",
    "https://evil.com/xss<script>alert(1)</script>",
    "javascript:alert('xss')",
    "https://valid.com?missing-param"
  ],
  "sampleTempleData": {
    "version": 1,
    "rooms": [...]
  }
}
```

### Step 3: Create Unit Tests

#### Decoder Tests
**File**: `src/__tests__/unit/decoder.test.ts`

```typescript
import { decodeTempleData, parseTempleArray, detectCharset } from '../../core/decoder';

describe('Decoder', () => {
  describe('decodeTempleData', () => {
    it('should decode valid temple data', () => {
      const encoded = '...';
      const result = decodeTempleData(encoded);
      expect(result).toBeDefined();
      expect(result.rooms).toBeInstanceOf(Array);
    });

    it('should handle different charset versions', () => {
      // Test v1, v2, v3 charsets
    });

    it('should throw on invalid input', () => {
      expect(() => decodeTempleData('invalid')).toThrow();
    });

    it('should handle empty temple data', () => {
      const result = decodeTempleData('empty');
      expect(result.rooms).toHaveLength(0);
    });
  });

  describe('parseTempleArray', () => {
    it('should parse room array correctly', () => {
      // Test array parsing
    });
  });

  describe('detectCharset', () => {
    it('should detect charset version', () => {
      // Test charset detection
    });
  });
});
```

#### Analyzer Tests
**File**: `src/__tests__/unit/analyzer.test.ts`

```typescript
import { analyzeTemple, countRoomsByTier, findTechPatterns } from '../../core/analyzer';

describe('Analyzer', () => {
  describe('analyzeTemple', () => {
    it('should return valid analysis', () => {
      const templeData = { /* valid data */ };
      const result = analyzeTemple(templeData);
      expect(result.score).toBeGreaterThan(0);
      expect(result.stars).toBeBetween(1, 5);
      expect(result.suggestions).toBeInstanceOf(Array);
    });

    it('should calculate room counts correctly', () => {
      // Test room counting logic
    });

    it('should detect Russian Tech pattern', () => {
      // Test Russian Tech detection
    });

    it('should detect Roman Road pattern', () => {
      // Test Roman Road detection
    });

    it('should generate improvement suggestions', () => {
      // Test suggestions generation
    });
  });

  describe('countRoomsByTier', () => {
    it('should count rooms by tier', () => {
      // Test tier counting
    });
  });
});
```

#### Scorer Tests
**File**: `src/__tests__/unit/scorer.test.ts`

```typescript
import { calculateOverallScore, calculateStarRating, generateSuggestions } from '../../core/scorer';

describe('Scorer', () => {
  describe('calculateOverallScore', () => {
    it('should calculate correct score', () => {
      const analysis = { /* analysis data */ };
      const score = calculateOverallScore(analysis);
      expect(score).toBeBetween(0, 1000);
    });

    it('should weight room tiers correctly', () => {
      // Test tier weighting
    });

    it('should apply tech pattern bonuses', () => {
      // Test tech bonuses
    });
  });

  describe('calculateStarRating', () => {
    it('should return 5 stars for excellent temples', () => {
      expect(calculateStarRating(900)).toBe(5);
    });

    it('should return 1 star for poor temples', () => {
      expect(calculateStarRating(100)).toBe(1);
    });

    it('should handle edge case thresholds', () => {
      expect(calculateStarRating(850)).toBe(5); // Boundary
      expect(calculateStarRating(849)).toBe(4);
    });
  });
});
```

### Step 4: Create Security Tests

#### XSS Tests
**File**: `src/__tests__/security/xss.test.ts`

```typescript
import { analyzeTempleUrl } from '../../tools/analyze-temple-url';

describe('XSS Security', () => {
  it('should escape script tags in suggestions', () => {
    const maliciousUrl = 'https://evil.com/?t=<script>alert(1)</script>';
    const result = analyzeTempleUrl(maliciousUrl);
    expect(result.suggestions.join('')).not.toContain('<script>');
  });

  it('should handle iframe injection attempts', () => {
    const maliciousUrl = 'https://evil.com/?t=<iframe>';
    const result = analyzeTempleUrl(maliciousUrl);
    expect(result.suggestions.join('')).not.toContain('<iframe>');
  });

  it('should sanitize HTML entities', () => {
    const maliciousUrl = 'https://evil.com/?t=<img src=x onerror=alert(1)>';
    const result = analyzeTempleUrl(maliciousUrl);
    expect(result.suggestions.join('')).not.toContain('onerror');
  });
});
```

#### Input Validation Tests
**File**: `src/__tests__/security/validation.test.ts`

```typescript
import { validateShareURL, extractShareData } from '../../utils/url-parser';

describe('Input Validation', () => {
  it('should reject non-HTTP protocols', () => {
    expect(validateShareURL('javascript:alert(1)')).toBe(false);
    expect(validateShareURL('data:text/html,<script>')).toBe(false);
  });

  it('should reject URLs without temple data', () => {
    expect(validateShareURL('https://valid.com')).toBe(false);
  });

  it('should reject malformed URLs', () => {
    expect(validateShareURL('not-a-url')).toBe(false);
  });

  it('should accept valid temple URLs', () => {
    expect(validateShareURL('https://poe2.com/?t=abc123')).toBe(true);
  });
});
```

### Step 5: Create Integration Tests

#### MCP Tools Integration
**File**: `src/__tests__/integration/mcp-tools.test.ts`

```typescript
import { analyzeTempleUrlTool, analyzeTempleDataTool } from '../../tools';

describe('MCP Tools Integration', () => {
  it('should analyze temple from URL', async () => {
    const url = 'https://poe2.com/?t=valid123';
    const result = await analyzeTempleUrlTool.handler(url);
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('stars');
    expect(result).toHaveProperty('suggestions');
  });

  it('should analyze temple from data', async () => {
    const data = { /* valid temple data */ };
    const result = await analyzeTempleDataTool.handler(data);
    expect(result).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    await expect(analyzeTempleUrlTool.handler('invalid')).rejects.toThrow();
  });
});
```

#### End-to-End Tests
**File**: `src/__tests__/integration/end-to-end.test.ts`

```typescript
describe('End-to-End Workflow', () => {
  it('should process real temple URL', () => {
    const realUrl = 'https://www.pathofexile.com/passive-skill-tree?t=...';
    const data = extractShareData(realUrl);
    const decoded = decodeTempleData(data);
    const analysis = analyzeTemple(decoded);
    expect(analysis.score).toBeGreaterThan(0);
  });
});
```

### Step 6: Create Performance Tests

#### Benchmark Tests
**File**: `src/__tests__/performance/benchmark.test.ts`

```typescript
describe('Performance Benchmarks', () => {
  it('should decode temple data in < 100ms', () => {
    const start = Date.now();
    decodeTempleData(largeTempleData);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('should analyze temple in < 200ms', () => {
    const templeData = generateLargeTemple();
    const start = Date.now();
    analyzeTemple(templeData);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(200);
  });

  it('should handle maximum size temple', () => {
    const maxTemple = generateMaxSizeTemple();
    const analysis = analyzeTemple(maxTemple);
    expect(analysis).toBeDefined();
  });
});
```

### Step 7: Update Package.json Scripts
**File**: `poe2-temple-analyzer/package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest src/__tests__/unit",
    "test:integration": "jest src/__tests__/integration",
    "test:security": "jest src/__tests__/security",
    "test:performance": "jest src/__tests__/performance",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --coverage --ci"
  }
}
```

### Step 8: Run Coverage Analysis
```bash
cd poe2-temple-analyzer
npm run test:coverage
```

Verify:
- Coverage ≥ 80% for all metrics
- Identify gaps in coverage
- Add tests for uncovered lines

### Step 9: Add CI/CD Integration
**File**: `.github/workflows/test.yml`

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd poe2-temple-analyzer && npm install
      - run: cd poe2-temple-analyzer && npm run test:ci
      - uses: codecov/codecov-action@v3
```

## Todo List

### Setup
- [ ] Configure Jest coverage thresholds
- [ ] Create test fixtures (sample-urls.json)
- [ ] Create directory structure for tests
- [ ] Update package.json test scripts

### Unit Tests
- [ ] Create decoder.test.ts (decode functions)
- [ ] Create analyzer.test.ts (analysis logic)
- [ ] Create scorer.test.ts (scoring algorithms)
- [ ] Create url-parser.test.ts (URL utilities)
- [ ] Create bit-ops.test.ts (bit operations)

### Security Tests
- [ ] Create xss.test.ts (XSS attempts)
- [ ] Create injection.test.ts (injection attacks)
- [ ] Create validation.test.ts (input validation)

### Integration Tests
- [ ] Create mcp-tools.test.ts (tool integration)
- [ ] Create end-to-end.test.ts (full workflow)
- [ ] Create real-urls.test.ts (actual URLs)

### Performance Tests
- [ ] Create benchmark.test.ts (timing tests)
- [ ] Create load.test.ts (large datasets)

### Coverage & CI/CD
- [ ] Run coverage report
- [ ] Address coverage gaps
- [ ] Add GitHub Actions workflow
- [ ] Configure Codecov reporting

### Final
- [ ] All tests pass locally
- [ ] Coverage ≥ 80% achieved
- [ ] CI/CD pipeline green
- [ ] Documentation updated

## Success Criteria

- [ ] Code coverage ≥ 80% (branches, functions, lines, statements)
- [ ] All tests pass in < 30 seconds
- [ ] Security tests cover XSS, injection, validation
- [ ] Integration tests cover full workflow
- [ ] Performance tests establish benchmarks
- [ ] CI/CD runs tests automatically
- [ ] Coverage report visible in PRs

## Risk Assessment

### Medium Risk
- **Test Flakiness**: Integration tests may be flaky with external URLs
  - **Mitigation**: Use mocked fixtures for reliability
  - **Fallback**: Mark integration tests as optional in CI

### Low Risk
- **Coverage Targets**: May need to adjust thresholds
  - **Mitigation**: Start with 70%, increase to 80% incrementally

## Next Steps

### Immediate (This Phase)
1. Configure Jest and coverage
2. Create unit tests for core modules
3. Add security tests
4. Run coverage and address gaps

### Following Phases
- **Phase 04**: Document testing strategy and coverage

### Dependencies
- Depends on Phase 02 (modular structure needed for testing)
- Phase 04 uses coverage data for documentation

## Testing Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Test names should describe the scenario
3. **One Assertion Per Test**: Keep tests focused
4. **Mock External Dependencies**: URLs, network calls
5. **Test Edge Cases**: Empty, null, invalid inputs
6. **Test Security**: XSS, injection, validation
7. **Performance Tests**: Establish and monitor benchmarks
8. **Fix Flaky Tests**: Investigate and fix immediately

## Notes

- **Write tests first** where possible (TDD approach)
- **Keep tests simple** and focused
- **Use meaningful fixtures** that represent real data
- **Run tests frequently** during development
- **Don't test trivial code** (getters, simple wrappers)
- **Test behavior, not implementation** (black-box testing)
- **Keep tests fast** - < 30 seconds for full suite
- **Document test scenarios** in comments when complex
