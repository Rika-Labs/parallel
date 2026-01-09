# Parallel CLI

A semantic search and extraction tool for your terminal.

<br>

## Install

```bash
bun install -g @rikalabs/parallel
```

<br>

## Setup

Get your API key at [parallel.ai](https://parallel.ai), then:

```bash
parallel config set-key --key <your-key>
```

<br>

## Search

```bash
parallel search --query "latest news about AI"
```

With agentic reasoning:

```bash
parallel search --query "compare React vs Vue" --mode agentic
```

<br>

## Extract

```bash
parallel extract --url https://example.com
```

With a specific objective:

```bash
parallel extract --url https://example.com --objective "find pricing"
```

<br>

## Batch Processing

```bash
# Multiple queries
parallel search --query "topic 1" --query "topic 2" --concurrency 5

# From stdin
cat urls.txt | parallel extract --stdin --concurrency 10
```

<br>

## Options

```
--format json|text    Output format (default: json)
--pretty              Pretty print output
--max-results N       Number of results (default: 10)
--concurrency N       Parallel requests (default: 5)
```

<br>

---

[Contributing](CONTRIBUTING.md) · [License](LICENSE)
