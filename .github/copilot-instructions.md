# Review Guidelines

## Review Philosophy

- Only comment when you have HIGH CONFIDENCE (>80%) that an issue exists
- Be concise: one sentence per comment when possible
- Focus on actionable feedback, not observations
- When reviewing text, only comment on clarity issues if the text is genuinely confusing or could lead to errors.

## Project-Specific Context

- TypeScript facade tree project (v0.1.0) using dynamic function nodes
- Core elements: Store, Runner, Hook with meta.facade interface, the facade tree emulates a DOM-like structure.
- Tech stack: TS, Vite build, Biome (4-space indent), pnpm.
- Critical rules: Prefer use GeneralObject for dynamic access, implement GeneralElement for elements.
- Testing: Must verify silent behavior with vi.spyOn(console, 'warn'), tests check behavior, not implementation

## Priority Areas (Review These)

### Security & Safety

- Unsafe code blocks without justification
- Command injection risks (shell commands, user input)
- Path traversal vulnerabilities
- Credential exposure or hardcoded secrets
- Missing input validation on external data
- Improper error handling that could leak sensitive info
- New features missing corresponding tests
- Insufficient tests or test overreach

### Correctness Issues

- Logic errors that could cause panics or incorrect behavior
- Race conditions in async code
- Resource leaks (files, connections, memory)
- Off-by-one errors or boundary conditions
- Optional types that don’t need to be optional
- Error context that doesn’t add useful information
- Overly defensive code with unnecessary checks
- Unnecessary comments that restate obvious code behavior

### Architecture & Patterns

- Code that violates existing patterns in the codebase
- Missing error handling
- Async/await misuse or blocking operations in async contexts

## CI Pipeline Context

**Important**: You review PRs immediately, before CI completes. Do not flag issues that CI will catch.

### What Our CI for PRs Checks (`.github/workflows/ci-pr.yml`)

- pnpm check (type check and linting)
- pnpm build (test build)
- pnpm test (whole test suite if PR touches src or tests)

**Setup steps CI performs:**

- Installs system dependencies
- Runs pnpm ci
- Snyc vulnerability checks
- Dependency (Dependabot)

## Skip These (Low Value)

Do not comment on:

- Style/formatting/linting (biome)
- Test failures
- Missing dependencies (ci covers this)
- Minor naming suggestions
- Suggestions to add comments
- Refactoring unless addressing a real bug
- Multiple issues in one comment
- Logging suggestions unless security-related
- Pedantic text accuracy unless it affects meaning

## Response Format

1. State the problem (1 sentence)
2. Why it matters (1 sentence, if needed)
3. Suggested fix (snippet or specific action)

Example:
This could panic if the vector is empty. Consider using `.get(0)` or adding a length check.

## When to Stay Silent

If you’re uncertain whether something is an issue, don’t comment.