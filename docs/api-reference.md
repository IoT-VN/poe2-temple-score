# MCP Server API Reference

Complete API documentation for the PoE2 Temple Analyzer MCP Server.

## Overview

The MCP Server provides tools for analyzing Path of Exile 2 Vaal Temple layouts. It integrates with Claude Desktop and other MCP-compatible applications.

**Server Name**: `poe2-temple-analyzer`
**Version**: `1.0.0`
**Protocol**: Model Context Protocol (MCP)

---

## Tools

### analyze_temple

Analyzes a temple from a share URL and calculates quality metrics.

**Parameters**:
```typescript
{
  shareUrl: string  // Temple share URL containing ?t= parameter
}
```

**Returns**:
```typescript
{
  content: [{
    type: "text",
    text: string  // JSON string of TempleAnalysis
  }]
}
```

**Example**:
```typescript
const result = await analyzeTempleUrl({
  shareUrl: 'http://localhost:8080/#/temple?t=ABC123'
});

const analysis = JSON.parse(result.content[0].text);
console.log(`Score: ${analysis.totalScore}, Stars: ${analysis.starRating}`);
```

---

### analyze_temple_data

Analyzes temple data directly from a decoded JSON structure.

**Parameters**:
```typescript
{
  templeData: TempleData  // Raw temple data object
}
```

**Returns**: Same format as `analyze_temple`

**TempleData Structure**:
```typescript
interface TempleData {
  grid: { [key: string]: Room };  // Key: "x,y"
  decodedRooms?: Room[];
}
```

**Example**:
```typescript
const templeData = {
  grid: {
    '0,0': { x: 0, y: 0, room: 'alchemy_lab', tier: 5 },
    '1,0': { x: 1, y: 0, room: 'vault', tier: 6 }
  }
};

const result = await analyzeTempleData({ templeData });
```

---

### get_room_info

Provides information about a specific room type.

**Parameters**:
```typescript
{
  roomType: string  // Room type name (e.g., 'alchemy_lab', 'vault')
}
```

**Returns**:
```typescript
{
  content: [{
    type: "text",
    text: string  // JSON string of room info
  }]
}
```

**Available Room Types**:
- `alchemy_lab`, `armoury`, `corruption`, `flesh_surgeon`
- `garrison`, `generator`, `golem_works`, `reward_currency`
- `smithy`, `synthflesh`, `thaumaturge`, `transcendent_barracks`
- `vault`, `viper_legion_barracks`, `viper_spymaster`
- `commander`, `architect`, `boss`, `atziri`
- `medallion_bonus`, `medallion_reroll`, etc.

**Example**:
```typescript
const result = await getRoomInfo({ roomType: 'viper_spymaster' });
const info = JSON.parse(result.content[0].text);
// Returns: { type: 'reward', rewardValue: 3, isReward: true }
```

---

### get_rating_criteria

Returns the scoring criteria and formulas used for star ratings.

**Parameters**: None

**Returns**:
```typescript
{
  content: [{
    type: "text",
    text: string  // JSON string of scoring criteria
  }]
}
```

**Includes**:
- Snake score breakdown (0-40 points)
- Room quality score breakdown (0-50 points)
- Quantity score breakdown (0-15 points)
- Star rating thresholds
- Encoding information

**Example**:
```typescript
const result = await getRatingCriteria();
const criteria = JSON.parse(result.content[0].text);
console.log(criteria.scoring);
```

---

## Data Structures

### TempleAnalysis

```typescript
interface TempleAnalysis {
  roomCount: number;           // Total rooms in temple
  rewardRooms: number;         // Count of reward rooms
  architectRooms: number;      // Count of architect rooms
  bossRooms: number;           // Count of boss rooms
  highTierRooms: number;       // T6+ rooms
  spymasters: number;          // Viper Spymaster count
  golems: number;              // Golem Works count
  t7Rooms: number;             // T7 rooms
  snakeScore: number;          // 0-40 points
  roomScore: number;           // 0-50 points
  quantityScore: number;       // 0-15 points
  totalScore: number;          // 0-105 points
  starRating: number;          // 1-5 stars
  ratingDescription: string;   // Human-readable rating
  suggestions: string[];       // Improvement recommendations
  decodedRooms?: Room[];       // Decoded room data
}
```

### Room

```typescript
interface Room {
  x: number;                  // Grid X coordinate (0-15)
  y: number;                  // Grid Y coordinate (0-15)
  room: string;               // Room type name
  tier?: number;              // Tier level (0-7)
  roomTypeId?: number;        // Numeric room type ID
  connections?: string[];     // Connected room IDs
}
```

---

## Scoring System

### Score Components

1. **Snake Score (0-40 points)**
   - 8+ connected rooms: 40 points
   - 6-7 rooms: 35 points
   - 5 rooms: 30 points
   - 4 rooms: 25 points
   - 3 rooms: 15 points
   - 2 rooms: 6 points
   - 0-1 rooms: 2 points

2. **Room Quality Score (0-50 points)**
   - Spymaster: +10 points each
   - Golem Works: +8 points each
   - T7 Room: +30 points each
   - T6 Room: +3 points each (max 15)
   - 5+ T6+ Rooms: +10 points

3. **Quantity Score (0-15 points)**
   - Reward rooms × 0.8 (max 15)

### Star Rating

- **5 Stars**: 90-105 points (God Tier)
- **4.5 Stars**: 75-89 points (Excellent)
- **4 Stars**: 60-74 points (Very Good)
- **3.5 Stars**: 45-59 points (Good)
- **3 Stars**: 30-44 points (Average)
- **2 Stars**: 15-29 points (Below Average)
- **1 Star**: 0-14 points (Poor)

---

## Error Handling

All tools return errors in this format:

```typescript
{
  content: [{
    type: "text",
    text: "Error: <error message>"
  }]
}
```

### Common Errors

- **Invalid URL**: Could not extract temple data from URL
- **Decode Failed**: Failed to decode temple data
- **Invalid Temple Data**: Temple data structure is invalid

---

## Usage Examples

### Claude Desktop Integration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "poe2-temple-analyzer": {
      "command": "node",
      "args": [
        "D:/CURSOR/sulozor.github.io-gh-pages/poe2-temple-analyzer/dist/index.js"
      ]
    }
  }
}
```

### In Claude

```
User: Analyze this temple: http://localhost:8080/#/temple?t=ABC123

Claude: [calls analyze_temple tool]
This temple has a score of 75/105 with 4 stars.
Suggestions: Consider adding more high-value rooms...
```

---

## Development

### Running Tests

```bash
cd poe2-temple-analyzer
npm test
npm run test:coverage
```

### Building

```bash
npm run build
npm start
```

### Viewing Documentation

- Main README: `../README.md`
- Architecture: `../docs/system-architecture.md`
- Development Guide: `../AGENTS.md`
- This API Reference: `docs/api-reference.md`
