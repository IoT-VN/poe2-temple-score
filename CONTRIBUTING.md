# Contributing to PoE2 Temple Score

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/IoT-VN/poe2-temple-score.git
   cd poe2-temple-score
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd poe2-temple-analyzer && npm install
   ```

3. **Set up pre-commit hooks**
   ```bash
   npm run prepare
   ```

## Development Workflow

### Making Changes

1. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards

3. Run quality checks:
   ```bash
   npm run lint
   npm run format:check
   npm test
   npm run build
   ```

4. Commit with a descriptive message following conventional commits:
   ```bash
   git commit -m "feat(analyzer): add new room type detection"
   ```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

Example:
```
feat(analyzer): add support for T8 rooms

- Add T8 room type definitions
- Update scoring algorithm for T8 bonuses
- Add tests for T8 room detection
```

## Code Standards

### TypeScript

- Use strict mode
- Explicit return types on exported functions
- No `any` types without justification
- Interface definitions for all data structures

### Testing

- Write tests for new features
- Maintain minimum 50% coverage
- Use descriptive test names

### Documentation

- Update AGENTS.md if changing development workflow
- Update architecture.md for structural changes
- Add JSDoc comments for public APIs

## Pull Request Process

1. Ensure all checks pass (CI will run automatically)
2. Fill out the pull request template completely
3. Request review from maintainers
4. Address review feedback
5. Squash commits if requested

## Reporting Issues

Use the GitHub issue templates for:

- **Bug reports**: Describe the problem, steps to reproduce, expected behavior
- **Feature requests**: Describe the feature, use case, and proposed solution

## Questions?

Check [AGENTS.md](AGENTS.md) for detailed development information or open an issue for discussion.
