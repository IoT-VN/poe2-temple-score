# Phase 04: Documentation Improvements

**Date**: 2026-02-10
**Status**: Pending
**Priority**: MEDIUM
**Estimated Effort**: 4-6 hours

## Overview

Complete documentation gaps including API reference, CHANGELOG, deployment guide, troubleshooting guide, and code documentation (JSDoc).

## Context Links

- Parent plan: `plan.md`
- Depends on: `phase-02-modularization-refactoring.md`, `phase-03-testing-enhancement.md`
- Current docs: `README.md`, `AGENTS.md`, `CONTRIBUTING.md`

## Key Insights

1. **No API Reference**: MCP server tools lack comprehensive API documentation
2. **No CHANGELOG**: Version history and changes not tracked
3. **Missing Deployment Guide**: GitHub Pages deployment not documented
4. **Limited Troubleshooting**: No FAQ or common issues section
5. **No JSDoc Comments**: Most functions lack documentation
6. **No Code Examples**: Missing usage examples for common scenarios

## Requirements

### Functional Requirements
- Create comprehensive API reference for all MCP tools
- Add CHANGELOG.md with version history
- Create deployment guide for GitHub Pages
- Create troubleshooting guide with FAQ
- Add JSDoc comments to all public functions
- Add usage examples and tutorials

### Non-Functional Requirements
- Documentation should be clear and concise
- Include code examples where helpful
- Keep docs up-to-date with code changes
- Use consistent formatting and structure

## Architecture

### Current Documentation Structure
```
.
├── README.md (project overview)
├── AGENTS.md (development guide)
├── CONTRIBUTING.md (contribution guidelines)
├── LICENSE
└── docs/
    └── (empty or minimal)
```

### Target Documentation Structure
```
.
├── README.md (project overview - updated)
├── CHANGELOG.md (NEW - version history)
├── AGENTS.md (development guide - updated)
├── CONTRIBUTING.md (contribution guidelines - enhanced)
├── TROUBLESHOOTING.md (NEW - FAQ and solutions)
├── LICENSE
├── docs/
│   ├── api-reference.md (NEW - MCP tools API)
│   ├── deployment-guide.md (NEW - GitHub Pages)
│   ├── architecture.md (existing - update)
│   ├── development-roadmap.md (NEW - future plans)
│   └── examples/
│       ├── basic-usage.md (NEW)
│       ├── mcp-integration.md (NEW)
│       └── advanced-scenarios.md (NEW)
└── poe2-temple-analyzer/
    └── README.md (existing - update)
```

## Related Code Files

### Files to Create
1. `CHANGELOG.md` - Version history
2. `TROUBLESHOOTING.md` - FAQ and solutions
3. `docs/api-reference.md` - MCP tools documentation
4. `docs/deployment-guide.md` - GitHub Pages deployment
5. `docs/examples/basic-usage.md` - Usage examples
6. `docs/examples/mcp-integration.md` - MCP integration examples

### Files to Update
1. `README.md` - Add links to new docs
2. `AGENTS.md` - Update with new structure
3. `CONTRIBUTING.md` - Add testing documentation
4. `poe2-temple-analyzer/README.md` - Update API reference

### Code Files to Add JSDoc
1. `src/core/decoder.ts` - Decoder functions
2. `src/core/analyzer.ts` - Analysis functions
3. `src/core/scorer.ts` - Scoring functions
4. `src/tools/*.ts` - MCP tool handlers
5. `src/utils/*.ts` - Utility functions

## Implementation Steps

### Step 1: Create CHANGELOG.md
**File**: `CHANGELOG.md`

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive test suite with 80%+ coverage
- Security enhancements (XSS protection, input validation)
- Modular architecture (refactored from monolithic index.ts)

### Changed
- Improved error handling and validation
- Enhanced MCP tool performance

### Fixed
- XSS vulnerability in suggestions rendering
- Removed unused code and variables

## [1.0.0] - 2025-01-15

### Added
- Initial release
- Temple analysis from share URLs
- Star rating calculation (1-5 stars)
- Tech pattern detection (Russian Tech, Roman Road)
- MCP server integration
- Static website for temple visualization
```

### Step 2: Create Troubleshooting Guide
**File**: `TROUBLESHOOTING.md`

```markdown
# Troubleshooting Guide

## Common Issues

### MCP Server Not Starting

**Problem**: `npm start` fails with error
**Solutions**:
1. Ensure Node.js 20+ is installed: `node --version`
2. Clear build cache: `rm -rf dist/ && npm run build`
3. Reinstall dependencies: `rm -rf node_modules && npm install`

### Tests Failing

