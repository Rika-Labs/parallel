# Parallel CLI - Project Guidelines

**Repository:** [Rika-Labs/parallel](https://github.com/Rika-Labs/parallel)

## Overview
A Unix-friendly CLI for the Parallel Search and Extract APIs, built with Bun, Effect TS, and Oxlint.

## Commands
- `bun run dev -- <args>` - Run CLI in development
- `bun run lint` - Lint with Oxlint (strict config)
- `bun run typecheck` - TypeScript strict mode check
- `bun test` - Run tests
- `bun test --coverage` - Run tests with coverage (target: 90%+)
- `bun run build` - Build for production

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

## CLI Usage

**Important**: Options must come before positional arguments.

```bash
# ✓ Correct
parallel search --mode agentic "query"
parallel extract --objective "goal" https://example.com

# ✗ Incorrect - options after positional args won't work
parallel search "query" --mode agentic
```

## API Key
Set via: `parallel config set-key <key>` or `PARALLEL_API_KEY` env var
