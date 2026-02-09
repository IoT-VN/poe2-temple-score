# Phase 05: Performance Optimization

**Date**: 2026-02-10
**Status**: Pending
**Priority**: LOW
**Estimated Effort**: 4-6 hours

## Overview

Optimize performance bottlenecks including DOM manipulation, algorithmic complexity, memory usage, and add caching mechanisms.

## Context Links

- Parent plan: `plan.md`
- Depends on: `phase-02-modularization-refactoring.md`, `phase-03-testing-enhancement.md`
- Performance benchmarks: `src/__tests__/performance/benchmark.test.ts`

## Key Insights

1. **Inefficient DOM**: Multiple DOM queries in `analyzeTemple()`
2. **No Caching**: Repeated analysis of same temple reprocesses
3. **O(n²) Algorithm**: Snake finding has quadratic complexity
4. **Large Objects**: Room type definitions loaded at startup
5. **Synchronous Processing**: No async for long operations

## Requirements

### Functional Requirements
- Add caching layer for temple analysis results
- Optimize DOM manipulation (cache queries, batch updates)
- Improve algorithmic complexity where possible
- Add memoization for expensive calculations
- Lazy load non-critical resources

### Non-Functional Requirements
- Maintain backward compatibility
- Pass all existing tests
- No increase in bundle size
- Clear performance improvements

## Architecture

### Current Performance Profile
```
URL Parsing: ~5ms
Data Decoding: ~50ms
Temple Analysis: ~150ms (O(n²) snake finding)
DOM Rendering: ~30ms
Total: ~235ms
```

### Target Performance Profile
```
URL Parsing: ~5ms (no change)
Data Decoding: ~50ms (no change)
Temple Analysis: ~100ms (cached or O(n log n))
DOM Rendering: ~10ms (optimized)
Total: ~165ms (30% improvement)
```

### Caching Architecture
```
┌─────────────┐
│ Client      │
│ (Browser)   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ In-Memory Cache │ ← LRU Cache (100 temples)
│ (Optional)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Analysis Engine │
│ (Optimized)     │
└─────────────────┘
```

## Related Code Files

### Files to Create
1. `src/utils/cache.ts` - LRU cache implementation
2. `src/utils/memoize.ts` - Memoization utilities
3. `src/core/optimizer.ts` - Algorithm optimization

### Files to Modify
1. `temple-rating.html` - Optimize DOM manipulation
2. `src/core/analyzer.ts` - Add caching, optimize algorithms
3. `src/core/scorer.ts` - Add memoization
4. `poe2-temple-analyzer/package.json` - Add cache library if needed

### Files to Reference
1. `src/__tests__/performance/benchmark.test.ts` - Performance tests

## Implementation Steps

### Step 1: Add Caching Layer

#### Create LRU Cache
**File**: `src/utils/cache.ts`

```typescript
/**
 * Simple LRU (Least Recently Used) cache implementation.
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    // Remove existing key to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Remove oldest if at capacity
    else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
```

#### Integrate Cache
**File**: `src/core/analyzer.ts`

```typescript
import { LRUCache } from '../utils/cache';

// Create cache instance (100 temples)
const analysisCache = new LRUCache<string, TempleAnalysis>(100);

export function analyzeTemple(templeData: TempleData): TempleAnalysis {
  // Generate cache key from temple data
  const cacheKey = JSON.stringify(templeData);

  // Check cache
  const cached = analysisCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Perform analysis
  const analysis = performAnalysis(templeData);

  // Cache result
  analysisCache.set(cacheKey, analysis);

  return analysis;
}

/**
 * Clear the analysis cache.
 */
export function clearAnalysisCache(): void {
  analysisCache.clear();
}
```

### Step 2: Optimize DOM Manipulation

#### Cache DOM Queries
**File**: `temple-rating.html`

```javascript
// Cache DOM elements (lazy initialization)
const DOM = {
  get elements() {
    if (!this._cached) {
      this._cached = {
        urlInput: document.getElementById('urlInput'),
        analyzeBtn: document.getElementById('analyzeBtn'),
        resultsDiv: document.getElementById('results'),
        // ... cache all frequently accessed elements
      };
    }
    return this._cached;
  }
};

// Use cached elements
function analyzeTemple() {
  const url = DOM.elements.urlInput.value;
  // ... rest of analysis
}
```

#### Batch DOM Updates
```javascript
// Batch updates to reduce reflows
function renderResults(analysis) {
  const fragment = document.createDocumentFragment();

  // Build all elements in fragment (not in DOM)
  analysis.suggestions.forEach(suggestion => {
    const li = document.createElement('li');
    li.textContent = suggestion;
    fragment.appendChild(li);
  });

  // Single DOM insertion
  DOM.elements.results.innerHTML = '';
  DOM.elements.results.appendChild(fragment);
}
```