**Problem**: Test suite fails after changes
**Solutions**:
1. Run tests with verbose output: `npm test -- --verbose`
2. Check test coverage: `npm run test:coverage`
3. Update snapshots if needed: `npm test -- -u`

### Temple URL Not Parsing

**Problem**: Share URL returns "Invalid URL" error
**Solutions**:
1. Verify URL format: `?t=<encoded_data>` parameter present
2. Check URL protocol: must be `http://` or `https://`
3. Try a different share URL format

### GitHub Pages Not Deploying

**Problem**: Changes not appearing on GitHub Pages
**Solutions**:
1. Check workflow status: `.github/workflows/deploy.yml`
2. Verify branch is `master` or `main`
3. Clear GitHub Pages cache in repository settings

## FAQ

### Q: How do I integrate the MCP server with Claude?
A: Add to Claude's MCP configuration:
```json
{
  "mcpServers": {
    "poe2-temple-analyzer": {
      "command": "node",
      "args": ["/path/to/poe2-temple-analyzer/dist/index.js"]
    }
  }
}
```

### Q: What's the maximum temple size supported?
A: The analyzer supports up to 25 rooms (standard temple layout).

### Q: Can I analyze temples without a share URL?
A: Yes, use the `analyze_temple_data` tool with raw temple data.

### Q: How are star ratings calculated?
A: Star ratings are based on:
- Room tier distribution
- Tech pattern presence
- Reward density
- Layout efficiency

See `docs/api-reference.md` for detailed scoring criteria.

### Q: The analyzer gives a different score than I expected
A: Scores are calculated based on current PoE2 temple meta. Check:
- Room tier weights in `src/config/scoring-config.ts`
- Tech pattern bonuses
- Your temple may have hidden inefficiencies

## Getting Help

- GitHub Issues: https://github.com/IoT-VN/poe2-temple-score/issues
- Documentation: See `docs/` directory
- Development Guide: `AGENTS.md`
```

### Step 3: Create API Reference
**File**: `docs/api-reference.md`

```markdown
# MCP Server API Reference

## Overview

The PoE2 Temple Analyzer MCP Server provides tools for analyzing Path of Exile 2 Vaal Temple layouts.

## Tools

### analyze_temple

Analyzes a temple from a share URL.

**Parameters**:
- `url` (string): Temple share URL

**Returns**:
```typescript
{
  score: number;          // Overall score (0-1000)
  stars: number;          // Star rating (1-5)
  suggestions: string[];  // Improvement recommendations
  roomCounts: {           // Rooms by tier
    T1: number;
    T2: number;
    ...
    T7: number;
  };
  techPatterns: string[]; // Detected tech patterns
  rewards: Reward[];      // Reward rooms found
}
```

**Example**:
```typescript
const result = await analyzeTempleUrl(
  'https://www.pathofexile.com/passive-skill-tree?t=abc123'
);
console.log(`Score: ${result.score}, Stars: ${result.stars}`);
```

### analyze_temple_data

Analyzes a temple from raw data.

**Parameters**:
- `templeData` (TempleData): Raw temple data structure

**Returns**: Same as `analyze_temple`

**Example**:
```typescript
const templeData = {
  version: 1,
  rooms: [
    { id: 0, type: 'MARKET', tier: 5, x: 2, y: 2, connections: [1, 2] },
    // ...
  ]
};
const result = await analyzeTempleData(templeData);
```

### temple_info

Provides information about room types and mechanics.

**Parameters**:
- `roomType` (string, optional): Specific room type to query

**Returns**:
```typescript
{
  roomTypes: RoomTypeInfo[];
  mechanics: TempleMechanicInfo;
}
```

## Data Structures

### TempleData
```typescript
interface TempleData {
  version: number;
  rooms: Room[];
}
```

### Room
```typescript
interface Room {
  id: number;
  type: string;        // Room type (MARKET, ENCAMPMENT, etc.)
  tier: number;        // Tier level (1-7)
  x: number;           // Grid X coordinate
  y: number;           // Grid Y coordinate
  connections: number[]; // Connected room IDs
}
```

### TempleAnalysis
```typescript
interface TempleAnalysis {
  score: number;
  stars: number;
  suggestions: string[];
  roomCounts: Record<string, number>;
  techPatterns: string[];
  rewards: Reward[];
  efficiency: number;  // Layout efficiency (0-1)
}
```

## Scoring System

### Score Calculation

Overall score is calculated from:
1. **Room Tier Score** (40%): Weighted sum of room tiers
2. **Tech Pattern Bonus** (25%): Bonus for detected patterns
3. **Layout Efficiency** (20%): Path optimization score
4. **Reward Density** (15%): Value of reward rooms

### Star Rating Thresholds

