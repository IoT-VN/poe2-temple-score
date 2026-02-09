# PoE2 Temple Score

[![CI](https://github.com/IoT-VN/poe2-temple-score/actions/workflows/ci.yml/badge.svg)](https://github.com/IoT-VN/poe2-temple-score/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/IoT-VN/poe2-temple-score/branch/master/graph/badge.svg)](https://codecov.io/gh/IoT-VN/poe2-temple-score)

Tools for analyzing Path of Exile 2 Vaal Temple layouts and calculating star ratings.

## Overview

This repository contains:

1. **[Static Website](index.html)** - GitHub Pages site for temple visualization
2. **[MCP Server](poe2-temple-analyzer/)** - Model Context Protocol server for temple analysis

## Quick Start

### MCP Server

```bash
cd poe2-temple-analyzer
npm install
npm run build
npm start
```

### Static Website

Open `index.html` in your browser or serve with any static file server:

```bash
npx serve .
```

## Features

- **Temple Analysis**: Parse share URLs and extract temple data
- **Star Rating System**: Calculate 1-5 star ratings based on layout quality
- **Tech Detection**: Identify Russian Tech, Roman Road, and other patterns
- **Reward Analysis**: Calculate reward density and room distribution
- **Suggestions**: Get improvement recommendations

## Documentation

- [AGENTS.md](AGENTS.md) - Development guide for AI agents
- [Architecture](docs/architecture.md) - System architecture and design
- [MCP Server README](poe2-temple-analyzer/README.md) - Detailed MCP server documentation

## Development

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
# Install dependencies
npm install
cd poe2-temple-analyzer && npm install

# Run linting
npm run lint

# Run tests
npm test

# Build
npm run build
```

See [AGENTS.md](AGENTS.md) for complete development guidelines.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Path of Exile 2 is a trademark of Grinding Gear Games
- This is an unofficial community tool
