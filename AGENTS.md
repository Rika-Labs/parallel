# Parallel CLI

Semantic search and content extraction tool.

## Commands

```bash
# Search the web
parallel search --query "your question" --format text

# Extract content from URL
parallel extract --url https://example.com --format text

# Agentic mode for complex queries
parallel search --query "compare X vs Y" --mode agentic
```

## Options

- `--format json|text` - Output format
- `--pretty` - Pretty print
- `--max-results N` - Number of results (default: 10)
- `--concurrency N` - Parallel requests (default: 5)
- `--objective "..."` - Extraction objective

## Examples

```bash
# Research a topic
parallel search --query "Effect TS best practices" --format text --pretty

# Extract specific info
parallel extract --url https://docs.example.com --objective "find API endpoints" --format text

# Batch process
parallel search --query "topic 1" --query "topic 2" --concurrency 5
```