- **5 Stars**: 850-1000 points (Excellent)
- **4 Stars**: 700-849 points (Very Good)
- **3 Stars**: 550-699 points (Good)
- **2 Stars**: 400-549 points (Fair)
- **1 Star**: 0-399 points (Poor)

### Tech Patterns

#### Russian Tech
Three or more T7 rooms connected in a line.
- **Bonus**: +150 points

#### Roman Road
Path of T6+ rooms from top to bottom.
- **Bonus**: +100 points

#### Double Triple
Two separate triple-T7 clusters.
- **Bonus**: +120 points

## Error Handling

All tools return errors in the following format:

```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Error Codes

- `INVALID_URL`: Malformed or missing share URL
- `INVALID_TEMPLE_DATA`: Temple data structure is invalid
- `DECODE_ERROR`: Failed to decode temple data
- `ANALYSIS_ERROR`: Analysis algorithm failed

## Rate Limiting

The MCP server has no built-in rate limiting.
Implement rate limiting at the application level if needed.
```

### Step 4: Create Deployment Guide
**File**: `docs/deployment-guide.md`

```markdown
# Deployment Guide

## GitHub Pages Deployment

The static website is automatically deployed to GitHub Pages on push to `master` branch.

### Automatic Deployment

1. Push changes to `master` branch
2. GitHub Actions workflow `.github/workflows/deploy.yml` runs automatically
3. Site deploys to `https://iot-vn.github.io/poe2-temple-score/`

### Manual Deployment

If automatic deployment fails:

1. Check workflow status in GitHub Actions tab
2. Review deployment logs for errors
3. Re-run workflow if needed

### Local Testing

Before deploying:

```bash
# Install dependencies
npm install

# Serve locally
npx serve .

# Open http://localhost:3000
```

## MCP Server Deployment

### Local Installation

```bash
cd poe2-temple-analyzer
npm install
npm run build
npm start
```

### Production Installation

1. Clone repository:
```bash
git clone https://github.com/IoT-VN/poe2-temple-score.git
cd poe2-temple-score/poe2-temple-analyzer
```

2. Install and build:
```bash
npm install --production
npm run build
```

3. Run server:
```bash
npm start
```

### Docker Deployment (Optional)

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY poe2-temple-analyzer/package*.json ./
RUN npm install --production
COPY poe2-temple-analyzer/ .
RUN npm run build
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t poe2-temple-analyzer .
docker run -d poe2-temple-analyzer
```

### Environment Variables

No environment variables required for basic operation.

Optional variables:
- `LOG_LEVEL`: Log verbosity (default: `info`)
- `NODE_ENV`: Environment (default: `production`)

## Claude Desktop Integration

### Configuration

Add to Claude Desktop MCP configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "poe2-temple-analyzer": {
      "command": "node",
      "args": [
        "/absolute/path/to/poe2-temple-score/poe2-temple-analyzer/dist/index.js"
      ]
    }
  }
}
```

### Verification

Restart Claude Desktop and check:
1. Claude should acknowledge the MCP server
2. Test with: "Analyze this temple URL: [URL]"
3. Verify analysis results are accurate

## Troubleshooting Deployment

### GitHub Pages Not Updating

1. Clear GitHub Pages cache:
   - Go to Repository Settings → Pages
   - Click "Clear cache" button

2. Check deployment workflow:
   - Go to Actions tab
   - Review `deploy.yml` workflow logs

3. Verify branch:
   - Ensure `master` branch is selected in Pages settings
   - Check `/root` folder is selected as source

### MCP Server Not Connecting

1. Verify absolute path in config
2. Check `dist/index.js` exists: `ls poe2-temple-analyzer/dist/`
3. Test server manually: `cd poe2-temple-analyzer && npm start`
4. Check Claude Desktop logs for errors
```

### Step 5: Add Code Examples

#### Basic Usage Example
**File**: `docs/examples/basic-usage.md`

```markdown
# Basic Usage Examples

## Analyzing a Temple URL

```typescript
import { analyzeTempleUrl } from 'poe2-temple-analyzer';

const url = 'https://www.pathofexile.com/passive-skill-tree?t=abc123';
const result = await analyzeTempleUrl(url);

console.log(`Score: ${result.score}/1000`);
console.log(`Stars: ${result.stars}/5`);
console.log(`Suggestions: ${result.suggestions.join(', ')}`);
```

## Analyzing Temple Data

```typescript
const templeData = {
  version: 1,
  rooms: [
    {
      id: 0,
      type: 'MARKET',
      tier: 5,
      x: 2,
      y: 2,
      connections: [1, 2]
    }
  ]
};

const result = await analyzeTempleData(templeData);
console.log(`Efficiency: ${result.efficiency * 100}%`);
```

## Getting Room Information