### Step 3: Optimize Algorithms

#### Improve Snake Finding
**File**: `src/core/analyzer.ts`

Current: O(n²) - Check all room pairs
Optimized: O(n) - Single pass with spatial indexing

```typescript
/**
 * Optimized snake finding using spatial indexing.
 * Time complexity: O(n) instead of O(n²)
 */
export function findSnakesOptimized(rooms: Room[]): Room[][] {
  // Build spatial grid
  const grid = new Map<string, Room>();
  rooms.forEach(room => {
    const key = `${room.x},${room.y}`;
    grid.set(key, room);
  });

  const snakes: Room[][] = [];
  const visited = new Set<number>();

  rooms.forEach(room => {
    if (visited.has(room.id)) return;

    const snake = findSnakeFromRoom(room, grid, visited);
    if (snake.length >= 3) {
      snakes.push(snake);
    }
  });

  return snakes;
}

function findSnakeFromRoom(
  startRoom: Room,
  grid: Map<string, Room>,
  visited: Set<number>
): Room[] {
  const snake: Room[] = [startRoom];
  visited.add(startRoom.id);

  // Directions: up, down, left, right
  const directions = [
    [0, -1], [0, 1], [-1, 0], [1, 0]
  ];

  // Extend snake in both directions
  // ... optimized algorithm
}
```

### Step 4: Add Memoization

#### Memoize Expensive Functions
**File**: `src/utils/memoize.ts`

```typescript
/**
 * Memoizes a function with a cache.
 */
export function memoize<Args extends unknown[], Result>(
  fn: (...args: Args) => Result,
  keyGenerator?: (...args: Args) => string
): (...args: Args) => Result {
  const cache = new Map<string, Result>();

  return (...args: Args): Result => {
    const key = keyGenerator
      ? keyGenerator(...args)
      : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
```

#### Apply to Scoring
**File**: `src/core/scorer.ts`

```typescript
import { memoize } from '../utils/memoize';

// Memoize expensive calculations
export const calculateRoomValue = memoize(
  (roomType: string, tier: number): number => {
    // Expensive calculation
    return baseValue * tierMultiplier;
  },
  (roomType, tier) => `${roomType}-${tier}` // Custom cache key
);
```

### Step 5: Lazy Load Room Types

**File**: `src/config/room-types.ts`

```typescript
// Lazy load room types on first access
let ROOM_TYPES: RoomTypesConfig | null = null;

export function getRoomTypes(): RoomTypesConfig {
  if (!ROOM_TYPES) {
    // Load on first access
    ROOM_TYPES = loadRoomTypes();
  }
  return ROOM_TYPES;
}

// Or use dynamic imports (if modularized)
export async function getRoomTypesAsync(): Promise<RoomTypesConfig> {
  const module = await import('./room-types-data.js');
  return module.ROOM_TYPES;
}
```

### Step 6: Add Performance Monitoring

**File**: `src/utils/performance.ts`

```typescript
/**
 * Performance monitoring utilities.
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    this.record(name, duration);
    return result;
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    this.record(name, duration);
    return result;
  }

  private record(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
  }

  getStats(name: string): { avg: number; min: number; max: number } {
    const timings = this.metrics.get(name) || [];
    return {
      avg: timings.reduce((a, b) => a + b, 0) / timings.length,
      min: Math.min(...timings),
      max: Math.max(...timings),
    };
  }

  report(): void {
    console.log('Performance Metrics:');
    this.metrics.forEach((timings, name) => {
      const stats = this.getStats(name);
      console.log(`  ${name}: avg=${stats.avg.toFixed(2)}ms`);
    });
  }
}
```

#### Use in Analysis
```typescript
import { PerformanceMonitor } from '../utils/performance';

const monitor = new PerformanceMonitor();

export function analyzeTemple(templeData: TempleData): TempleAnalysis {
  return monitor.measure('analyzeTemple', () => {
    // Analysis logic
  });
}
```

### Step 7: Optimize Bundle Size

**File**: `poe2-temple-analyzer/package.json`

```json
{
  "scripts": {
    "build": "tsc",
    "build:analyze": "npm run build && npx bundlephobia-cli dist/",
    "build:prod": "tsc --build --clean && tsc"
  }
}
```

Check for tree-shaking:
```typescript
// Use named exports (tree-shakeable)
export function analyzeTemple() { /* ... */ }

// NOT default exports (harder to tree-shake)
// export default function analyzeTemple() { /* ... */ }
```

