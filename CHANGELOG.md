# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive test suite with 120 tests and 93%+ code coverage
- Security enhancements (XSS protection, input validation)
- Modular architecture (refactored from 732-line monolithic file)
- JSDoc documentation for all public APIs
- Integration tests for MCP tools
- Security tests (XSS, injection, DoS prevention)

### Changed
- Improved code organization into focused modules
- Enhanced error handling and validation
- Better type safety with TypeScript
- Optimized DOM manipulation in static website

### Fixed
- XSS vulnerability in suggestions rendering (temple-rating.html)
- Removed unused code and variables (3 unused functions, 163 lines)
- Fixed ESLint warnings

### Security
- Added URL validation to prevent protocol-based XSS attacks
- Replaced `innerHTML` with `textContent` for user content
- Wrapped JavaScript in IIFE to prevent global namespace pollution

## [1.0.0] - 2025-01-15

### Added
- Initial release
- Temple analysis from share URLs
- Star rating calculation (1-5 stars)
- Tech pattern detection (Russian Tech, Roman Road)
- MCP server integration
- Static website for temple visualization
- Base-40 charset decoding with auto-detection
- Room type definitions for PoE2 temples

### Features
- Analyze PoE2 Vaal Temple layouts
- Calculate snake chain scores
- Identify high-value rooms (Spymasters, Golems, Vaults)
- Generate improvement suggestions
- Export/import temple data
- Share URL generation

[Unreleased]: https://github.com/IoT-VN/poe2-temple-score/compare/v1.0.0...HEAD
[v1.0.0]: https://github.com/IoT-VN/poe2-temple-score/releases/tag/v1.0.0
