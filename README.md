# Parallel CLI

[![npm](https://img.shields.io/npm/v/@rikalabs/parallel.svg)](https://www.npmjs.com/package/@rikalabs/parallel)
[![CI](https://github.com/Rika-Labs/parallel/actions/workflows/ci.yml/badge.svg)](https://github.com/Rika-Labs/parallel/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Unix-friendly CLI for the [Parallel](https://parallel.ai/) Search and Extract APIs.

Semantic search and content extraction that understands intent, not just keywords — right from your terminal.

## Install

```bash
bun install -g @rikalabs/parallel
```

## Setup

Get your API key at [parallel.ai](https://parallel.ai), then:

```bash
parallel config set-key --key <your-key>
```

## Search

```bash
parallel search --query "latest news about AI"
```

With agentic reasoning:

```bash
parallel search --query "compare React vs Vue" --mode agentic
```

## Extract

```bash
parallel extract --url https://example.com
```

With a specific objective:

```bash
parallel extract --url https://example.com --objective "find pricing"
```

## Batch Processing

```bash
# Multiple queries
parallel search --query "topic 1" --query "topic 2" --concurrency 5

# From stdin
cat urls.txt | parallel extract --stdin --concurrency 10
```

## Options

```
--format json|text    Output format (default: json)
--pretty              Pretty print output
--max-results N       Number of results (default: 10)
--concurrency N       Parallel requests (default: 5)
```

Run `parallel --help` for full documentation.

---

[Contributing](CONTRIBUTING.md) · [MIT License](LICENSE)
