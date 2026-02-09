# Architecture Documentation

## System Overview

This repository contains two main components:

```
·----------------------------------·
|          Repository              |
·----------------------------------·
|                                  |
|  ·------------------------·     |
|  |   Static Website       |     |
|  |   (GitHub Pages)       |     |
|  ·------------------------·     |
|  | - index.html           |     |
|  | - temple-rating.html   |     |
|  | - test-rating.js       |     |
|  ·------------------------·     |
|                                  |
|  ·------------------------·     |
|  |  MCP Server            |     |
|  |  (poe2-temple-analyzer)|     |
|  ·------------------------·     |
|  | - TypeScript           |     |
|  | - MCP Protocol         |     |
|  | - Temple Analysis      |     |
|  ·------------------------·     |
|                                  |
·----------------------------------·
```

## Static Website

### Purpose
GitHub Pages-hosted visualization tool for PoE2 Temple layouts.

### Technology Stack
- HTML5
- Vanilla JavaScript
- No build step required

### File Structure
```
/
├── index.html           # Main entry point
├── temple-rating.html   # Temple rating UI
└── test-rating.js       # Test utilities
```

## MCP Server (poe2-temple-analyzer)

### Purpose
Model Context Protocol server that provides tools for analyzing PoE2 Vaal Temple layouts.

### Technology Stack
- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.0+
- **Protocol**: MCP (Model Context Protocol)
- **Transport**: stdio

### Architecture

```
·----------------------------------·
|         MCP Server               |
·----------------------------------·
|                                  |
|  ·------------------------·     |
|  |   MCP SDK Layer        |     |
|  |   (Protocol Handler)   |     |
|  ·------------------------·     |
|           |                      |
|           v                      |
|  ·------------------------·     |
|  |   Tool Handlers        |     |
|  |   - analyze_temple     |     |
|  |   - analyze_temple_data|     |
|  |   - get_room_info      |     |
|  |   - get_rating_criteria|     |
|  ·------------------------·     |
|           |                      |
|           v                      |
|  ·------------------------·     |
|  |   Core Analysis        |     |
|  |   - decodeTempleData   |     |
|  |   - analyzeTemple      |     |
|  |   - calculateRating    |     |
|  ·------------------------·     |
|                                  |
·----------------------------------·
```

### Data Flow

1. **Input**: Share URL or raw temple data
2. **Decode**: Extract and decode base-40 encoded temple data
3. **Parse**: Convert to internal TempleData structure
4. **Analyze**: Calculate metrics (room count, rewards, snake chain)
5. **Rate**: Compute star rating based on scoring algorithm
6. **Output**: Return structured analysis result

### Key Components

#### Room Types
```typescript
interface Room {
  x: number;
  y: number;
  room: string;
  tier?: number;
  roomTypeId?: number;
}
```

#### Temple Data
```typescript
interface TempleData {
  grid: { [key: string]: Room };
  decodedRooms?: Room[];
}
```

#### Analysis Result
```typescript
interface TempleAnalysis {
  roomCount: number;
  rewardRooms: number;
  starRating: number;
  totalScore: number;
  suggestions: string[];
}
```

### Scoring Algorithm

The star rating is calculated based on:

1. **Snake Score (0-40)**: Length of connected reward room chain
2. **Room Quality Score (0-45)**: Value of high-tier rooms (T7, T6, Spymasters)
3. **Quantity Score (0-15)**: Total reward room density

**Total Score**: 0-100

**Star Mapping**:
- 5 stars: 75-100
- 4.5 stars: 60-74
- 4 stars: 50-59
- 3.5 stars: 38-49
- 3 stars: 26-37
- 2 stars: 16-25
- 1 star: 0-15

## Integration

### MCP Configuration

Add to Claude Desktop or other MCP client:

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

## Development Workflow

```
·--------·    ·------------·    ·--------·
|  Edit  | -> |   Test     | -> | Commit |
·--------·    ·------------·    ·--------·
   |               |               |
   v               v               v
TypeScript    Jest Tests    Conventional
   +               +            Commits
ESLint        Coverage      Pre-commit
Prettier      Thresholds    Hooks
```

## Deployment

### Static Website
- **Platform**: GitHub Pages
- **Branch**: `master`
- **Auto-deploy**: On push to master

### MCP Server
- **Distribution**: npm package (future)
- **Installation**: Clone and build locally
- **Updates**: Manual pull and rebuild

## Security Considerations

- No sensitive data stored
- Input validation on all share URLs
- No external API calls
- Local processing only
