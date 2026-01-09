# Contributing

## Quick Start

```bash
git clone https://github.com/Rika-Labs/parallel.git
cd parallel
bun install
bun test
```

## Development

```bash
# Run CLI locally
bun run dev -- search --query "test"
bun run dev -- extract --url https://example.com

# Run tests
bun test

# Run tests with coverage
bun test --coverage

# Lint
bun run lint

# Build
bun run build
```

## Project Structure

```
src/
├── cli/           # Command definitions (@effect/cli)
├── commands/      # Command handlers
├── config/        # API key & config management
├── output/        # Response formatting
├── parallel/      # API client
├── errors.ts      # Error types
└── index.ts       # Entry point

test/              # Tests (mirrors src/)
```

## Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for automatic releases.

```bash
feat: add new feature     # → Minor release
fix: bug fix              # → Patch release
docs: update readme       # → No release
chore: maintenance        # → No release
```

Breaking changes:
```bash
feat!: breaking change    # → Major release
```

## Testing

- All new features need tests
- Target 90%+ coverage
- Use Effect's `runPromiseExit` for error testing

```typescript
import { Effect, Cause } from "effect";

test("handles error", async () => {
  const result = await Effect.runPromiseExit(myEffect);
  expect(result._tag).toBe("Failure");
});
```

## Code Style

- Effect TS for all async/error handling
- `Effect.gen` for generator workflows
- Typed errors with `_tag` discriminator
- No `any` types
