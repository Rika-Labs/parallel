# Parallel CLI

[![npm](https://img.shields.io/npm/v/@rika-labs/parallel-cli.svg)](https://www.npmjs.com/package/@rika-labs/parallel-cli)
[![GitHub](https://img.shields.io/badge/GitHub-Rika--Labs%2Fparallel-black.svg)](https://github.com/Rika-Labs/parallel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/Rika-Labs/parallel/actions/workflows/ci.yml/badge.svg)](https://github.com/Rika-Labs/parallel/actions/workflows/ci.yml)

A Unix-friendly CLI for the [Parallel](https://parallel.ai/) Search and Extract APIs.

[Parallel](https://parallel.ai/) provides semantic search and content extraction APIs that understand intent, not just keywords. This CLI brings those capabilities to your terminal with full Unix composability.

## Features

- **Semantic Search**: Declarative objectives instead of just keywords
- **Content Extraction**: Clean markdown from URLs and PDFs
- **Batch Processing**: Parallelize multiple queries with bounded concurrency
- **Config Management**: Securely manage your API key globally
- **Unix Composable**: Works great with `stdin`, `stdout`, and pipes

## Quick Start

```bash
# Set your API key (get one at https://parallel.ai/)
parallel config set-key --key <your-key>

# Search
parallel search --query "What is declarative semantic search?"

# Extract
parallel extract --url https://docs.parallel.ai/home --objective "Find pricing"
```

## Installation

### Via npm (recommended)

```bash
# Install globally
npm install -g @rika-labs/parallel-cli

# Or with bun
bun install -g @rika-labs/parallel-cli
```

### From source

```bash
# Clone and install dependencies
git clone https://github.com/Rika-Labs/parallel.git
cd parallel
bun install

# Build the CLI
bun run build

# Add alias to your shell profile
echo 'alias parallel="bun $(pwd)/dist/index.js"' >> ~/.zshrc
source ~/.zshrc
```

## Usage

### Configuration

```bash
# Set API key (stored securely in ~/Library/Application Support/parallel/)
parallel config set-key --key <key>

# View current API key
parallel config get-key

# Remove API key
parallel config unset-key

# Show config file path
parallel config path

# Or use environment variable
export PARALLEL_API_KEY=<key>
```

### Search

```bash
# Basic search
parallel search --query "Effect TS best practices"

# Agentic mode (multi-step reasoning)
parallel search --query "Compare React and Vue" --mode agentic

# Control results
parallel search --query "TypeScript tips" --max-results 20 --excerpt-chars 3000

# Text format output
parallel search --query "Bun runtime" --format text

# Pretty JSON
parallel search --query "Effect TS examples" --pretty

# Multiple queries
parallel search --query "React hooks" --query "Vue composition API" --concurrency 2
```

### Extract

```bash
# Extract from URL
parallel extract --url https://example.com

# With objective
parallel extract --url https://docs.effect.website --objective "Find error handling patterns"

# Full content extraction
parallel extract --url https://example.com --full-content

# Multiple URLs
parallel extract --url https://a.com --url https://b.com --url https://c.com --concurrency 3

# Text format
parallel extract --url https://example.com --format text --pretty
```

### Batch Processing

```bash
# Batch search from file (one query per line)
cat queries.txt | parallel search --stdin --concurrency 10

# Batch extract (one URL per line)
cat urls.txt | parallel extract --stdin --concurrency 5 --format text

# Pipe to other tools
parallel search --query "API design" --format json | jq '.results[].url'
```

## API Reference

This CLI wraps the [Parallel](https://parallel.ai/) v1beta endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1beta/search` | POST | Semantic web search |
| `/v1beta/extract` | POST | Content extraction from URLs |

Get your API key at [parallel.ai](https://parallel.ai/).

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Bun](https://bun.sh) | Runtime & bundler |
| [Effect TS](https://effect.website) | Functional effects, error handling, concurrency |
| [@effect/cli](https://github.com/Effect-TS/effect/tree/main/packages/cli) | Declarative CLI parsing |
| [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) | Fast linting |
| [Husky](https://typicode.github.io/husky/) | Git hooks |

## Development

```bash
# Run in development
bun run dev -- search --query "test"

# Lint
bun run lint

# Run tests
bun test

# Coverage (90%+ enforced)
bun test --coverage

# Build
bun run build
```

## Architecture

Built with functional programming principles:

- **Typed Errors**: `CliError`, `ApiError`, `ConfigError` with Effect's error channel
- **Bounded Concurrency**: Effect's `forEach` for parallel batch operations
- **Secure Config**: Effect-based file I/O with proper permissions

## Contributing

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to automate releases.

### Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types & Release Behavior

| Type | Description | Release |
|------|-------------|---------|
| `feat` | New feature | **Minor** (0.x.0) |
| `fix` | Bug fix | **Patch** (0.0.x) |
| `perf` | Performance improvement | **Patch** (0.0.x) |
| `docs` | Documentation only | No release |
| `style` | Code style changes | No release |
| `refactor` | Code refactor | No release |
| `test` | Adding/updating tests | No release |
| `build` | Build system changes | No release |
| `ci` | CI configuration | No release |
| `chore` | Maintenance | No release |

### Breaking Changes

Add `!` after type or include `BREAKING CHANGE:` in footer for **major** release:

```bash
feat!: remove deprecated --objective flag
# or
feat: new search API

BREAKING CHANGE: removed --objective in favor of --query
```

### Examples

```bash
git commit -m "feat: add --verbose flag for detailed output"
git commit -m "fix: handle empty query gracefully"
git commit -m "docs: update installation instructions"
```

## License

MIT © [Rika Labs](https://github.com/Rika-Labs)

See [LICENSE](LICENSE) for details.
