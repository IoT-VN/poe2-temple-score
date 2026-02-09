# PoE2 Temple Analyzer MCP Server

MCP (Model Context Protocol) Server for analyzing PoE2 Vaal Temple layouts and calculating star ratings.

## Features

- **Analyze Temple Layouts**: Parse share URLs and extract temple data
- **Star Rating System**: Calculate 1-5 star ratings based on layout quality
- **Tech Detection**: Identify Russian Tech, Roman Road, and other patterns
- **Reward Analysis**: Calculate reward density and room distribution
- **Suggestions**: Get improvement recommendations

## Rating Criteria

The star rating is calculated based on two main factors:

### 1. Reward Layout Score (0-40 points)
Based on reward room density (% of total rooms that are reward rooms)
- Formula: `min(40, rewardDensity * 0.8)`

### 2. Tech Score (0-60 points)
| Tech | Points | Condition |
|------|--------|-----------|
| Russian Tech | 30 | Perfect straight line path (deviation <= 0.5) |
| Roman Road | 20 | Near-straight path (deviation <= 1.5) |
| Straight Line | 10 | Basic straight line detected |
| High Reward Density | 10-20 | 50%+ reward density bonus |
| Architect Placement | 10 | 2+ architect rooms |

### Star Rating Scale
| Stars | Score Range | Description |
|-------|-------------|-------------|
| ⭐⭐⭐⭐⭐ | 90-100 | God Tier - Perfect layout |
| ⭐⭐⭐⭐½ | 75-89 | Excellent |
| ⭐⭐⭐⭐ | 60-74 | Very Good |
| ⭐⭐⭐½ | 45-59 | Good |
| ⭐⭐⭐ | 30-44 | Average |
| ⭐⭐½ | 15-29 | Below Average |
| ⭐⭐ | 0-14 | Poor |

## Available Tools

### analyze_temple
Analyze a PoE2 Vaal Temple layout from a share URL.

**Input:**
```json
{
  "shareUrl": "http://localhost:8080/#/atziri-temple?t=AEghSCFIIjFoMSF6cHpwaTESEkhwc..."
}
```

### analyze_temple_data
Analyze temple data directly from decoded JSON structure.

**Input:**
```json
{
  "templeData": {
    "grid": {
      "0,0": { "x": 0, "y": 0, "room": "entry" },
      "1,0": { "x": 1, "y": 0, "room": "alchemy_lab" }
    }
  }
}
```

### get_room_info
Get information about a specific room type.

**Input:**
```json
{
  "roomType": "vault"
}
```

### get_rating_criteria
Get the criteria and formulas used for calculating star ratings.

## Room Types

| Room | Type | Reward Value |
|------|------|--------------|
| alchemy_lab | reward | 3 |
| armoury | reward | 2 |
| flesh_surgeon | reward | 3 |
| reward_currency | reward | 4 |
| smithy | reward | 2 |
| synthflesh | reward | 3 |
| thaumaturge | reward | 2 |
| vault | reward | 4 |
| viper_spymaster | reward | 3 |
| commander | architect | 0 |
| architect | architect | 0 |
| atziri | boss | 0 |

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
npm start
```

## Integration with Claude

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "poe2-temple-analyzer": {
      "command": "node",
      "args": ["/path/to/dist/index.js"]
    }
  }
}
```

