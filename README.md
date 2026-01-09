# Parallel CLI

[![GitHub](https://img.shields.io/badge/GitHub-Rika--Labs%2Fparallel-black.svg)](https://github.com/Rika-Labs/parallel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Effect](https://img.shields.io/badge/Effect-3.19-purple.svg)](https://effect.website)

A Unix-friendly CLI for the Parallel Search and Extract APIs, built with [Bun](https://bun.sh), [Effect TS](https://effect.website), and [Oxlint](https://oxc.rs/docs/guide/usage/linter.html).

## Features

- **Semantic Search**: Declarative objectives instead of just keywords
- **Content Extraction**: Clean markdown from URLs and PDFs
- **Batch Processing**: Parallelize multiple queries with bounded concurrency
- **Config Management**: Securely manage your API key globally
- **Unix Composable**: Works great with `stdin`, `stdout`, and pipes
- **Type-Safe**: Built entirely with Effect TS for robust error handling

## Quick Start

```bash
# Set your API key
parallel config set-key <your-key>

# Search
parallel search "What is declarative semantic search?"

# Extract (options before URLs)
parallel extract --objective "Find pricing" https://docs.parallel.ai/home
```

> **Note**: Options must come before positional arguments (query/URLs).

## Installation

```bash
# Clone and install dependencies
bun install

# Build the CLI
bun run build

# The binary is at dist/index.js
# Link it globally or alias to 'parallel'
```

## Usage

### Configuration

```bash
# Set API key (stored securely in ~/Library/Application Support/parallel/)
parallel config set-key <key>

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

Options must come **before** the query argument.

```bash
# Basic search
parallel search "Effect TS best practices"

# Agentic mode (multi-step reasoning)
parallel search --mode agentic "Compare React and Vue"

# Control results
parallel search --max-results 20 --excerpt-chars 3000 "TypeScript tips"

# Text format output
parallel search --format text "Bun runtime"

# Pretty JSON
parallel search --pretty "Effect TS examples"

# Combined options
parallel search --mode agentic --max-results 5 --format text "AI trends 2024"
```

### Extract

Options must come **before** the URL arguments.

```bash
# Extract from URL
parallel extract https://example.com

# With objective
parallel extract --objective "Find error handling patterns" https://docs.effect.website

# Full content extraction
parallel extract --full-content https://example.com

# Multiple URLs with options
parallel extract --format text --concurrency 3 https://a.com https://b.com https://c.com
```

### Batch Processing

```bash
# Batch search from file
cat objectives.txt | parallel search --stdin --concurrency 10

# Batch extract
cat urls.txt | parallel extract --stdin --concurrency 5 --format text

# Pipe to other tools
parallel search --format json "API design" | jq '.results[].url'
```

## Development

```bash
# Run in development
bun run dev -- search "test query"

# Lint (Oxlint)
bun run lint

# Type check
bun run typecheck

# Run tests
bun test

# Coverage (enforced 90%+)
bun test --coverage
```

## Architecture

Built with functional programming principles using Effect TS:

- **Error Handling**: Typed errors (`CliError`, `ApiError`, `ConfigError`) with Effect's error channel
- **Concurrency**: Effect's `forEach` with bounded concurrency for batch operations  
- **Configuration**: Effect-based file I/O with proper resource management
- **CLI**: `@effect/cli` for declarative command parsing

## API Reference

This CLI wraps the Parallel v1beta Search and Extract endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1beta/search` | POST | Semantic web search |
| `/v1beta/extract` | POST | Content extraction from URLs |

Required header: `parallel-beta: search-extract-2025-10-10`

## License

MIT © [Rika Labs](https://github.com/Rika-Labs)

See [LICENSE](LICENSE) for details.
