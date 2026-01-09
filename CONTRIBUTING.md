# Contributing

Thanks for your interest in contributing to Parallel CLI!

## Development

```bash
# Clone and install
git clone https://github.com/Rika-Labs/parallel.git
cd parallel
bun install

# Run in development
bun run dev -- search --query "test"

# Lint
bun run lint

# Run tests
bun test

# Build
bun run build
```

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automated releases.

```
<type>(<scope>): <description>
```

### Types

| Type | Description | Release |
|------|-------------|---------|
| `feat` | New feature | Minor (0.x.0) |
| `fix` | Bug fix | Patch (0.0.x) |
| `perf` | Performance improvement | Patch (0.0.x) |
| `docs` | Documentation only | No release |
| `style` | Code style changes | No release |
| `refactor` | Code refactor | No release |
| `test` | Adding/updating tests | No release |
| `build` | Build system changes | No release |
| `ci` | CI configuration | No release |
| `chore` | Maintenance | No release |

### Breaking Changes

Add `!` after type for a major release:

```bash
feat!: remove deprecated flag
```

### Examples

```bash
git commit -m "feat: add --verbose flag"
git commit -m "fix: handle empty query"
git commit -m "docs: update examples"
```

## Architecture

Built with [Effect TS](https://effect.website) for functional programming:

- **Typed Errors**: `CliError`, `ApiError`, `ConfigError`
- **Bounded Concurrency**: Effect's `forEach` for parallel operations
- **Secure Config**: Effect-based file I/O

## Tech Stack

- [Bun](https://bun.sh) — Runtime & bundler
- [Effect TS](https://effect.website) — Functional effects
- [@effect/cli](https://github.com/Effect-TS/effect/tree/main/packages/cli) — CLI parsing
- [Oxlint](https://oxc.rs) — Linting