### Step 8: Add Performance Tests

**File**: `src/__tests__/performance/benchmark.test.ts`

```typescript
describe('Performance Benchmarks', () => {
  it('should analyze temple in < 100ms', () => {
    const templeData = generateLargeTemple();
    const start = performance.now();
    analyzeTemple(templeData);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('should use cache effectively', () => {
    const templeData = generateTemple();

    // First call (not cached)
    const start1 = performance.now();
    analyzeTemple(templeData);
    const duration1 = performance.now() - start1;

    // Second call (cached)
    const start2 = performance.now();
    analyzeTemple(templeData);
    const duration2 = performance.now() - start2;

    // Cached call should be 10x faster
    expect(duration2).toBeLessThan(duration1 / 10);
  });

  it('should handle large temples efficiently', () => {
    const maxTemple = generateMaxSizeTemple(); // 25 rooms
    const start = performance.now();
    analyzeTemple(maxTemple);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(150);
  });
});
```

### Step 9: Profile and Optimize

Run profiling:
```bash
# Node.js profiling
node --prof poe2-temple-analyzer/dist/index.js
node --prof-process isolate-*.log > profile.txt

# Identify hot spots
# Optimize top 5 functions
```

### Step 10: Document Performance

Add to docs:
```markdown
## Performance

### Benchmarks
- Temple analysis: ~100ms (cached: ~5ms)
- URL parsing: ~5ms
- DOM rendering: ~10ms

### Optimization Tips
- Use cache for repeated analyses
- Clear cache if memory is concern
- Precompute values for bulk analysis
```

## Todo List

### Caching
- [ ] Create LRU cache implementation
- [ ] Integrate cache into analyzer
- [ ] Add cache management API
- [ ] Test cache effectiveness

### DOM Optimization
- [ ] Cache DOM element queries
- [ ] Batch DOM updates
- [ ] Reduce reflows and repaints
- [ ] Measure improvements

### Algorithm Optimization
- [ ] Optimize snake finding (O(n²) → O(n))
- [ ] Improve spatial indexing
- [ ] Add early exit conditions
- [ ] Profile hot spots

### Memoization
- [ ] Create memoize utility
- [ ] Apply to expensive functions
- [ ] Add cache invalidation
- [ ] Test memory usage

### Monitoring
- [ ] Create PerformanceMonitor
- [ ] Add metrics collection
- [ ] Create performance dashboard
- [ ] Set up alerts

### Testing
- [ ] Create benchmark tests
- [ ] Test cache effectiveness
- [ ] Profile memory usage
- [ ] Verify no regressions

### Documentation
- [ ] Document performance characteristics
- [ ] Add optimization tips
- [ ] Create performance guide
- [ ] Update API docs

## Success Criteria

- [ ] Average analysis time < 100ms (30% improvement)
- [ ] Cached analysis < 10ms
- [ ] Memory usage stable (no leaks)
- [ ] DOM updates batched
- [ ] Cache hit rate > 50% for typical usage
- [ ] All performance tests pass
- [ ] No increase in bundle size

## Risk Assessment

### Low Risk
- **Cache Invalidation**: May return stale results
  - **Mitigation**: Clear cache on version updates
  - **Manual**: Provide cache clearing API

### Medium Risk
- **Memory Usage**: Caching increases memory
  - **Mitigation**: LRU cache limits size
  - **Monitor**: Add memory profiling

## Performance Targets

### Response Times
- URL parsing: < 10ms
- Data decoding: < 60ms
- Temple analysis: < 100ms (first), < 10ms (cached)
- DOM rendering: < 15ms

### Resource Usage
- Memory: < 50MB (including cache)
- Cache size: 100 temples max
- Bundle size: No increase

## Next Steps

### Immediate (This Phase)
1. Implement LRU cache
2. Optimize DOM manipulation
3. Add performance monitoring

### Future Enhancements
- Web Workers for parallel processing
- IndexedDB for persistent cache
- Service Worker for offline support

### Dependencies
- Depends on Phase 02 (modular structure)
- Depends on Phase 03 (performance benchmarks)

## Optimization Strategy

1. **Measure First**: Profile before optimizing
2. **Target Hotspots**: Focus on slowest functions
3. **Cache Wisely**: Cache expensive, repeatable operations
4. **Batch Operations**: Minimize DOM/IO operations
5. **Monitor Continuously**: Track performance over time

## Notes

- **Don't premature optimize** - measure first
- **Cache invalidation is hard** - keep it simple
- **Profile in production** - not just dev
- **Consider tradeoffs** - memory vs speed
- **Document optimizations** - for future maintainers
- **Re-benchmark periodically** - ensure no regressions
