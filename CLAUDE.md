# Parallel CLI - Project Guidelines

**Repository:** [Rika-Labs/parallel](https://github.com/Rika-Labs/parallel)

## Overview
A Unix-friendly CLI for the [Parallel](https://parallel.ai/) Search and Extract APIs.

## Tech Stack
- **Runtime**: Bun
- **Core**: Effect TS, @effect/cli
- **Linting**: Oxlint
- **Git Hooks**: Husky + lint-staged

## Commands
- `bun run dev -- <args>` - Run CLI in development
- `bun run lint` - Lint with Oxlint (strict config)
- `bun test` - Run tests
- `bun test --coverage` - Run tests with coverage (target: 90%+)
- `bun run build` - Build for production

## CLI Usage

All inputs use explicit flags:

```bash
# Search
parallel search --query "your search query" --mode agentic --max-results 10
parallel search --query "query 1" --query "query 2" --concurrency 2

# Extract
parallel extract --url https://example.com --objective "Find pricing"
parallel extract --url https://a.com --url https://b.com --format text

# Config
parallel config set-key --key <api-key>
parallel config get-key
```

## Code Standards

### Effect TS Patterns
- Use `Effect.gen` for generator-based workflows
- Use `Effect.tryPromise` for external async calls with typed errors
- Use `Effect.forEach` with `{ concurrency }` for bounded parallel operations
- Errors should extend `Error` with `_tag` discriminator
- Prefer `Effect.orElseSucceed`, `Effect.catchAll` for error recovery
- Use `Option` for optional values, never `undefined | T`

### TypeScript
- Strict mode enabled
- `noUncheckedIndexedAccess: true`
- All tests must be type-safe (no `any`)
- Use discriminated unions for error types

### Testing
- All mocks must be properly typed
- Use `Effect.runPromise` / `Effect.runPromiseExit` for testing Effects
- Use `Cause.failureOption` for type-safe error assertions
- Target 90%+ line coverage

### Oxlint
- Strict config in `oxlint.json`
- No `var`, prefer `const`
- Use template literals
- Arrow functions preferred
- No nested ternaries

## File Structure
```
src/
  cli/          # @effect/cli command definitions
  commands/     # Command handlers
  config/       # Configuration management
  output/       # Response formatting
  parallel/     # API client
  errors.ts     # Error types
  index.ts      # Entry point
test/           # Tests mirror src structure
```

## Commit Convention

Uses [Conventional Commits](https://www.conventionalcommits.org/) for automatic releases:

```bash
feat: ...     # Minor release (0.x.0)
fix: ...      # Patch release (0.0.x)
perf: ...     # Patch release (0.0.x)
feat!: ...    # Major release (breaking change)
docs: ...     # No release
chore: ...    # No release
```

Commits are validated by commitlint via Husky.

## API Key
Set via: `parallel config set-key --key <key>` or `PARALLEL_API_KEY` env var
