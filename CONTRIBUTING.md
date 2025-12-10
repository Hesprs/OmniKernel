# Contributing to OmniKernel

Thank you for your interest in contributing to OmniKernel! This guide outlines the processes and standards for contributing to the project.

## Development Setup

### Prerequisites

- `Node.js >= 18`
- `pnpm @10.24.0`

### Setup Instructions

Please fork this project in GitHub first.

```bash
# Clone the repository
git clone <link-to-your-fork>
cd OmniKernel

# Install dependencies
pnpm install

# Verify setup
pnpm check  # Runs type and lint checking
pnpm test   # Executes all unit tests
```

## Coding Standards

### TypeScript

- Use `@` path alias for importing core modules (e.g., `import { OmniKernel } from '@'`)
- Maintain camelCase for variable names and PascalCase for class and type names

### Code Structure

- New elements should be placed in `src/elements/`
- Utilities should go in `src/utilities/`
- All exported symbols must be re-exported through `src/index.ts`

## Testing Guidelines

### Test Coverage Requirements

All contributions must include:
- Tests for new features
- Integration tests for complex interactions where necessary

Don't try to pass CI by deleting tests.

### Test Structure

- Follow existing test patterns in `tests/` directory
- Ensure 95%+ coverage for new functionality

## Commit and Pull Requests

### Commit Message

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Pull Request Process

1. Create a new branch (`git checkout -b feat/your-feature`)
2. Implement your changes with proper tests
3. Run `pnpm check` and `pnpm test` to verify
4. Commit with conventional commit message
5. Push to your fork and submit a PR
6. Ensure all CI checks pass

### CI

This project has two CI pipelines:
- `ci-main.yml`: runs on every push to main branch, which is used for coverage reporting
- `ci-pr.yml`: runs on every pull request that you will be majorly dealing with, which is used for testing pull requests

What our CI checks:
- lint
- types
- test build
- (if `/src` or `/tests` changes) tests

## Documentation

- Update relevant documentation when adding new features
- `TODO.md` is used by maintainers to show what they are currently focusing on. Your contribution is not limited to tasks in it.

## License

By contributing, you agree that your contributions will be licensed under the project's Apache License 2.0.