```typescript
const info = await getTempleInfo('MARKET');
console.log(`Market Room: ${info.description}`);
console.log(`Max Tier: ${info.maxTier}`);
```

## Handling Errors

```typescript
try {
  const result = await analyzeTempleUrl(invalidUrl);
} catch (error) {
  if (error.code === 'INVALID_URL') {
    console.error('Invalid temple URL');
  } else {
    console.error('Analysis failed:', error.message);
  }
}
```
```

### Step 6: Add JSDoc Comments

Update code files with JSDoc:

**Example for `src/core/analyzer.ts`**:

```typescript
/**
 * Analyzes a temple layout and calculates quality metrics.
 *
 * @param templeData - The temple data to analyze
 * @returns Analysis results including score, stars, and suggestions
 *
 * @example
 * ```ts
 * const analysis = analyzeTemple(templeData);
 * console.log(`Score: ${analysis.score}, Stars: ${analysis.stars}`);
 * ```
 *
 * @throws {Error} If temple data is invalid
 */
export function analyzeTemple(templeData: TempleData): TempleAnalysis {
  // Implementation
}

/**
 * Counts rooms by their tier level.
 *
 * @param rooms - Array of rooms to count
 * @returns Object mapping tier numbers to room counts
 *
 * @example
 * ```ts
 * const counts = countRoomsByTier(rooms);
 * console.log(`T7 rooms: ${counts.T7}`);
 * ```
 */
export function countRoomsByTier(rooms: Room[]): Record<string, number> {
  // Implementation
}
```

### Step 7: Update README.md

Add links to new documentation:

```markdown
## Documentation

- [CHANGELOG.md](CHANGELOG.md) - Version history and changes
- [API Reference](docs/api-reference.md) - Complete MCP server API documentation
- [Deployment Guide](docs/deployment-guide.md) - How to deploy and configure
- [Troubleshooting](TROUBLESHOOTING.md) - FAQ and common issues
- [Examples](docs/examples/) - Usage examples and tutorials
- [AGENTS.md](AGENTS.md) - Development guide for AI agents
- [Architecture](docs/architecture.md) - System architecture and design
```

### Step 8: Update AGENTS.md

Add testing documentation:

```markdown
## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:security
npm run test:performance

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Coverage Goals

Target: 80%+ coverage across all metrics (branches, functions, lines, statements)

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```
```

## Todo List

### Core Documentation
- [ ] Create CHANGELOG.md
- [ ] Create TROUBLESHOOTING.md
- [ ] Create API reference (docs/api-reference.md)
- [ ] Create deployment guide (docs/deployment-guide.md)

### Code Documentation
- [ ] Add JSDoc to decoder.ts
- [ ] Add JSDoc to analyzer.ts
- [ ] Add JSDoc to scorer.ts
- [ ] Add JSDoc to all tool handlers
- [ ] Add JSDoc to utility functions

### Examples
- [ ] Create basic-usage.md
- [ ] Create mcp-integration.md
- [ ] Create advanced-scenarios.md

### Updates
- [ ] Update README.md with new docs links
- [ ] Update AGENTS.md with testing section
- [ ] Update poe2-temple-analyzer/README.md
- [ ] Verify all links work

### Review
- [ ] Proofread all documentation
- [ ] Test examples for accuracy
- [ ] Get feedback from users

## Success Criteria

- [ ] CHANGELOG.md follows Keep a Changelog format
- [ ] All public functions have JSDoc comments
- [ ] API reference documents all tools and data structures
- [ ] Deployment guide covers GitHub Pages and MCP server
- [ ] Troubleshooting guide has 5+ common issues
- [ ] All examples tested and working
- [ ] All documentation links verified

## Risk Assessment

### Low Risk
- **Documentation Outdated**: Docs may become stale as code changes
  - **Mitigation**: Update docs in same PR as code changes
  - **Review**: Check docs during code review

## Next Steps

### Immediate (This Phase)
1. Create CHANGELOG.md
2. Create API reference
3. Add JSDoc to core modules

### Maintenance
- Update CHANGELOG with every release
- Review docs quarterly for accuracy
- Add examples for common user requests

### Dependencies
- Depends on Phase 02 (module structure for JSDoc)
- Depends on Phase 03 (coverage data for completeness)

## Documentation Best Practices

1. **Keep It Simple**: Clear, concise language
2. **Show, Don't Tell**: Use code examples
3. **Stay Current**: Update docs with code changes
4. **Be Consistent**: Use standard formatting
5. **Know Your Audience**: Separate user vs dev docs
6. **Proofread**: Check for clarity and accuracy
7. **Link Liberally**: Connect related docs
8. **Version Your Docs**: Match docs to code versions
