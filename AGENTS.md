# AGENTS.md - Agent Development Guide

This document provides essential information for AI agents working on this repository.

## Repository Overview

This is a monorepo containing:
1. **Static Website** (root) - GitHub Pages site for PoE2 Temple visualization
2. **poe2-temple-analyzer** - MCP Server for analyzing PoE2 Vaal Temple layouts

## Quick Start

### poe2-temple-analyzer (TypeScript MCP Server)

```bash
cd poe2-temple-analyzer
npm install
npm run build
npm start
```

### Static Website (Root)

No build step required. Serve with any static file server:

```bash
npx serve .
```

## Available Scripts

### poe2-temple-analyzer

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to dist/ |
| `npm start` | Run compiled MCP server |
| `npm run dev` | Run with ts-node for development |
| `npm test` | Run test suite |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without writing |

### Root

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint on HTML/JS files |
| `npm run format` | Format code with Prettier |

## Project Structure

```
.
├── index.html              # Main GitHub Pages site
├── temple-rating.html      # Temple rating UI
├── test-rating.js          # Rating test utilities
├── poe2-temple-analyzer/   # MCP Server
│   ├── src/
│   │   └── index.ts        # Main MCP server implementation
│   ├── dist/               # Compiled JavaScript
│   ├── package.json
│   └── tsconfig.json
└── .github/                # GitHub configuration
    ├── workflows/          # CI/CD workflows
    ├── ISSUE_TEMPLATE/     # Issue templates
    └── CODEOWNERS          # Code ownership
```

## Development Conventions

### Naming Conventions

- **Files**: Use kebab-case for filenames (e.g., `temple-analyzer.ts`)
- **Functions**: Use camelCase (e.g., `analyzeTemple()`)
- **Interfaces/Types**: Use PascalCase (e.g., `TempleData`)
- **Constants**: Use UPPER_SNAKE_CASE for true constants

### TypeScript Standards

- Strict mode enabled
- Explicit return types on exported functions
- Interface definitions for all data structures
- No `any` types without explicit justification comment

### Code Style

- 2-space indentation
- Single quotes for strings
- Semicolons required
- Max line length: 100 characters
- Trailing commas in multi-line objects/arrays

## Testing

Tests are located in `__tests__/` directories or as `*.test.ts` files.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Environment Variables

Copy `.env.example` to `.env` and fill in required values:

```bash
cp .env.example .env
```

See `.env.example` for available environment variables.

## Pull Request Process

1. Create a feature branch from `master`
2. Make your changes
3. Run linting: `npm run lint`
4. Run formatting: `npm run format`
5. Run tests: `npm test`
6. Commit with conventional commit format
7. Push and create PR

## Commit Message Format

Follow conventional commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(analyzer): add room type validation`
- `fix(rating): correct score calculation for T7 rooms`
- `docs: update AGENTS.md with testing info`

## Troubleshooting

### Build Errors

If TypeScript compilation fails:
```bash
rm -rf dist/
npm run build
```

### Dependency Issues

```bash
rm -rf node_modules package-lock.json
npm install
```

## Resources

- [MCP SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)
- [PoE2 Temple Mechanics](https://poe2-temple-analyzer/README.md)
